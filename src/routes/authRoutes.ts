import {Router} from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddlewares';

const router = Router();

router.post('/register', AuthController.registerUser);
router.post('/login', AuthController.loginUser);
router.get('/profile', authenticate, AuthController.getUserProfile);

export default router;
