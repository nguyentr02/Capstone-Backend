import { TicketStatus } from '@prisma/client';

export interface CreateTicketDTO {
    eventId: number;
    name: string;
    description?: string;
    price: number;
    quantityTotal: number;
    salesStart: Date | string;
    salesEnd: Date | string;
}

export interface UpdateTicketDTO {
    name?: string;
    description?: string;
    price?: number;
    quantityTotal?: number;
    salesStart?: Date | string;
    salesEnd?: TicketStatus;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     TicketStatus:
 *       type: string
 *       enum: [ACTIVE, INACTIVE, SOLD_OUT]
 *     
 *     CreateTicketRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "General Admission"
 *         description:
 *           type: string
 *           example: "Standard entry ticket"
 *         price:
 *           type: number
 *           format: float
 *           example: 50.00
 *         quantityTotal:
 *           type: integer
 *           example: 100
 *         salesStart:
 *           type: string
 *           format: date-time
 *           example: "2025-01-01T00:00:00Z"
 *         salesEnd:
 *           type: string
 *           format: date-time
 *           example: "2025-02-28T23:59:59Z"
 *       required:
 *         - name
 *         - price
 *         - quantityTotal
 *         - salesStart
 *         - salesEnd
 *     
 *     UpdateTicketRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "General Admission"
 *         description:
 *           type: string
 *           example: "Standard entry ticket"
 *         price:
 *           type: number
 *           format: float
 *           example: 50.00
 *         quantityTotal:
 *           type: integer
 *           example: 100
 *         salesStart:
 *           type: string
 *           format: date-time
 *           example: "2025-01-01T00:00:00Z"
 *         salesEnd:
 *           type: string
 *           format: date-time
 *           example: "2025-02-28T23:59:59Z"
 *         status:
 *           $ref: '#/components/schemas/TicketStatus'
 *     
 *     TicketDetailResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         eventId:
 *           type: integer
 *           example: 5
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
 *           example: "2025-01-01T00:00:00Z"
 *         salesEnd:
 *           type: string
 *           format: date-time
 *           example: "2025-02-28T23:59:59Z"
 *         status:
 *           $ref: '#/components/schemas/TicketStatus'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
