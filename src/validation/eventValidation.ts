import Joi from 'joi';

export const createEventSchema = Joi.object({

    // Event basic information validation
    name: Joi.string().required(),
    description: Joi.string().optional(),
    location: Joi.string().required(),
    eventType: Joi.string().valid('SPORTS', 'MUSICAL', 'SOCIAL', 'VOLUNTEERING').required(),
    startDateTime: Joi.date().greater('now').required(),
    endDateTime: Joi.date().greater(Joi.ref('startDateTime')).required(),
    capacity: Joi.number().integer().min(1).required(),
    
    // Tickets validation
    tickets: Joi.array().items(
        Joi.object({
            name: Joi.string().required(),
            description: Joi.string().optional(),
            price: Joi.number().min(0).required(),
            quantityTotal: Joi.number().integer().min(1).required(),
            salesStart: Joi.date().required(),
            salesEnd: Joi.date().greater(Joi.ref('salesStart')).required()
        })
    ).min(1).required(),
    
    // Questions validation
    questions: Joi.array().items(
        Joi.object({
            questionText: Joi.string().required(),
            isRequired: Joi.boolean().default(false),
            displayOrder: Joi.number().integer().required()
        })
    ).min(1).required()
});