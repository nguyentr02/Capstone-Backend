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
    static async getAllEvents({ page = 1, limit = 10, filters = {} }) {
        
        // 1. Calculate the number of items to skip
        const skip = (page - 1) * limit;   

        // 2. Build the where condition object
        const where: any = {};

            // 2.1. Status filter
            if (filters.status) {
                where.status = filters.status;
            }
            else {
                where.status = "PUBLISHED";
            }

            // 2.2. Text search filter
            if (filters.search) {
                where.OR = [
                    { name: { contains: filters.search } },
                    { description: { contains: filters.search } }
                ];
            }

            // 2.3. Event type filter
            if (filters.eventType) {
                where.eventType = filters.eventType;
            }

            // 2.4. Location filter
            if (filters.location) {
                where.eventType = filters.location;
            }

            // 2.5. Date filters
            if (filters.startDate) {
                where.startDateTime = { gte: filters.startDate };
            }
            
            if (filters.endDate) {
                where.endDateTime = { lte: filters.endDate };
            }
            
            // 2.6. Organizer filter
            if (filters.organizerId) {
                where.organiserId = filters.organizerId;
            }

        //3. Get the events with the filters and pagination
        const [events, total] = await Promise.all([ 
            prisma.event.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    startDateTime: 'asc'  // Show upcoming events first
                  },
                include: {
                    organizer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    _count: {
                        select: {
                            registrations : true // Count number of registrations
                        }
                    }
                }

            }),
            prisma.event.count({ where }) // Count the total number of events
        ]);

        // 4. Return the events and total count with pagination
        return {
            events,
            pagination: {
                total,
                page, 
                limit,
                pages: Math.ceil(total / limit)
            }
        }
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