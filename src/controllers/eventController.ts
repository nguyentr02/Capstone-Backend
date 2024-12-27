import {Request, Response} from 'express';
import { EventService } from '../services/eventServices';
import { CreateEventDTO } from '../types/eventTypes';

export class EventController {
    static async createEvent(req: Request<{}, {}, CreateEventDTO>, res: Response) {
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
}