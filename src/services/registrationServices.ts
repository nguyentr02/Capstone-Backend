import { Registration } from '@prisma/client';
import { prisma } from '../config/prisma';
import { RegistrationDto } from '../types/registrationTypes';

export class RegistrationService {
    /**
     * 01 - Register a participant for an event
     */
    static async registerForEvent(registrationData: RegistrationDto) {
        const event = await prisma.event.findUnique({ 
            where: { id: registrationData.eventId },
            include: {
                tickets: true,
                eventQuestions: { include: { question: true }}
            }});

        if (!event) {
            throw new Error('Event not found');
        }

        // Check if the event is full
        const totalRegistrations = await prisma.registration.count({
            where: { eventId: registrationData.eventId }
        });

        if (totalRegistrations >= event.capacity) {
            throw new Error('Event is full');
        }

        // Validate ticket data if event is paid
        if (!event.isFree) {
            // Ticket must be selected
            if (!registrationData.ticketId || !registrationData.quantity) 
                throw new Error('Ticket and quantity are required for paid events');

            // Find the ticket
            const ticket = event.tickets.find(ticket => {ticket.id === registrationData.ticketId});
            if (!ticket) {
                throw new Error('Ticket not found');
            }

            // Check ticket availability (quantity)
            if (ticket.quantitySold + registrationData.quantity > ticket.quantityTotal) {
                throw new Error('Selected ticket quantity not available');
            }
        }

        // Validate responses against event questions
        const requiredQuestions = event.eventQuestions
            .filter(eq => eq.isRequired)
            .map(eq => eq.questionId);

        const providedQuestionIds = new Set(registrationData.responses.map(r => r.questionId));

        for (const reqId of requiredQuestions) {
            const eventQuestion = event.eventQuestions.find(eq => eq.questionId === reqId);
            if (!eventQuestion) continue; // Should not happen if data is consistent

            const question = event.eventQuestions.find(eq => eq.questionId === reqId)?.question;
            if (!question) continue; // Should not happen

            if (!providedQuestionIds.has(reqId)) {
                 throw new Error(`Response required for question: "${question.questionText}"`);
            }
            // Check if response text is empty for required questions
            const response = registrationData.responses.find(r => r.questionId === reqId);
            if (response && response.responseText.trim() === '') {
                throw new Error(`Response cannot be empty for required question: "${question.questionText}"`);
            }
        }

        // Check if all provided question IDs belong to the event
        const validQuestionIds = new Set(event.eventQuestions.map(eq => eq.questionId));
        for (const providedId of providedQuestionIds) {
            if (!validQuestionIds.has(providedId)) {
                throw new Error(`Invalid question ID provided: ${providedId}`);
            }
        }


        // Use a transaction to ensure atomicity
        return prisma.$transaction(async (tx) => {
            // 1. Find or create participant
            let participant = await tx.participant.findUnique({
                where: { email: registrationData.participant.email }
            });

            if (!participant) {
                participant = await tx.participant.create({
                    data: {
                        ...registrationData.participant,
                        // Ensure dateOfBirth is handled correctly (string vs Date)
                        dateOfBirth: registrationData.participant.dateOfBirth ? new Date(registrationData.participant.dateOfBirth) : null,
                    }
                });
            } else {
                // Optionally update participant details if they already exist?
                // For now, we just use the existing participant.
            }

            // 2. Create Registration
            const registration = await tx.registration.create({
                data: {
                    eventId: registrationData.eventId,
                    participantId: participant.id,
                    // Link to user if participant is associated with a user account
                    userId: participant.userId,
                    status: 'CONFIRMED' // Assuming direct confirmation for now
                }
            });

            // 3. Handle Purchase and Ticket Update (if paid event)
            let purchase = null;
            if (!event.isFree && registrationData.ticketId && registrationData.quantity) {
                const ticket = event.tickets.find(t => t.id === registrationData.ticketId);
                if (!ticket) {
                    // This check is technically redundant due to the earlier check, but good for safety
                    throw new Error('Ticket not found within transaction');
                }

                // Create Purchase
                purchase = await tx.purchase.create({
                    data: {
                        registrationId: registration.id,
                        ticketId: registrationData.ticketId,
                        quantity: registrationData.quantity,
                        unitPrice: ticket.price,
                        // Convert Decimal to number for calculation
                        totalPrice: ticket.price.toNumber() * registrationData.quantity,
                    }
                });

                // Update Ticket quantitySold
                await tx.ticket.update({
                    where: { id: registrationData.ticketId },
                    data: {
                        quantitySold: {
                            increment: registrationData.quantity
                        }
                    }
                });

                // TODO: Potentially create a Payment record here or trigger payment flow
            }

            // 4. Create Responses
            const responseCreates = registrationData.responses.map(response => {
                const eventQuestion = event.eventQuestions.find(eq => eq.questionId === response.questionId);
                if (!eventQuestion) {
                    // Should not happen due to earlier validation
                    throw new Error(`EventQuestion mapping not found for questionId: ${response.questionId}`);
                }
                return tx.response.create({
                    data: {
                        registrationId: registration.id,
                        eqId: eventQuestion.id, // Use the EventQuestions ID
                        responseText: response.responseText
                    }
                });
            });

            await Promise.all(responseCreates);

            // Return the created registration with related data
            return tx.registration.findUnique({
                where: { id: registration.id },
                include: {
                    participant: true,
                    event: true,
                    purchase: { include: { ticket: true } },
                    responses: { include: { eventQuestion: { include: { question: true } } } }
                }
            });
        });
    }

    // TODO: Add methods for getRegistrations, getRegistrationById, cancelRegistration etc.
}
