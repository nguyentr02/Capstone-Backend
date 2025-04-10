import { Router } from 'express';
import { RegistrationController } from '../controllers/registrationController';
import { authenticate } from '../middlewares/authMiddlewares'; // Corrected import name

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Registrations
 *   description: Event registration management endpoints
 */

/**
 * @openapi
 * /registrations:
 *   post:
 *     summary: Create Registration
 *     description: Register a participant for an event.
 *     tags: [Registrations]
 *     requestBody:
 *       required: true
 *       description: Registration details.
 *       content:
 *         application/json:
 *           schema:
 *             # Fully detailed inline schema for RegistrationDto request
 *             type: object
 *             required: [eventId, participant, responses]
 *             properties:
 *               eventId:
 *                 type: integer
 *                 description: ID of the event.
 *                 example: 1
 *               participant:
 *                 type: object
 *                 required: [email, firstName, lastName]
 *                 properties:
 *                   email: { type: string, format: email, example: "test@example.com" }
 *                   firstName: { type: string, example: "John" }
 *                   lastName: { type: string, example: "Doe" }
 *                   phoneNumber: { type: string, nullable: true, example: "0412345678" }
 *                   dateOfBirth: { type: string, format: date-time, nullable: true, example: "1990-01-15T00:00:00.000Z" }
 *                   address: { type: string, nullable: true, example: "123 Main St" }
 *                   city: { type: string, nullable: true, example: "Anytown" }
 *                   state: { type: string, nullable: true, example: "NSW" }
 *                   zipCode: { type: string, nullable: true, example: "2000" }
 *                   country: { type: string, nullable: true, example: "Australia" }
 *               ticketId:
 *                 type: integer
 *                 description: Required for paid events.
 *                 nullable: true
 *                 example: 5
 *               quantity:
 *                 type: integer
 *                 description: Required for paid events.
 *                 minimum: 1
 *                 nullable: true
 *                 example: 1
 *               responses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [questionId, responseText]
 *                   properties:
 *                     questionId: { type: integer, example: 101 }
 *                     responseText: { type: string, example: "Vegetarian" }
 *               userId:
 *                 type: integer
 *                 description: Optional ID of logged-in user.
 *                 nullable: true
 *                 example: 12
 *     responses:
 *       '201': # Use quotes for numeric status codes
 *         description: Registration created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Registration successful"
 *                 data:
 *                   # Fully detailed inline Registration response
 *                   type: object
 *                   properties:
 *                     id: { type: integer, example: 150 }
 *                     eventId: { type: integer, example: 1 }
 *                     participantId: { type: integer, example: 75 }
 *                     userId: { type: integer, nullable: true, example: 12 }
 *                     status: { type: string, enum: [PENDING, CONFIRMED, CANCELLED], example: "CONFIRMED" }
 *                     created_at: { type: string, format: date-time }
 *                     updated_at: { type: string, format: date-time }
 *                     participant: { $ref: '#/components/schemas/Participant' } # Ref for brevity
 *                     event: { $ref: '#/components/schemas/EventSummary' } # Ref for brevity (assuming summary schema)
 *                     purchase: { $ref: '#/components/schemas/Purchase', nullable: true } # Ref for brevity
 *                     responses:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/ResponseDetail' } # Ref for brevity
 *       '400':
 *         description: Bad Request (Validation, Event Full, Ticket Unavailable, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Validation failed: Event ID is required" }
 *                 error: { type: string, nullable: true, example: "Bad Request" }
 *       '404':
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Event not found" }
 *                 error: { type: string, nullable: true, example: "Not Found" }
 *       '500':
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "An unexpected error occurred" }
 *                 error: { type: string, nullable: true, example: "Internal Server Error" }
 */
router.post(
    '/',
    // authenticate, // Uncomment if registration requires authentication
    // No auth needed for creating registration? Or add authenticate here if required.
    RegistrationController.createRegistration
);

