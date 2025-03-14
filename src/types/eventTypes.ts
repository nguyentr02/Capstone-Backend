
// DTO for creating new events
export interface CreateEventDTO {
    name: string,
    description?: string,
    location: string,
    capacity: number,
    eventType: 'SPORTS' | 'MUSICAL' | 'SOCIAL' | 'VOLUNTEERING',

    startDateTime: Date | string,
    endDateTime: Date | string,
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
    startDateTime: Date,
    endDateTime: Date,
    status: string,
    organizer: {
        id: number;
        firstName: string;
        lastName: string;
    };
}