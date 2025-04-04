import Joi from 'joi';

// 01 - Base schema for ticket validation
const ticketSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    price: Joi.number().min(0).required(),
    quantityTotal: Joi.number().integer().min(1).required(),
    salesStart: Joi.date().required(),
    salesEnd: Joi.date().greater(Joi.ref('salesStart')).required()
})

// 02 - Base schema for question validation
const questionSchema = Joi.object({
    questionText: Joi.string().required(),
    isRequired: Joi.boolean().default(false),
    displayOrder: Joi.number().integer().required()
})

// 03 - Schema for creating events
export const createEventSchema = Joi.object({

    // Event basic information validation
    name: Joi.string().required(),
    description: Joi.string().optional(),
    location: Joi.string().required(),
    capacity: Joi.number().integer().min(1).required(),
    eventType: Joi.string().valid('SPORTS', 'MUSICAL', 'SOCIAL', 'VOLUNTEERING').required(),
    isFree: Joi.boolean().default(false),

    startDateTime: Joi.date().greater('now').required(),
    endDateTime: Joi.date().greater(Joi.ref('startDateTime')).required(),

    // Tickets  - required if event is not free
    tickets: Joi.alternatives().conditional(
        'isFree', {
        is: false,
        then: Joi.array().items(ticketSchema).min(1).required(),
        otherwise: Joi.array().items(ticketSchema).min(0).optional()
    }
    ),
    // Questions validation - always required
    questions: Joi.array().items(questionSchema).min(1).required(),
});

// 04 - Schema for updating events with optional fields
export const updateEventSchema = Joi.object({
    // All fields are optional for updates
    name: Joi.string().optional(),
    describetion: Joi.string().optional(),
    location: Joi.string().optional(),
    capacity: Joi.number().integer().min(1).optional(),
    eventType: Joi.string().valid('SPORTS', 'MUSICAL', 'SOCIAL', 'VOLUNTEERING').optional(),
    isFree: Joi.boolean().optional(),

    startDateTime: Joi.date().greater('now').optional(),
    endDateTime: Joi.date().greater(Joi.ref('startDateTime')).optional(),

    // Tickets  - required if changing from free to paid
    tickets: Joi.alternatives().conditional(
        'isFree', {
        is: false,
        then: Joi.array().items(ticketSchema).min(1).required(),
        otherwise: Joi.array().items(ticketSchema).min(0).optional()
    }
    ),

    // Questions validation - always required
    questions: Joi.array().items(questionSchema).min(1).optional(),
}).custom((value, helpers) => {
    // If both dates are provided, check if endDateTime is greater than startDateTime
    if (value.startDateTime && value.endDateTime && new Date(value.endDateTime) <= new Date(value.startDateTime)) {
        return helpers.error('date.greater', {
            message: 'endDateTime must be greater than startDateTime'
        }
        );
    }

    // If changing from free to paid, ensure tickets are provided
    if (value.isFree === false && !value.tickets) {
        return helpers.error('array.min', {
            message: 'tickets are required when isFree is false'
        });
    }

    return value;
})

// 05 - Schema for updating event status
export const updateEventStatusSchema = Joi.object({
    status: Joi.string().valid('DRAFT, PUBLISHED', 'CANCELLED').required()
})

