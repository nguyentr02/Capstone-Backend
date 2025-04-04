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
            
        // Create the registration 
    }
}

