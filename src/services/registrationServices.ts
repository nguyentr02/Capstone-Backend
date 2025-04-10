import { Registration, UserRole, Prisma } from '@prisma/client'; 
import { prisma } from '../config/prisma';
import { RegistrationDto } from '../types/registrationTypes';
import { ParticipantService } from './participantServices'; // Import ParticipantService
import { AppError } from '../utils/errors'; // Import AppError
import { JwtPayload } from '../types/authTypes'; // For authenticated user type

// Define type for query parameters validated by Joi
interface GetRegistrationsQuery {
    eventId?: number;
    userId?: number;
    page: number;
    limit: number;
}

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
                // For now, just use the existing participant.
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

    /**
     * Retrieves a paginated list of registrations based on filters and authorization.
     */
    static async getRegistrations(query: GetRegistrationsQuery, authUser: JwtPayload) {
        const { eventId, userId, page, limit } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.RegistrationWhereInput = {};
        let isAuthorized = false;

        // Determine base authorization and filtering
        if (authUser.role === UserRole.ADMIN) {
            isAuthorized = true; // Admin can see everything, apply filters directly
            if (eventId) where.eventId = eventId;
            if (userId) where.userId = userId;
        } else if (eventId) {
            // Check if user is the organizer of the requested event
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                select: { organiserId: true }
            });
            if (event && event.organiserId === authUser.userId) {
                isAuthorized = true;
                where.eventId = eventId;
                // Organizer can optionally filter by userId within their event
                if (userId) where.userId = userId;
            } else {
                 // Non-admin, non-organizer trying to filter by eventId - show only their own within that event
                 where.eventId = eventId;
                 where.userId = authUser.userId; // Restrict to own registrations within the event
                 isAuthorized = true; // Authorized to see their own
            }
        } else if (userId) {
            // Check if user is requesting their own registrations
            if (userId === authUser.userId) {
                isAuthorized = true;
                where.userId = userId;
            } else {
                // If not admin and requesting someone else's userId, forbid
                 throw new AppError(403, 'Forbidden: You can only view your own registrations or event registrations if you are the organizer.');
            }
        } else {
            // No specific filters provided by non-admin, default to showing only their own
            isAuthorized = true;
            where.userId = authUser.userId;
        }

        if (!isAuthorized) {
             // This case should ideally be caught by the logic above, but as a safeguard
            throw new AppError(403, 'Forbidden: You do not have permission to view these registrations.');
        }

        // Fetch registrations and total count
        const [registrations, totalCount] = await prisma.$transaction([
            prisma.registration.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    participant: true, // Include participant details
                    event: { select: { id: true, name: true, organiserId: true } }, // Include basic event details + organiserId for auth checks
                    purchase: { include: { ticket: true } } // Include purchase and ticket details
                }
            }),
            prisma.registration.count({ where })
        ]);

        return { registrations, totalCount };
    }

    /**
     * Retrieves a single registration by ID, performing authorization checks.
     */
    static async getRegistrationById(registrationId: number, authUser: JwtPayload) {
        const registration = await prisma.registration.findUnique({
            where: { id: registrationId },
            include: {
                participant: true,
                event: { select: { id: true, name: true, organiserId: true } }, // Need organiserId for auth
                purchase: { include: { ticket: true } },
                responses: { include: { eventQuestion: { include: { question: true } } } } // Include responses
            }
        });

        if (!registration) {
            throw new AppError(404, 'Registration not found');
        }

        // Authorization Check
        const isOwner = registration.userId === authUser.userId;
        const isEventOrganizer = registration.event.organiserId === authUser.userId;
        const isAdmin = authUser.role === UserRole.ADMIN;

        if (!isOwner && !isEventOrganizer && !isAdmin) {
            throw new AppError(403, 'Forbidden: You do not have permission to view this registration.');
        }

        return registration;
    }

    // TODO: Add methods for cancelRegistration etc.
}
