export interface ParticipantProfileDto {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dateOfBirth?: Date | string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
}