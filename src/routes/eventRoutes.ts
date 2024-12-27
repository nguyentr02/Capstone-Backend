import {Router} from 'express';
import { EventController } from '../controllers/eventController';
import { authorize, authenticate } from '../middlewares/authMiddlewares';

const router = Router();

router.post('/events', authenticate, authorize('ORGANIZER'), EventController.createEvent);

export default router;