
// DTO for creating new events
export interface CreateEventDTO {
    name: string,
    description?: string,
    location: string,
    startDateTime: Date | string,
    endDateTime: Date | string,
}

// Filters for event data
export interface EventFilters {
    status?: string,
    location?: string, 
    startDateTime: Date | string,
    endDateTime: Date | string,
}

// Response for event data
export type EventResponse = {
    id: number,
    name: string,
    description: string | null,
    location: string,
    startDateTime: Date,
    endDateTime: Date,
    status: string,
    organizer: {
        id: number;
        firstName: string;
        lastName: string;
    };
}