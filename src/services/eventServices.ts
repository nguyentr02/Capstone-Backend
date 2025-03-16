import {prisma} from '../config/prisma';
import { CreateEventDTO, EventResponse } from '../types/eventTypes';

export class EventService {

    // 01 - Create a new event
    static async createEvent(organizerId: number, eventData: CreateEventDTO) {
        
        // Make sure the event end date is after the start date
        if (new Date(eventData.endDateTime) < new Date(eventData.startDateTime)) {
            throw new Error('Event end date must be after the start date');
        }

        // Make sure the event is not in the past
        if (new Date(eventData.startDateTime) < new Date()) {
            throw new Error('Event start date must be in the future');
        }

        // Validate tickets
        if (!eventData.tickets || eventData.tickets.length === 0) {
            throw new Error('At least one ticket type is required');
        }

        // Check ticket dates
        for (const ticket of eventData.tickets) {
            if (new Date(ticket.salesEnd) <= new Date(ticket.salesStart)) {
                throw new Error('Ticket sales end date must be after sales start date');
            }
            
            if (new Date(ticket.salesEnd) > new Date(eventData.endDateTime)) {
                throw new Error('Ticket sales cannot end after the event ends');
            }
        }

        
        return prisma.$transaction( async (tx) => {
            // 1 - Create the event
            const event = await tx.event.create({
                data: {
                    organiserId: organizerId,
                    name: eventData.name,
                    description: eventData.description,
                    location: eventData.location,
                    capacity: eventData.capacity,
                    eventType: eventData.eventType,
                    startDateTime: new Date(eventData.startDateTime),
                    endDateTime: new Date(eventData.endDateTime),
                    status: 'DRAFT'
                }
            });

            // 2 - Create the tickets and link them to the event
            const eventTickets = await Promise.all(
                eventData.tickets.map(async (ticket) => {
                    return tx.ticket.create({
                        data: {
                            eventId: event.id,
                            name: ticket.name,
                            description: ticket.description,
                            price: ticket.price,
                            quantityTotal: ticket.quantityTotal,
                            quantitySold: 0,
                            salesStart: new Date(ticket.salesStart),
                            salesEnd: new Date(ticket.salesEnd)
                        }
                    });
                })
            );

            // 3 - Create the questions and link them to the event
            const eventQuestions = await Promise.all(

                // Map over the questions array
                eventData.questions.map(async (q) => { 
                    // 2.1 - Create the question
                    const question = await tx.question.create({
                        data : {
                            questionText: q.questionText,
                            questionType: 'TEXT', // Default to text for now
                        }
                    });  
                    
                    // 2.2 - Link the question to the event
                    return tx.eventQuestions.create({
                        data : {
                            eventId: event.id,
                            questionId: question.id,
                            isRequired: q.isRequired,
                            displayOrder: q.displayOrder
                        }
                    });
                })
            );

            // 4 - Return the created events with its questions
            return {
                ...event,
                tickets: eventTickets,
                questions: eventQuestions
            };
        });
    };
    
    // 02 - Get all events with optional filtering
    static async getAllEvents() {
        return prisma.event.findMany({
            include: {
                organizer: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                },
                eventQuestions: {
                    include: {
                        question: true
                    }
                }
            }
        });
    }

    // 03 - Get a single event
    static async getEventById(eventId: number) {
        return prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizer: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                },
                eventQuestions: {
                    include: {
                        question: true
                    }
                }
            }
        });
    }
    
    // 04 - Update event
    static async updateEvent (eventId: number, eventData: Partial<CreateEventDTO>) {
        return prisma.event.update({
            where: { id: eventId },
            data: {
                name: eventData.name,
                description: eventData.description,
                location: eventData.location,
                capacity: eventData.capacity,
                eventType: eventData.eventType,
                startDateTime: eventData.startDateTime,
                endDateTime: eventData.endDateTime,
            }
        });
    }


    // 05 -  Delete event
    static async deleteEvent(eventId: number) {
        return prisma.event.delete({
            where: { id: eventId }
        });
    }
}