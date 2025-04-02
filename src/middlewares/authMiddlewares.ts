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
            throw new AuthenticationError('Invalid token');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        // Ensure the decoded token has the expected structure
        if (!decoded.userId) {
            throw new AuthenticationError('Invalid token format');
        }

        req.user = decoded;

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