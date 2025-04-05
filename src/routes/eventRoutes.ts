import {Router} from 'express';
import { EventController } from '../controllers/eventController';
import { authorize, authenticate, validateRequest, optionalAuthenticate } from '../middlewares/authMiddlewares';
import { createEventSchema } from '../validation/eventValidation';

const router = Router();

// Public routes
// router.get('/', EventController.getAllEvents);
router.get('/:id', EventController.getEventById);

// Protected routes (organizers only)
router.get('/', optionalAuthenticate, EventController.getAllEvents);

router.post('/', 
    authenticate, 
    // validateRequest(createEventSchema),
    EventController.createEvent);

router.put('/:id', 
    authenticate, 
    authorize('ORGANIZER', 'ADMIN'), 
    EventController.updateEvent);

router.delete('/:id', 
    authenticate, 
    authorize('ORGANIZER', 'ADMIN'), 
    EventController.deleteEvent);

router.patch('/:id/status', 
    authenticate, 
    authorize('ORGANIZER', 'ADMIN'),
    EventController.updateEventStatus
);

export default router;