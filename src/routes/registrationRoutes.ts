import { Router } from 'express';
import { RegistrationController } from '../controllers/registrationController';
import { authenticate } from '../middlewares/authMiddlewares'; // Corrected import name

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
    // authenticate, // Uncomment if registration requires authentication
    // No auth needed for creating registration? Or add authenticate here if required.
    RegistrationController.createRegistration
);

/**
 * @swagger
 * /registrations:
 *   get:
 *     summary: Retrieve a list of registrations
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: [] # Indicates JWT authentication is required
 *     parameters:
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: integer
 *         description: Filter registrations by event ID (Organizer/Admin only)
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter registrations by user ID (Owner/Admin only)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of registrations per page
 *     responses:
 *       200:
 *         description: A list of registrations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Registration' # Assuming Registration schema exists
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalCount:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized (Missing or invalid token)
 *       403:
 *         description: Forbidden (User does not have permission)
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
router.get(
    '/',
    authenticate, // Apply authentication middleware
    RegistrationController.getRegistrations
);

/**
 * @swagger
 * /registrations/{registrationId}:
 *   get:
 *     summary: Retrieve a single registration by ID
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: [] # Indicates JWT authentication is required
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the registration to retrieve
 *     responses:
 *       200:
 *         description: Registration details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Registration' # Assuming Registration schema exists
 *       401:
 *         description: Unauthorized (Missing or invalid token)
 *       403:
 *         description: Forbidden (User does not have permission)
 *       404:
 *         description: Registration not found
 *       400:
 *         description: Invalid registration ID format
 *       500:
 *         description: Internal server error
 */
router.get(
    '/:registrationId',
    authenticate, // Apply authentication middleware
    RegistrationController.getRegistrationById
);


// TODO: Add routes for DELETE /registrations/:id etc.

export default router;
