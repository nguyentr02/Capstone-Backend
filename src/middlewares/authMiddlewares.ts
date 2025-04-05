import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/errors';
import { JwtPayload } from '../types/authTypes';
import { Schema } from 'joi';

// Middleware to authenticate (must be logged in)
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error('Invalid token');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        console.log('Decoded token payload:', decoded); // See what's in the token

        req.user = decoded;
        console.log('User from token:', req.user); // Check if user is set correctly

        // Ensure the decoded token has the expected structure
        if (!decoded.userId) {
            throw new AuthenticationError('Invalid token format');
        }

        

        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new AuthenticationError('Invalid token'));
        } else {
            next(error);
        }
    }
}

export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            // No token provided, continue as public access
            console.log('No token provided, continuing as public access');
            next();
            return;
        }

        // Token provided, try to verify it
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
            req.user = decoded;
            console.log('User authenticated:', req.user);
            next();
        } catch (tokenError) {
            // Invalid token, but continue as public access
            console.log('Token verification failed, continuing as public access');
            next();
        }
    }
    catch (error) {
        // Any other error, continue as public access
        console.log('Authentication error, continuing as public access');
        next();
    }
}

// Middleware to authorize user roles (only certain roles can access)
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {

        if (!req.user) {
            return next(new AuthenticationError('Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AuthenticationError('Insufficient permissions'));
        }

        next();
    }
}

// Middleware to validate request body
export const validateRequest = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {

        const { error } = schema.validate(req.body);

        if (error) {
            return next(new AuthenticationError(error.details[0].message));
        }

        next(); 
    }
}