import {prisma} from '../config/prisma';
import { Event, User} from '@prisma/client';
import { EventError } from '../utils/errors';
import { CreateEventDTO, EventResponse } from '../types/eventTypes';

export class EventService {

    // Create a new event
    static async createEvent(organizerId: number, eventData: CreateEventDTO) {
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

            // 2 - Create the questions and link them to the event
            const eventQuestions = await Promise.all(

                // Map over the questions array
                eventData.questions.map(async (q) => { 
                    // 2.1 - Create the question
                    const question = await tx.question.create({
                        data : {
                            questionText: q.questionText,
                            questionType: 'TEXT',
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

            // Return the created events with its questions
            return {
                ...event,
                questions: eventQuestions
            };
        });
    };
    
    // Get all events
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

    //Get single event
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
    
    // Update event
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


    // Delete event
    static async deleteEvent(eventId: number) {
        return prisma.event.delete({
            where: { id: eventId }
        });
    }
}