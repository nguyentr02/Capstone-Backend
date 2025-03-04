import Joi from 'joi';

export const registerSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'Password is required'
        }),

    confirmPassword: Joi.ref('password'),

    firstName: Joi.string()
        .required()
        .messages({
            'any.required': 'First name is required'
        }),
        
    lastName: Joi.string()
        .required()
        .messages({
            'any.required': 'Last name is required'
        }),
        
    phoneNo: Joi.string()
        .pattern(/^\+?[0-9\s\-\(\)]+$/)
        .optional()
        .messages({
            'string.pattern.base': 'Please provide a valid phone number'
        })
});

export const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});