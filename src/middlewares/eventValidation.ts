import {Request, Response, NextFunction} from 'express';
import { CreateEventDTO } from '../types/eventTypes';

export const validateEventCreation = (
    req: Request,
    res: Response, 
    next: NextFunction) => {
        const data = req.body as CreateEventDTO;
        const errors : string[] = [];

        //Check required fields
        if (!data.name) {
            errors.push('Name is required');
        }

        if (!data.location) {
            errors.push('Location is required');
        }

        if (!data.capacity) {
            errors.push('Capacity is required');
        }

        // Validate dates
        if (!data.startDateTime || !data.endDateTime) {
            errors.push('Start and end date are required');
        }
        else {
            const startDate = new Date(data.startDateTime);
            const endDate = new Date(data.endDateTime);

            if (endDate <= startDate) {
                errors.push('End date must be after start date');
            }

            if (startDate < new Date()) {
                errors.push('Start date must be in the future');
            }
        }

        // Validate questions array
        if (!data.questions || !Array.isArray(data.questions) || data.questions.length ===0) {
            errors.push('At least one question is required');
        }
        else {
            data.questions.forEach((q, index) => {

                // Validate question text
                if (!q.questionText?.trim()) {
                    errors.push(`Question ${index + 1} is missing text`);
                }

                // Validate display order
                if (typeof(q.displayOrder) !== 'number') {
                    errors.push(`Question ${index + 1} has invalid display order`);
                }


            })
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors
            });
        }

        next();
};
