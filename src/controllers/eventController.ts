import { Request, Response } from 'express';
import { EventService } from '../services/eventServices';
import { CreateEventDTO, EventFilters } from '../types/eventTypes';
import { ValidationError } from '../utils/errors';

export class EventController {

    /**
     * 01 - Create a new event
     * @param req 
     * @param res 
     */
    static async createEvent(req: Request<{}, {}, CreateEventDTO>, res: Response) {
        try {


            // const organiserId = 2;
            const organiserId = req.user?.userId;

            if (!organiserId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            // Create event
            const event = await EventService.createEvent(organiserId, req.body);

            res.status(201).json({
                success: true,
                data: event,
                message: 'Event created successfully'
            });
        }
        catch (error) {
            console.log("Error creating event: ", error);

            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }

    }

    /**
     * 02 - Get all events with filters and pagination
     * @param req 
     * @param res 
     * @returns 
     */
    static async getAllEvents(req: Request, res: Response): Promise<void> {
        try {

            // 1. Extract query parameters
            const page = req.query.page ? parseInt(req.query.page as string) : 1; // Page number
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10; // Items per page

            //2. Build filters from query parameters
            const filters: EventFilters = {
                search: req.query.search as string,
                eventType: req.query.eventType as string,
                location: req.query.location as string,
                isFree: req.query.isFree === 'true' ? true :
                    req.query.isFree === 'false' ? false : undefined,
            };

            //3. Handle date filters
            if (req.query.startDate) {
                filters.startDate = new Date(req.query.startDate as string);
            }

            if (req.query.endDate) {
                filters.endDate = new Date(req.query.endDate as string);
            }

            console.log('User role:', req.user?.role);
            console.log('Query params:', req.query);

            // Apply specific filtering based on user role
            if (req.user) {
                if (req.user.role === 'ADMIN') {
                    console.log('User is an admin');
                    filters.isAdmin = true;
                    filters.adminView = req.query.adminView === 'true'; // Admin view toggle - only when explicitly requested
                }
                else if (req.user.role === 'ORGANIZER') {
                    console.log('User is an organizer');
                    filters.isOrganiser = true;
                    if (req.query.myEvents === 'true') { // For organizers viewing their own events
                        console.log('Organizer viewing own events');
                        filters.organiserId = req.user.userId;
                        filters.myEvents = true;

                        // Use specified status if provided
                        if (req.query.status) {
                            filters.status = req.query.status as string;
                        }
                    }
                }
                // PARTICIPANT role doesn't get special filtering
            }
            else {
                console.log('User is not authenticated, public access');
                filters.status = 'PUBLISHED';
            }

            console.log('Final filters:', filters);

            // Get events from service
            const result = await EventService.getAllEvents({ page, limit, filters });

            res.json({ success: true, data: result });
        }
        catch (error) {
            console.error('Error getting events:', error);

            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * 03 - Get event by ID
     * @param req 
     * @param res 
     */
    static async getEventById(req: Request, res: Response): Promise<void> {
        try {
            const eventId = Number(req.params.id);

            // Validate event ID
            if (isNaN(eventId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid event ID'
                });
                return;
            }

            const event = await EventService.getEventWithDetails(eventId);

            res.status(200).json({
                success: true,
                data: event
            });
        }
        catch (error) {
            console.error('Error getting event:', error);

            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * 04 - Update event
     * @param req 
     * @param res 
     * @returns 
     */
    static async updateEvent(req: Request, res: Response) {
        try {
            const eventId = Number(req.params.id);
            const userId = req.user?.userId;

            if (isNaN(eventId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid event ID'
                });
            }

            //Verify ownership if not admin
            if (req.user?.role !== 'ADMIN') {
                const event = await EventService.getEventById(eventId);

                if (event.organiserId !== userId) {
                    res.status(403).json({
                        success: false,
                        message: 'You are not authorized to delete this event'
                    });
                }
            }

            // Update event
            const event = await EventService.updateEvent(eventId, req.body);

            res.status(200).json({
                success: true,
                data: event
            });
        }
        catch (error) {
            console.error('Error updating event:', error);

            res.status(500).json({
                success: false,
                message: 'Error updating event',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        }
    }

    /**
     * 05 - Update event status
     * @param req 
     * @param res 
     * @returns 
     */
    static async updateEventStatus(req: Request, res: Response) {
        try {
            const eventId = Number(req.params.id);
            const status = req.body.status;
            const userId = req.user?.userId;

            if (isNaN(eventId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid event ID'
                });
            }

            // Verify ownership if not admin
            if (req.user?.role !== 'ADMIN') {
                const event = await EventService.getEventById(eventId);

                if (event.organiserId !== userId) {
                    res.status(403).json({
                        success: false,
                        message: 'You are not authorized to update this event'
                    });
                }
            }

            // Validate status
            if (!['DRAFT', 'PUBLISHED', 'CANCELLED'].includes(status)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be DRAFT, PUBLISHED, or CANCELLED'
                });
            }

            // Update event status
            const event = await EventService.updateEventStatus(eventId, status);

            res.status(200).json({
                success: true,
                data: event
            });
        }
        catch (error) {
            console.error('Error updating event status:', error);

            res.status(500).json({
                success: false,
                message: 'Error updating event status',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * 06 - Delete event
     * @param req 
     * @param res 
     * @returns 
     */
    static async deleteEvent(req: Request, res: Response) {
        try {
            const eventId = Number(req.params.id);
            const userId = req.user?.userId;

            //Validate event ID
            if (isNaN(eventId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid event ID'
                });
            }

            //Verify ownership if not admin
            if (req.user?.role !== 'ADMIN') {
                const event = await EventService.getEventById(eventId);

                if (event.organiserId !== userId) {
                    res.status(403).json({
                        success: false,
                        message: 'You are not authorized to delete this event'
                    });
                }
            }

            // Delete event
            await EventService.deleteEvent(eventId);

            res.status(200).json({
                success: true,
                message: 'Event deleted successfully'
            });
        }
        catch (err) {
            console.error('Error deleting event:', err);

            res.status(500).json({
                success: false,
                message: 'Error deleting event',
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    }

}