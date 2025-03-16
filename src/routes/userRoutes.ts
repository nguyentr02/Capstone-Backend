import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authenticate } from "../middlewares/authMiddlewares";
import { validateRequest } from "../middlewares/authMiddlewares";
import { userUpdateSchema, updatePasswordSchema } from "../validation/userValidation";

const router = Router();

// ----- User functionality -----
// All routes require authentication
router.get('/profile', authenticate, UserController.getUserProfile);
router.put('/profile', authenticate, validateRequest(userUpdateSchema), UserController.updateUserProfile);
router.post('/change-password', authenticate, validateRequest(updatePasswordSchema), UserController.updateUserPassword);

// router.post('/', UserController.createUser);
// ----- Admin functionality -----
// router.get('/', UserController.getAllUsers);
// router.get('/:id', UserController.getUserById);
// router.put('/:id', UserController.updateUser);
// router.delete('/:id', UserController.deleteUser);

export default router;