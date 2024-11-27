import {prisma} from '../config/prisma';
import { Event, User} from '@prisma/client';

export class EventService {

    // Create a new event
    static async createEvent(organizerId: number, eventData: {
        name: string,
        description?: string,
        location: string,
        eventStartDate: Date,
        eventEndDate: Date,
        eventStartTime: string
        eventEndTime: string,
    }){
        return prisma.event.create({
            data: {
                ...eventData,
                organiserId: organizerId,
                status: "DRAFT"
            },
            include: {
                organizer: true
            }
        });
    }
    
    // Get all events
    static async getEvents(filters? : {
        status?: string,
        location?: string,
        startDate?: Date,
        endDate?: Date
    }) {
        return prisma.event.findMany({
            where: filters,
            include: {
                organizer: true
            }
        });

    }
}