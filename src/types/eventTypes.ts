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
// This interface should match the structure of the ticket data returned from the database
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
  
