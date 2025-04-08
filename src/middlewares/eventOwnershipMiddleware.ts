import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticationError } from '../utils/errors';

/**
 * Middleware to verify that the authenticated user is the organizer of the event
 * or has admin privileges before allowing modifications to the event or its tickets
 */
export const verifyEventOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Get the user ID from the authenticated user
        const userId = req.user?.userId;
        
        if (!userId) {
            next(new AuthenticationError('Authentication required'));
            return;
        }
        
        // Get the event ID from the request parameters
        // This handles both /events/:id and /events/:eventId/tickets routes
        const eventId = parseInt(req.params.id || req.params.eventId);
        
        if (isNaN(eventId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid event ID'
            });
            return;
        }
        
        // Check if user is an admin (admins can modify any event)
        if (req.user?.role === 'ADMIN') {
            next();
            return;
        }
        
        // For non-admins, verify event ownership
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: { organiserId: true }
        });
        
        if (!event) {
            res.status(404).json({
                success: false,
                message: 'Event not found'
            });
            return;
        }
        
        // Check if the authenticated user is the organizer
        if (event.organiserId !== userId) {
            res.status(403).json({
                success: false,
                message: 'You are not authorized to modify this event'
            });
            return;
        }
        
        // User is the organizer, proceed to the next middleware/controller
        next();
    } catch (error) {
        console.error('Error verifying event ownership:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Middleware to verify ticket ownership through its associated event
 * This is used for routes that operate directly on tickets by ticket ID
 */
export const verifyTicketOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Get the user ID from the authenticated user
        const userId = req.user?.userId;
        
        if (!userId) {
            next(new AuthenticationError('Authentication required'));
            return;
        }
        
        // Get the ticket ID from the request parameters
        const ticketId = parseInt(req.params.id);
        
        if (isNaN(ticketId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid ticket ID'
            });
            return;
        }
        
        // Check if user is an admin (admins can modify any ticket)
        if (req.user?.role === 'ADMIN') {
            next();
            return;
        }
        
        // For non-admins, get the ticket and its associated event
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                event: {
                    select: {
                        organiserId: true
                    }
                }
            }
        });
        
        if (!ticket) {
            res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
            return;
        }
        
        // Check if the authenticated user is the organizer of the event
        if (ticket.event.organiserId !== userId) {
            res.status(403).json({
                success: false,
                message: 'You are not authorized to modify this ticket'
            });
            return;
        }
        
        // User is the organizer, proceed to the next middleware/controller
        next();
    } catch (error) {
        console.error('Error verifying ticket ownership:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
