import { Router } from "express";
import { UserController } from "../controllers/userController";

const router = Router();

// ----- User functionality -----
router.get('/', UserController.getProfile());
router.get('/:id', UserController.getUserById);

// router.post('/', UserController.createUser);
// ----- Admin functionality -----
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;