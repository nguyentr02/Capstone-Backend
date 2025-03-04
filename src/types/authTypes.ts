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

export interface UserDto {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNo: string|null;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

// User object without password for authentication response
export interface AuthResponse {
    user: UserDto; 
    accessToken: string;
}

// Access token response
export interface TokenResponse {
    accessToken: string;
}

// Decoded refresh token structure
export interface RefreshTokenPayload {
    user_id: number;
    iat?: number;
    exp?: number;
}

// JWT Payload structure for access token
export interface JwtPayload {
    user_id: number;
    role: UserRole;
    iat?: number;
    exp?: number;
}

// Extend Express Request type to include user information
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload
        }
    }
}