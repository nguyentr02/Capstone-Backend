import { prisma } from '../config/prisma';
import { CreateEventDTO, EventFilters, EventResponse, TicketResponse } from '../types/eventTypes';

export class EventService {

    /**
     * 01 - Create a new event
     * @param organiserId 
     * @param eventData 
     * @returns 
     */
    static async createEvent(organiserId: number, eventData: CreateEventDTO) {

        // Make sure the event end date is after the start date
        if (new Date(eventData.endDateTime) < new Date(eventData.startDateTime)) {
            throw new Error('Event end date must be after the start date');
        }

        // Make sure the event is not in the past
        if (new Date(eventData.startDateTime) < new Date()) {
            throw new Error('Event start date must be in the future');
        }

        // Validate tickets only for paid events
        if (!eventData.isFree) {
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
        }


        return prisma.$transaction(async (tx) => {
            // 1 - Create the event
            const event = await tx.event.create({
                data: {
                    organiserId: organiserId,
                    name: eventData.name,
                    description: eventData.description,
                    location: eventData.location,
                    capacity: eventData.capacity,
                    eventType: eventData.eventType,
                    isFree: eventData.isFree,
                    startDateTime: new Date(eventData.startDateTime),
                    endDateTime: new Date(eventData.endDateTime),
                    status: 'DRAFT'
                }
            });

            // 2 - Create the tickets and link them to the event (paid events only)
            let eventTickets: TicketResponse[] = [];
            if (!eventData.isFree && eventData.tickets && eventData.tickets.length > 0) {
                eventTickets = await Promise.all(
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
            }

            // 3 - Create the questions and link them to the event
            const eventQuestions = await Promise.all(

                // Map over the questions array
                eventData.questions.map(async (q) => {
                    // 3.1 - Create the question
                    const question = await tx.question.create({
                        data: {
                            questionText: q.questionText,
                            questionType: 'TEXT', // Default to text for now
                        }
                    });

                    // 3.2 - Link the question to the event
                    return tx.eventQuestions.create({
                        data: {
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

    /**
     * 02 - Get all events with pagination and filters
     * @param param0 
     * @returns 
     */
    static async getAllEvents({ page = 1, limit = 10, filters = {} as EventFilters }) {

        // 1. Calculate the number of items to skip
        const skip = (page - 1) * limit;

        // 2. Build the where condition object
        const where: any = {};

        // 2.1. Status filter
        if (filters.status) {
            where.status = filters.status;
        }
        else {
            // Default to only showing PUBLISHED events for non-admins/non-owners
            // If user is admin or checking their own events, this will be overridden
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
            where.location = { contains: filters.location };
        }

        // 2.5. Date filters
        if (filters.startDate) {
            where.startDateTime = { gte: filters.startDate };
        }

        if (filters.endDate) {
            where.endDateTime = { lte: filters.endDate };
        }

        // 2.6. Organizer filter
        if (filters.organiserId) {
            
            // If organizer is looking at their own events, show all statuses unless filtered
            where.organiserId = filters.organiserId;
            
            if (!filters.status) {
                delete where.status; // Remove the PUBLISHED filter
            }
        }

        // Admin override - if user is admin and myEvents is true (special flag for admin-only view)
        if (filters.isAdmin && filters.myEvents === true) {
            // Allow admins to see all events if requested
            delete where.status; 
        }

        //2.7 - Free event filter
        if (filters.isFree) {
            where.isFree = filters.isFree;
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
                    tickets: {
                        where: { status: 'ACTIVE' }
                    },
                    _count: {
                        select: {
                            registrations: true // Count number of registrations
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

    /**
     * 03 - Get event by ID
     * @param eventId 
     * @returns 
     */
    static async getEventById(eventId: number) {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                _count: {
                    select: { registrations: true },
                },
            }
        });

        if (!event) {
            throw new Error('Event not found');
        }

        return event;

    }

    /**
     * 04 - Get event with details
     * @param eventId 
     * @returns 
     */
    static async getEventWithDetails(eventId: number) {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                tickets: {
                    where: { status: 'ACTIVE' }
                },
                eventQuestions: {
                    include: {
                        question: true
                    },
                    orderBy: {
                        displayOrder: 'asc'
                    }
                },
                _count: {
                    select: {
                        registrations: true
                    }
                }
            }
        });

        if (!event) {
            throw new Error('Event not found');
        }

        return event;
    }

    /**
     * 05 - Update event
     * @param eventId 
     * @param eventData 
     * @returns 
     */
    static async updateEvent(eventId: number, eventData: Partial<CreateEventDTO>) {
        // Verify that event exists
        const existingEvent = await prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!existingEvent) {
            throw new Error('Event not found');
        }

        // Make sure the event is not completed
        if (existingEvent.status === 'COMPLETED') {
            throw new Error('Cannot update a completed event');
        }

        // Handle date validation if provided
        if (eventData.startDateTime && eventData.endDateTime) {
            if (new Date(eventData.endDateTime) < new Date(eventData.startDateTime)) {
                throw new Error('Event end date must be after the start date');
            }
        } else if (eventData.startDateTime && existingEvent.endDateTime) {
            if (new Date(existingEvent.endDateTime) < new Date(eventData.startDateTime)) {
                throw new Error('Event end date must be after the start date');
            }
        } else if (eventData.endDateTime && existingEvent.startDateTime) {
            if (new Date(eventData.endDateTime) < new Date(existingEvent.startDateTime)) {
                throw new Error('Event end date must be after the start date');
            }
        }

        // Check if changing from free to paid
        if (eventData.isFree !== undefined && eventData.isFree !== existingEvent.isFree) {

            // If changing from free to paid, tickets must be provided
            if (eventData.isFree === false && (!eventData.tickets || eventData.tickets.length === 0)) {
                throw new Error('At least one ticket type is required for paid events');
            }

            // If changing from paid to free and there are registrations, reject
            // Otherwise, deactivate all tickets
            if (eventData.isFree === true) {
                const registrationCount = await prisma.registration.count({
                    where: { eventId }
                });

                if (registrationCount > 0) {
                    throw new Error('Cannot change a paid event to free when registrations exist');
                }
                else {
                    // Deactivate tickets
                    await prisma.ticket.updateMany({
                        where: { eventId },
                        data: { status: 'INACTIVE' }
                    });
                }
            }

            // Add more validation here
        }

        // Update the event
        return prisma.$transaction(async (tx) => {
            // 01 - Udpdate the event basic information
            const updatedEvent = await tx.event.update({
                where: { id: eventId },
                data: {
                    name: eventData.name,
                    description: eventData.description,
                    location: eventData.location,
                    capacity: eventData.capacity,
                    eventType: eventData.eventType,
                    isFree: eventData.isFree,
                    startDateTime: eventData.startDateTime ? new Date(eventData.startDateTime) : undefined,
                    endDateTime: eventData.endDateTime ? new Date(eventData.endDateTime) : undefined
                }
            });

            // 02 - Handle ticket changes if provided and the event is paid
            if (!updatedEvent.isFree && eventData.tickets && eventData.tickets.length > 0) {
                // 02.1 -  Delete existing tickets
                await tx.ticket.deleteMany({
                    where: { eventId, quantitySold: 0 } // Exclude sold tickets
                });

                // 02.2 - Create new tickets
                await Promise.all(
                    eventData.tickets.map(async (ticket) => {
                        return tx.ticket.create({
                            data: {
                                eventId: updatedEvent.id,
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
            }

            // 03 - Handle question changes if provided
            // TODO: need to check question update logic , and possibly convert to a separate function

            // Delete questions without responses and create new questions
            if (eventData.questions && eventData.questions.length > 0) {
                // 03.1 - Get existing questions with responses
                const questionsWithResponses = await tx.eventQuestions.findMany({
                    where: {
                        eventId,
                        responses: {
                            some: {}
                        }
                    },
                    select: {
                        id: true
                    }
                });

                const questionsWithResponseIds = questionsWithResponses.map(q => q.id);

                // Delete questions that don't have responses
                await tx.eventQuestions.deleteMany({
                    where: {
                        eventId,
                        id: {
                            notIn: questionsWithResponseIds
                        }
                    }
                });

                // Create new questions
                for (const q of eventData.questions) {
                    const question = await tx.question.create({
                        data: {
                            questionText: q.questionText,
                            questionType: 'TEXT'
                        }
                    });

                    await tx.eventQuestions.create({
                        data: {
                            eventId,
                            questionId: question.id,
                            isRequired: q.isRequired,
                            displayOrder: q.displayOrder
                        }
                    });
                }
            }

            // 04 - Return the updated event with all details
            return this.getEventWithDetails(eventId);
        });
    }

    /**
     * 05 - Update event status
     * @param eventId
     * @param status
     */
    static async updateEventStatus(eventId: number, status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED') {

        // Verify event exists
        const existingEvent = await this.getEventById(eventId);

        // Validate status transition
        if (existingEvent.status === 'COMPLETED') {
            throw new Error('Cannot change status of a completed event');
        }

        if (existingEvent.status === 'CANCELLED' && status !== 'DRAFT') {
            throw new Error('Cancelled events can only be restored to draft status');
        }

        // For publishing, verify the event has questions and tickets (if paid)
        if (status === 'PUBLISHED') {

            // Get question count
            const questionCount = await prisma.eventQuestions.count({
                where: { eventId }
            });
            if (questionCount === 0) {
                throw new Error('Events must have at least one question before publishing');
            }

            // For paid events, verify tickets exist
            if (!existingEvent.isFree) {
                const ticketCount = await prisma.ticket.count({
                    where: { eventId }
                });

                if (ticketCount === 0) {
                    throw new Error('Paid events must have at least one ticket type before publishing');
                }
            }
        }

        // For cancellation, handle existing registrations
        if (status === 'CANCELLED' && existingEvent.status === 'PUBLISHED') {
            const registrationCount = await prisma.registration.count({
                where: { eventId }
            });

            if (registrationCount > 0) {
                // TODO: Implement: send cancellation notifications here and process refunds for paid events

                // Update all registrations to cancelled
                await prisma.registration.updateMany({
                    where: {
                        eventId,
                        status: {
                            in: ['CONFIRMED', 'PENDING']
                        }
                    },
                    data: { status: 'CANCELLED' }
                });
            }
        }

        // Update the event status
        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: { status }
        });

        return updatedEvent;
    }

    /**
     * 06 - Delete an event
     * @param eventId 
     * @returns 
     */
    static async deleteEvent(eventId: number) {
        // Verify event exists
        const existingEvent = await this.getEventById(eventId);

        if (!existingEvent) {
            throw new Error('Event not found');
        }

        // Check for registrations, if any, reject and suggest cancellation
        const registrationCount = await prisma.registration.count({
            where: { eventId }
        });

        if (registrationCount > 0) {
            throw new Error('Cannot delete an event with registrations. Please cancel the event instead.');
        }

        // Delete the event
        return prisma.$transaction(async (tx) => {
            // Delete related records
            await tx.eventQuestions.deleteMany({
                where: { eventId }
            });

            // Delete tickets
            await tx.ticket.deleteMany({
                where: { eventId }
            });

            // Delete the event
            return tx.event.delete({
                where: { id: eventId }
            });
        });
    }
}