import { Decimal } from "@prisma/client/runtime/library";

// DTO for creating new events
export interface CreateEventDTO {
    name: string,
    description?: string,
    location: string,
    capacity: number,
    eventType: 'SPORTS' | 'MUSICAL' | 'SOCIAL' | 'VOLUNTEERING',
    isFree: boolean,
    startDateTime: Date | string,
    endDateTime: Date | string,
    tickets?: Array<{
        name: string;
        description?: string;
        price: number;
        quantityTotal: number;
        salesStart: Date;
        salesEnd: Date;
    }>,
    questions: Array<{
        questionText: string;
        isRequired: boolean;
        displayOrder: number;
    }>
}

// Response for event data
export type EventResponse = {
    id: number,
    name: string,
    description: string | null,
    location: string,
    isFree: boolean,
    startDateTime: Date,
    endDateTime: Date,
    status: string,
    organizer: {
        id: number;
        firstName: string;
        lastName: string;
    };
}

// Event filters
export interface EventFilters {
    search?: string;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
    location?: string;
    organiserId?: number;
    status?: string;
    isFree?: boolean;
    myEvents?: boolean;
    isAdmin?: boolean;
    isOrganiser?: boolean;
    adminView?: boolean;
}

// Ticket response interface
export interface TicketResponse {
    id: number;
    eventId: number;
    name: string;
    description: string | null;
    price: Decimal;
    quantityTotal: number;
    quantitySold: number;
    salesStart: Date | null;
    salesEnd: Date | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     EventType:
 *       type: string
 *       enum: [SPORTS, MUSICAL, SOCIAL, VOLUNTEERING]
 *     
 *     EventStatus:
 *       type: string
 *       enum: [DRAFT, PUBLISHED, CANCELLED, COMPLETED]
 *     
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         organiserId:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Tech Conference 2025"
 *         description:
 *           type: string
 *           nullable: true
 *           example: "Annual technology conference"
 *         location:
 *           type: string
 *           example: "San Francisco Convention Center"
 *         capacity:
 *           type: integer
 *           example: 1000
 *         eventType:
 *           $ref: '#/components/schemas/EventType'
 *         isFree:
 *           type: boolean
 *           example: false
 *         startDateTime:
 *           type: string
 *           format: date-time
 *         endDateTime:
 *           type: string
 *           format: date-time
 *         status:
 *           $ref: '#/components/schemas/EventStatus'
 *       required:
 *         - name
 *         - location
 *         - capacity
 *         - eventType
 *         - startDateTime
 *         - endDateTime
 *     
 *     TicketResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "General Admission"
 *         description:
 *           type: string
 *           nullable: true
 *           example: "Standard entry ticket"
 *         price:
 *           type: number
 *           format: float
 *           example: 50.00
 *         quantityTotal:
 *           type: integer
 *           example: 100
 *         quantitySold:
 *           type: integer
 *           example: 45
 *         salesStart:
 *           type: string
 *           format: date-time
 *         salesEnd:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SOLD_OUT]
 *           example: "ACTIVE"
 *     
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 100
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         pages:
 *           type: integer
 *           example: 10
 *     
 *     CreateEventRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Tech Conference 2025"
 *         description:
 *           type: string
 *           example: "Annual technology conference"
 *         location:
 *           type: string
 *           example: "San Francisco Convention Center"
 *         capacity:
 *           type: integer
 *           example: 1000
 *         eventType:
 *           $ref: '#/components/schemas/EventType'
 *         isFree:
 *           type: boolean
 *           example: false
 *         startDateTime:
 *           type: string
 *           format: date-time
 *         endDateTime:
 *           type: string
 *           format: date-time
 *         tickets:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "General Admission"
 *               description:
 *                 type: string
 *                 example: "Standard entry ticket"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 50.00
 *               quantityTotal:
 *                 type: integer
 *                 example: 100
 *               salesStart:
 *                 type: string
 *                 format: date-time
 *               salesEnd:
 *                 type: string
 *                 format: date-time
 *         questions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               questionText:
 *                 type: string
 *                 example: "What is your t-shirt size?"
 *               isRequired:
 *                 type: boolean
 *                 example: true
 *               displayOrder:
 *                 type: integer
 *                 example: 1
 *       required:
 *         - name
 *         - location
 *         - capacity
 *         - eventType
 *         - isFree
 *         - startDateTime
 *         - endDateTime
 *         - questions
 */