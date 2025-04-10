import { Router } from 'express';
import { RegistrationController } from '../controllers/registrationController';
// import { authenticateToken } from '../middlewares/authMiddlewares'; // Optional: Add auth middleware if needed

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Registrations
 *   description: Event registration management
 */

/**
 * @swagger
 * /registrations:
 *   post:
 *     summary: Register a participant for an event
 *     tags: [Registrations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistrationDto' # Assuming you'll define this in swagger config
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Registration' # Assuming Registration schema exists
 *       400:
 *         description: Validation error or bad request (e.g., event full, ticket unavailable)
 *       404:
 *         description: Event or Ticket not found
 *       500:
 *         description: Internal server error
 */
router.post(
    '/',
    // authenticateToken, // Uncomment if registration requires authentication
    RegistrationController.createRegistration
);

// TODO: Add routes for GET /registrations, GET /registrations/:id, DELETE /registrations/:id etc.

export default router;
