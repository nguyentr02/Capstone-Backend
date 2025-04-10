import Joi from 'joi';
import { ParticipantDto } from '../types/participantTypes';

export const participantValidationSchema = Joi.object<ParticipantDto>({
    email: Joi.string().email().required().messages({
        'string.base': 'Email must be a string',
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required'
    }),
    firstName: Joi.string().required().messages({
        'string.base': 'First name must be a string',
        'any.required': 'First name is required'
    }),
    lastName: Joi.string().required().messages({
        'string.base': 'Last name must be a string',
        'any.required': 'Last name is required'
    }),
    phoneNumber: Joi.string().optional().allow(null, '').messages({
        'string.base': 'Phone number must be a string'
    }),
    // Allow string for date input flexibility, validate format if needed
    dateOfBirth: Joi.alternatives().try(Joi.date(), Joi.string()).optional().allow(null).messages({
         'alternatives.types': 'Date of birth must be a valid date or string'
    }),
    address: Joi.string().optional().allow(null, '').messages({
        'string.base': 'Address must be a string'
    }),
    city: Joi.string().optional().allow(null, '').messages({
        'string.base': 'City must be a string'
    }),
    state: Joi.string().optional().allow(null, '').messages({
        'string.base': 'State must be a string'
    }),
    zipCode: Joi.string().optional().allow(null, '').messages({
        'string.base': 'Zip code must be a string'
    }),
    country: Joi.string().optional().allow(null, '').messages({
        'string.base': 'Country must be a string'
    })
});
