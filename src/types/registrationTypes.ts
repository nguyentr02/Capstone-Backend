// Registration DTO with participant profile
import { ParticipantDto } from './participantTypes';

export interface RegistrationDto {
    eventId: number;
    participant: ParticipantDto;
    ticketId?: number; // Optional for free events
    quantity?: number; // Optional for free events
    responses: Array<{
        questionId: number;
        responseText: string;
    }>
    userId?: number; // Optional, if user is registering through an account
}