import {Request, Response} from 'express';
import { EventService } from '../services/eventServices';
import { CreateEventDTO, EventFilters } from '../types/eventTypes';

export class EventController {

    // 1 - Create a new event
    static async createEvent(req: Request<{}, {}, CreateEventDTO>, res: Response) :Promise<void> {
        try {

            //TODO: Implement authorization check
            const organiserId = 1; // Hardcoded for now
            
            // Create event
            const event = await EventService.createEvent(organiserId, req.body);

            res.status(201).json({
                success: true,
                data: event
            });
        }
        catch (error) {
            console.log("Error creating event: ", error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error
            });
        }

    }

    // 2 - Get all events
    static async getAllEvents(req: Request, res: Response) : Promise<void> {
        try {

            // 1. Extract query parameters
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
            

            //2. Build filters from query parameters
            const filters: EventFilters = {
                search: req.query.search as string,
                eventType: req.query.eventType as string,
                location: req.query.location as string
            };

            //3. Handle date filters

            if (req.query.startDate) {
                filters.startDate = new Date(req.query.startDate as string);
              }
              
              if (req.query.endDate) {
                filters.endDate = new Date(req.query.endDate as string);
              }
              
              // For organizers, allow viewing their own events including drafts
              if (req.user?.role === 'ORGANIZER') {
                if (req.query.myEvents === 'true') {
                  filters.organizerId = req.user.userId;
                  // If viewing own events, include all statuses
                  filters.status = req.query.status as string;
                }
              } else {
                // Non-organizers can only see published events
                filters.status = 'PUBLISHED';
              }
              
              // Get events from service
              const result = await EventService.getEvents({
                page,
                limit,
                filters
              });
              
              res.json({
                success: true,
                data: result
              });
            
        }
        catch(err) {
            console.log("Error getting events: ", err);

            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: err
            })
        }
    }

    // 3 - Get event by Id
    static async getEventById(req: Request, res: Response) {
        try {
            const eventId = Number(req.params.id);
            const event = await EventService.getEventById(eventId);

            res.status(200).json({
                success: true,
                data: event
            });
        }
        catch(err) {
            res.status(404).json({
                success: false,
                message: 'Event not found',
                error: err
            })
        }
    }

    //4 - Update event
    static async updateEvent(req: Request, res: Response) {
        try {
            const eventId = Number(req.params.id);
            const event = await EventService.updateEvent(eventId, req.body)

            res.status(200).json({
                success: true,
                data: event
            });
        }
        catch(err) {
            res.status(500).json({
                success: false,
                message: 'Error updating event',
                error: err
            })
        }
    }

    //5 - Delete event
    static async deleteEvent(req: Request, res: Response) {
        try {
            const eventId = Number(req.params.id);
            await EventService.deleteEvent(eventId);

            res.status(204).json({
                success: true,
                message: 'Event deleted'
            });
        }
        catch(err) {
            res.status(500).json({
                success: false,
                message: 'Error deleting event',
                error: err
            })
        }
    }

}