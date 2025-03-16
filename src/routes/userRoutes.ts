import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authenticate, authorize } from "../middlewares/authMiddlewares";
import { validateRequest } from "../middlewares/authMiddlewares";
import { userUpdateSchema, updatePasswordSchema } from "../validation/userValidation";

const router = Router();

// ----- User functionality -----
// All routes require authentication
router.get('/profile', authenticate, UserController.getUserProfile);
router.put('/profile', authenticate, validateRequest(userUpdateSchema), UserController.updateUserProfile);
router.post('/change-password', authenticate, validateRequest(updatePasswordSchema), UserController.updateUserPassword);

//router.post('/', UserController.createUser);
// ----- Admin functionality -----
router.get('/', authenticate, authorize('ADMIN'), UserController.getAllUsers);
router.get('/:id', authenticate, authorize('ADMIN'), UserController.getUserById);
router.put('/:id', authenticate, authorize('ADMIN'), UserController.updateUserRole);
router.delete('/:id', authenticate, authorize('ADMIN'), UserController.deleteUser);

export default router;