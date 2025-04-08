// src/controllers/ticketController.ts
import { Request, Response } from 'express';
import { TicketService } from '../services/ticketServices';
import { CreateTicketDTO, UpdateTicketDTO } from '../types/ticketTypes';
import { ValidationError } from '../utils/errors';

export class TicketController {
    /**
     * Create a new ticket
     */
    static async createTicket(req: Request, res: Response): Promise<void> {
        try {
            const eventId = parseInt(req.params.eventId);

            if (isNaN(eventId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid event ID'
                });
                return;
            }

            // Event ownership verification is now handled by middleware
            const ticketData: CreateTicketDTO = {
                ...req.body,
                eventId
            };

            const ticket = await TicketService.createTicket(eventId, ticketData);

            res.status(201).json({
                success: true,
                data: ticket
            });
        }
        catch (error) {
            console.error('Error creating ticket:', error);

            const statusCode = error instanceof ValidationError ? 400 : 500;

            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Update an existing ticket
     */
    static async updateTicket(req: Request, res: Response): Promise<void> {
        try {
            const ticketId = parseInt(req.params.id);

            if (isNaN(ticketId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid ticket ID'
                });
                return;
            }

            const ticketData: UpdateTicketDTO = req.body;

            const ticket = await TicketService.updateTicket(ticketId, ticketData);

            res.status(200).json({
                success: true,
                data: ticket
            });
        }
        catch (error) {
            console.error('Error updating ticket:', error);

            const statusCode = error instanceof ValidationError ? 400 : 500;

            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Delete a ticket
     */
    static async deleteTicket(req: Request, res: Response): Promise<void> {
        try {
            const ticketId = parseInt(req.params.id);

            if (isNaN(ticketId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid ticket ID'
                });
                return;
            }

            await TicketService.deleteTicket(ticketId);

            res.status(200).json({
                success: true,
                message: 'Ticket deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting ticket:', error);

            const statusCode = error instanceof ValidationError ? 400 : 500;

            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get tickets for an event
     */
    static async getTicketsByEvent(req: Request, res: Response): Promise<void> {
        try {
            const eventId = parseInt(req.params.eventId);

            if (isNaN(eventId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid event ID'
                });
                return;
            }

            const tickets = await TicketService.getTicketsByEvent(eventId);

            res.status(200).json({
                success: true,
                data: tickets
            });
        }
        catch (error) {
            console.error('Error getting tickets:', error);

            const statusCode = error instanceof ValidationError ? 400 : 500;

            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get ticket details
     */
    static async getTicketById(req: Request, res: Response): Promise<void> {
        try {
            const ticketId = parseInt(req.params.id);

            if (isNaN(ticketId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid ticket ID'
                });
                return;
            }

            const ticket = await TicketService.getTicketById(ticketId);

            res.status(200).json({
                success: true,
                data: ticket
            });
        }
        catch (error) {
            console.error('Error getting ticket:', error);

            const statusCode = error instanceof ValidationError ? 400 : 500;

            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Check ticket availability
     */
    static async checkAvailability(req: Request, res: Response): Promise<void> {
        try {
            const ticketId = parseInt(req.params.id);

            if (isNaN(ticketId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid ticket ID'
                });
                return;
            }

            const availability = await TicketService.checkAvailability(ticketId);

            res.status(200).json({
                success: true,
                data: availability
            });
        }
        catch (error) {
            console.error('Error checking ticket availability:', error);

            const statusCode = error instanceof ValidationError ? 400 : 500;

            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
