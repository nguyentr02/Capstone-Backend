import Joi from 'joi';

// Validation schema for user details update
export const userUpdateSchema = Joi.object({
    firstName: Joi.string().min(3).max(30).optional(),
    lastName: Joi.string().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
    phoneNo: 
        Joi.string().min(10).max(15)
        .pattern(/^\+?[0-9\s\-\(\)]+$/)
        .optional()
        .messages({
            'string.pattern.base': 'Invalid phone number'
        })
});

export const updatePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'New password is required'
      })
  });