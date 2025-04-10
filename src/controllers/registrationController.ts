import { Request, Response, NextFunction } from 'express';
import { RegistrationService } from '../services/registrationServices';
import { registrationValidationSchema } from '../validation/registrationValidation';
import { RegistrationDto } from '../types/registrationTypes';
import { AppError } from '../utils/errors'; // Assuming a custom error handler exists

export class RegistrationController {
    /**
     * Handle POST /registrations
     * Creates a new registration for an event.
     */
    static async createRegistration(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // 1. Validate request body
            const { error, value } = registrationValidationSchema.validate(req.body);
            if (error) {
                // Use status 400 for validation errors
                // Corrected argument order: statusCode first, then message
                throw new AppError(400, `Validation failed: ${error.details.map(x => x.message).join(', ')}`);
            }

            const registrationData: RegistrationDto = value;

            // 2. Call the service to create the registration
            const newRegistration = await RegistrationService.registerForEvent(registrationData);

            // 3. Send response
            res.status(201).json({
                message: 'Registration successful',
                data: newRegistration
            });

        } catch (err) {
            // Pass errors to the global error handler
            next(err);
        }
    }

    // TODO: Add controller methods for getRegistrations, getRegistrationById, cancelRegistration etc.
}