/**
 * @openapi
 * /registrations:
 *   get:
 *     summary: List Registrations
 *     description: Get registrations with filtering, pagination, and authorization.
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: eventId
 *         schema: { type: integer }
 *         required: false
 *         description: Filter by event ID (Organizer/Admin).
 *       - in: query
 *         name: userId
 *         schema: { type: integer }
 *         required: false
 *         description: Filter by user ID (Owner/Admin).
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         required: false
 *         description: Page number.
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         required: false
 *         description: Items per page.
 *     responses:
 *       '200':
 *         description: List of registrations.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Registrations retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     # Fully detailed inline Registration structure for list items
 *                     type: object
 *                     properties:
 *                       id: { type: integer, example: 150 }
 *                       eventId: { type: integer, example: 1 }
 *                       participantId: { type: integer, example: 75 }
 *                       userId: { type: integer, nullable: true, example: 12 }
 *                       status: { type: string, enum: [PENDING, CONFIRMED, CANCELLED], example: "CONFIRMED" }
 *                       created_at: { type: string, format: date-time }
 *                       updated_at: { type: string, format: date-time }
 *                       participant: { $ref: '#/components/schemas/ParticipantSummary' } # Ref summary
 *                       event: { $ref: '#/components/schemas/EventSummary' } # Ref summary
 *                       purchase: { $ref: '#/components/schemas/PurchaseSummary', nullable: true } # Ref summary
 *                 pagination:
 *                   # Fully detailed inline Pagination structure
 *                   type: object
 *                   properties:
 *                     page: { type: integer, example: 1 }
 *                     limit: { type: integer, example: 10 }
 *                     totalCount: { type: integer, example: 53 }
 *                     totalPages: { type: integer, example: 6 }
 *       '400':
 *         description: Bad Request (Invalid Query Params)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Invalid query parameters: page must be an integer" }
 *                 error: { type: string, nullable: true, example: "Bad Request" }
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Authentication required" }
 *                 error: { type: string, nullable: true, example: "Unauthorized" }
 *       '403':
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Forbidden: You do not have permission to view these registrations." }
 *                 error: { type: string, nullable: true, example: "Forbidden" }
 *       '500':
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "An unexpected error occurred" }
 *                 error: { type: string, nullable: true, example: "Internal Server Error" }
 */
router.get(
    '/',
    authenticate, // Apply authentication middleware
    RegistrationController.getRegistrations
);

/**
 * @openapi
 * /registrations/{registrationId}:
 *   get:
 *     summary: Get Registration by ID
 *     description: Get details for one registration with authorization.
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema: { type: integer }
 *         description: ID of the registration.
 *     responses:
 *       '200':
 *         description: Registration details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Registration retrieved successfully"
 *                 data:
 *                   # Fully detailed inline Registration response
 *                   type: object
 *                   properties:
 *                     id: { type: integer, example: 150 }
 *                     eventId: { type: integer, example: 1 }
 *                     participantId: { type: integer, example: 75 }
 *                     userId: { type: integer, nullable: true, example: 12 }
 *                     status: { type: string, enum: [PENDING, CONFIRMED, CANCELLED], example: "CONFIRMED" }
 *                     created_at: { type: string, format: date-time }
 *                     updated_at: { type: string, format: date-time }
 *                     participant: { $ref: '#/components/schemas/Participant' } # Ref for brevity
 *                     event: { $ref: '#/components/schemas/EventSummary' } # Ref for brevity
 *                     purchase: { $ref: '#/components/schemas/Purchase', nullable: true } # Ref for brevity
 *                     responses:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/ResponseDetail' } # Ref for brevity
 *       '400':
 *         description: Bad Request (Invalid ID)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Invalid registration ID: registrationId must be a positive number" }
 *                 error: { type: string, nullable: true, example: "Bad Request" }
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Authentication required" }
 *                 error: { type: string, nullable: true, example: "Unauthorized" }
 *       '403':
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Forbidden: You do not have permission to view this registration." }
 *                 error: { type: string, nullable: true, example: "Forbidden" }
 *       '404':
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Registration not found" }
 *                 error: { type: string, nullable: true, example: "Not Found" }
 *       '500':
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "An unexpected error occurred" }
 *                 error: { type: string, nullable: true, example: "Internal Server Error" }
 */
router.get(
    '/:registrationId',
    authenticate, // Apply authentication middleware
    RegistrationController.getRegistrationById
);

export default router; // Export the router for use in the main app
