// src/validation/ticketValidation.ts
import Joi from 'joi';

export const createTicketSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.empty': 'Ticket name is required',
        'any.required': 'Ticket name is required'
    }),

    description: Joi.string().allow('').optional(),

    price: Joi.number().min(0).required().messages({
        'number.min': 'Price cannot be negative',
        'any.required': 'Price is required'
    }),

    quantityTotal: Joi.number().integer().min(1).required().messages({
        'number.min': 'Quantity must be at least 1',
        'any.required': 'Quantity is required'
    }),

    salesStart: Joi.date().iso().required().messages({
        'date.base': 'Sales start date must be a valid date',
        'any.required': 'Sales start date is required'
    }),

    salesEnd: Joi.date().iso().greater(Joi.ref('salesStart')).required().messages({
        'date.greater': 'Sales end date must be after sales start date',
        'any.required': 'Sales end date is required'
    })
});

export const updateTicketSchema = Joi.object({
    name: Joi.string().optional(),

    description: Joi.string().allow('').optional(),

    price: Joi.number().min(0).optional().messages({
        'number.min': 'Price cannot be negative'
    }),

    quantityTotal: Joi.number().integer().min(1).optional().messages({
        'number.min': 'Quantity must be at least 1'
    }),

    salesStart: Joi.date().iso().optional(),

    salesEnd: Joi.date().iso().optional(),

    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SOLD_OUT').optional()
}).custom((value, helpers) => {
    // If both dates are provided, check that end is after start
    if (value.salesStart && value.salesEnd) {
        const start = new Date(value.salesStart);
        const end = new Date(value.salesEnd);

        if (end <= start) {
            return helpers.error('date.greater', {
                message: 'Sales end date must be after sales start date'
            });
        }
    }

    return value;
});