
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
    organizerId?: number;
    status?: string;
    isFree?: boolean;
}