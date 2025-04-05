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
    salesEnd?: Date | string;
    status?: TicketStatus;
    quantitySold?: number;
}
