import { Router } from 'express';
import { EventController } from '../controllers/eventController';
import { authorize, authenticate, validateRequest, optionalAuthenticate } from '../middlewares/authMiddlewares';
import { verifyEventOwnership } from '../middlewares/eventOwnershipMiddleware';
import { createEventSchema } from '../validation/eventValidation';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Events
 *   description: Event management endpoints
 */

// Public routes
/**
 * @openapi
 * /events:
 *   get:
 *     summary: Get all events
 *     description: Retrieve a list of events with pagination and filtering options
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for event name or description
 *       - in: query
 *         name: eventType
 *         schema:
 *           $ref: '#/components/schemas/EventType'
 *         description: Filter by event type
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: isFree
 *         schema:
 *           type: boolean
 *         description: Filter by free/paid status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events starting after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events ending before this date
 *       - in: query
 *         name: myEvents
 *         schema:
 *           type: boolean
 *         description: For organizers, show only their events
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/EventStatus'
 *         description: Filter by event status (only for organizers viewing their events)
 *     responses:
 *       200:
 *         description: A list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Server error
 */
router.get('/', optionalAuthenticate, EventController.getAllEvents);

/**
 * @openapi
 * /events/{id}:
 *   get:
 *     summary: Get event by ID
 *     description: Retrieve detailed information about a specific event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.get('/:id', EventController.getEventById);

// Protected routes 
/**
 * @openapi
 * /events:
 *   post:
 *     summary: Create a new event
 *     description: Create a new event with basic details, tickets, and questions
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventRequest'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *                 message:
 *                   type: string
 *                   example: "Event created successfully"
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/',
    authenticate,
    // validateRequest(createEventSchema),
    EventController.createEvent);

/**
 * @openapi
 * /events/{id}:
 *   put:
 *     summary: Update an event
 *     description: Update an existing event's details
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventRequest'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the event organizer
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.put('/:id',
    authenticate,
    authorize('ORGANIZER', 'ADMIN'),
    verifyEventOwnership,
    EventController.updateEvent);

/**
* @openapi
* /events/{id}/status:
*   patch:
*     summary: Update event status
*     description: Update an event's status (draft, published, cancelled)
*     tags: [Events]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: integer
*         description: Event ID
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               status:
*                 type: string
*                 enum: [DRAFT, PUBLISHED, CANCELLED]
*                 example: "PUBLISHED"
*             required:
*               - status
*     responses:
*       200:
*         description: Event status updated successfully
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 data:
*                   $ref: '#/components/schemas/Event'
*       400:
*         description: Invalid status value
*       401:
*         description: Unauthorized
*       403:
*         description: Forbidden - not the event organizer
*       404:
*         description: Event not found
*       500:
*         description: Server error
*/
router.patch('/:id/status',
    authenticate,
    authorize('ORGANIZER', 'ADMIN'),
    verifyEventOwnership,
    EventController.updateEventStatus
);

/**
 * @openapi
 * /events/{id}:
 *   delete:
 *     summary: Delete an event
 *     description: Delete an event (only if it has no registrations)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Event deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the event organizer
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.delete('/:id',
    authenticate,
    authorize('ORGANIZER', 'ADMIN'),
    verifyEventOwnership,
    EventController.deleteEvent);



export default router;
