import {Router} from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddlewares';

const router = Router();

router.post('/register', AuthController.registerUser);
router.post('/login', AuthController.loginUser);

router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', authenticate, AuthController.logout);

// TODO: Separate routes for different (3) user roles and attach middlewares to groups

export default router;
