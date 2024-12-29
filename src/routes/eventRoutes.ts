import {Router} from 'express';
import { EventController } from '../controllers/eventController';
import { authorize, authenticate } from '../middlewares/authMiddlewares';
import { validateEventCreation} from '../middlewares/eventValidation';

const router = Router();

router.get('/events', EventController.getAllEvents);
router.get('/events/:id', EventController.getEventById);

router.post('/events', authenticate, authorize('ORGANIZER'), EventController.createEvent);
router.put('/events/:id', authenticate, authorize('ORGANIZER'), EventController.updateEvent);
router.delete('/events/:id', authenticate, authorize('ORGANIZER'), EventController.deleteEvent);

export default router;