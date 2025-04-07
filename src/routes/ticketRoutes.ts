import { Router } from 'express';
import { TicketController } from '../controllers/ticketController';
import { authenticate, authorize, optionalAuthenticate } from '../middlewares/authMiddlewares';
import { validateRequest } from '../middlewares/authMiddlewares';
import { createTicketSchema, updateTicketSchema } from '../validation/ticketValidation';

const router = Router();

// Public routes (can be accessed without authentication)
router.get('/events/:eventId/tickets', TicketController.getTicketsByEvent);
router.get('/tickets/:id', TicketController.getTicketById);
router.get('/tickets/:id/availability', TicketController.checkAvailability);

// Protected routes (require authentication)
router.post('/events/:eventId/tickets',
    authenticate,
    authorize('ORGANIZER'),
    // validateRequest(createTicketSchema),
    TicketController.createTicket
);

router.put('/tickets/:id',
    authenticate,
    authorize('ORGANIZER'),
    // validateRequest(updateTicketSchema),
    TicketController.updateTicket
);

router.delete('/tickets/:id',
    authenticate,
    authorize('ORGANIZER'),
    TicketController.deleteTicket
);

export default router;