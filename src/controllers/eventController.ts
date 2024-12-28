import {Request, Response} from 'express';
import { EventService } from '../services/eventServices';
import { CreateEventDTO } from '../types/eventTypes';

export class EventController {

    // Create a new event
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
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }

    }

    //Get all events
    static async getAllEvents(req: Request, res: Response) : Promise<void> {
        try {
            const events = await EventService.getAllEvents();

            res.status(200).json({
                success: true,
                data: events
            });
        }
        catch(err) {
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: err
            })
        }
    }

    //Get event by Id
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

    //Update event
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

    //Delete event
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