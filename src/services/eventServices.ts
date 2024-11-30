import {prisma} from '../config/prisma';
import { Event, User} from '@prisma/client';
import { EventError } from '../utils/errors';
import { CreateEventDTO, EventFilters, EventResponse } from '../types/eventTypes';

export class EventService {

    // Create a new event
    static async createEvent(organizerId: number, eventData: CreateEventDTO): Promise<Event> {

        // Convert string dates to Date objects
        const startDateTime = new Date(eventData.startDateTime);
        const endDateTime = new Date(eventData.endDateTime);

        // Check if end time is after start time
        if (endDateTime <= eventData.startDateTime) {
            throw new EventError('End time must be after start time');
        }

        // Check if event is scheduled in the past
        if (startDateTime < new Date()) {
            throw new EventError('Event cannot be scheduled in the past');
        }

        return prisma.event.create({
            data: {
                name: eventData.name,
                description: eventData.description,
                location: eventData.location,
                startDateTime, 
                endDateTime,
                status: 'DRAFT',
                organizer: {
                    connect: {
                        id: organizerId
                    }
                }
            },
            include: {
                organizer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
    }
    
    // Get event by ID
    static async getEventById(eventId: number): Promise<EventResponse> {
        const event = await prisma.event.findUnique({
            where: {id: eventId},
            include: {
                organizer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        if (!event) {
            throw new EventError('Event not found');
        }

        return event as EventResponse;
    }

    // Get all events with optional filters
}