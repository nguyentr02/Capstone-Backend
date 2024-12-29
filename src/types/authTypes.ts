import {User, UserRole} from '@prisma/client';

export interface RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNo?: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

// User object without password
export interface AuthResponse {
    user: Omit<User, 'password'>; // Omit password from User when returning
    // user: User;
    accessToken: string;
    refreshToken: string;
}

// JWT Payload
export interface JwtPayload {
    user_id: number;
    email: string;
    role: UserRole;
}

// Extend Express Request type to include user information
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload
        }
    }
}