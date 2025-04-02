import {Router} from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddlewares';
import { validateRequest } from '../middlewares/authMiddlewares';
import { registerSchema, loginSchema } from '../validation/authValidation';

const router = Router();

router.post('/register', validateRequest(registerSchema), AuthController.registerUser);
router.post('/login', validateRequest(loginSchema), AuthController.loginUser);

router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', authenticate, AuthController.logout);

export default router;
