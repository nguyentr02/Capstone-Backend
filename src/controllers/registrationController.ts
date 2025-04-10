import { Request, Response, NextFunction } from 'express';
import { RegistrationService } from '../services/registrationServices';
import {
    registrationValidationSchema,
    getRegistrationsQuerySchema,
    getRegistrationParamsSchema
} from '../validation/registrationValidation';
import { RegistrationDto } from '../types/registrationTypes';
import { AppError } from '../utils/errors'; // custom error handler

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

    /**
     * Handle GET /registrations
     * Retrieves a list of registrations based on query filters.
     * Requires authentication.
     */
    static async getRegistrations(req: Request, res: Response, next: NextFunction): Promise<void> { // Changed type to Request
        try {
            // 1. Validate query parameters
            const { error: queryError, value: queryValue } = getRegistrationsQuerySchema.validate(req.query);
            if (queryError) {
                throw new AppError(400, `Invalid query parameters: ${queryError.details.map(x => x.message).join(', ')}`);
            }

            // Ensure req.user is populated by authentication middleware
            if (!req.user) {
                throw new AppError(401, 'Authentication required');
            }

            // 2. Call service method
            const { registrations, totalCount } = await RegistrationService.getRegistrations(queryValue, req.user);

            // 3. Send response with pagination metadata
            res.status(200).json({
                message: 'Registrations retrieved successfully',
                data: registrations,
                pagination: {
                    page: queryValue.page,
                    limit: queryValue.limit,
                    totalCount: totalCount,
                    totalPages: Math.ceil(totalCount / queryValue.limit)
                }
            });

        } catch (err) {
            next(err);
        }
    }

    /**
     * Handle GET /registrations/:registrationId
     * Retrieves a single registration by its ID.
     * Requires authentication.
     */
    static async getRegistrationById(req: Request, res: Response, next: NextFunction): Promise<void> { // Changed type to Request
        try {
            // 1. Validate path parameter
            const { error: paramsError, value: paramsValue } = getRegistrationParamsSchema.validate(req.params);
            if (paramsError) {
                throw new AppError(400, `Invalid registration ID: ${paramsError.details.map(x => x.message).join(', ')}`);
            }

            // Ensure req.user is populated
            if (!req.user) {
                throw new AppError(401, 'Authentication required');
            }

            const { registrationId } = paramsValue;

            // 2. Call service method
            const registration = await RegistrationService.getRegistrationById(registrationId, req.user);

            // Service method should throw error if not found or not authorized
            // If it returns successfully, send the data

            // 3. Send response
            res.status(200).json({
                message: 'Registration retrieved successfully',
                data: registration
            });

        } catch (err) {
            // Handle potential errors from service (e.g., NotFoundError, ForbiddenError)
            // Or let the global error handler manage them based on AppError statusCode
            next(err);
        }
    }
}
