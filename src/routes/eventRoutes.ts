import {Router} from 'express';
import { EventController } from '../controllers/eventController';
import { authorize, authenticate } from '../middlewares/authMiddlewares';
import { validateEventCreation} from '../middlewares/eventValidation';

const router = Router();

// Public routes
router.get('/', EventController.getAllEvents);
router.get('/:id', EventController.getEventById);

// Protected routes (organizers only)
router.post('/', 
    authenticate, 
    EventController.createEvent);

router.put('/:id', 
    authenticate, 
    authorize('ORGANIZER'), 
    EventController.updateEvent);

router.delete('/:id', 
    authenticate, 
    authorize('ORGANIZER'), 
    EventController.deleteEvent);

router.patch('/:id/status', 
    authenticate, 
    authorize('ORGANIZER', 'ADMIN'),
    EventController.updateEventStatus
);

export default router;