import Joi from 'joi';
import { RegistrationDto } from '../types/registrationTypes';
import { participantValidationSchema } from './participantValidation'; // Assuming participant validation exists

export const registrationValidationSchema = Joi.object<RegistrationDto>({
    eventId: Joi.number().integer().positive().required().messages({
        'number.base': 'Event ID must be a number',
        'number.integer': 'Event ID must be an integer',
        'number.positive': 'Event ID must be a positive number',
        'any.required': 'Event ID is required'
    }),
    participant: participantValidationSchema.required().messages({ // Reuse participant validation
        'any.required': 'Participant details are required'
    }),
    ticketId: Joi.number().integer().positive().optional().messages({
        'number.base': 'Ticket ID must be a number',
        'number.integer': 'Ticket ID must be an integer',
        'number.positive': 'Ticket ID must be a positive number'
    }),
    quantity: Joi.number().integer().min(1).optional().messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be an integer',
        'number.min': 'Quantity must be at least 1'
    }),
    responses: Joi.array().items(
        Joi.object({
            questionId: Joi.number().integer().positive().required().messages({
                'number.base': 'Question ID must be a number',
                'number.integer': 'Question ID must be an integer',
                'number.positive': 'Question ID must be a positive number',
                'any.required': 'Question ID is required for each response'
            }),
            responseText: Joi.string().required().allow('').messages({ // Allow empty strings for optional text questions
                'string.base': 'Response text must be a string',
                'any.required': 'Response text is required for each response'
            })
        })
    ).required().messages({
        'array.base': 'Responses must be an array',
        'any.required': 'Responses are required'
    })
});

// Validation for retrieving registrations (e.g., by event or user)
export const getRegistrationsQuerySchema = Joi.object({
    eventId: Joi.number().integer().positive().optional(),
    userId: Joi.number().integer().positive().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
});

// Validation for getting a single registration by ID (path parameter)
export const getRegistrationParamsSchema = Joi.object({
    registrationId: Joi.number().integer().positive().required().messages({
        'number.base': 'Registration ID must be a number',
        'number.integer': 'Registration ID must be an integer',
        'number.positive': 'Registration ID must be a positive number',
        'any.required': 'Registration ID is required in path'
    }),
});

// Validation for cancelling a registration
export const cancelRegistrationParamsSchema = Joi.object({
    registrationId: Joi.number().integer().positive().required().messages({
        'number.base': 'Registration ID must be a number',
        'number.integer': 'Registration ID must be an integer',
        'number.positive': 'Registration ID must be a positive number',
        'any.required': 'Registration ID is required'
    }),
});
