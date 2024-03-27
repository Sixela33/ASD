import Joi from "joi";

const usernameSchema = Joi.string().min(5).max(30).required().messages({
    'string.empty': 'Username cannot be empty.',
    'string.min': 'Username must be at least 5 characters long.',
    'string.max': 'Username cannot exceed 30 characters.',
    'any.required': 'Username is required.'
});

const passSchema = Joi.string().min(8).max(50).required().pattern(new RegExp('^(?=.*[A-Z])(?=.*[0-9]).{5,50}$')).messages({
    'string.empty': 'Password cannot be empty.',
    'string.min': 'Password must be at least 8 characters long.',
    'string.max': 'Password cannot exceed 50 characters.',
    'string.pattern.base': 'Password must contain at least one uppercase letter and one digit.',
    'any.required': 'Password is required.'
});

const emailSchema = Joi.string().email().required().messages({
    'string.empty': 'Email cannot be empty.',
    'string.email': 'Email must be a valid email address.',
    'any.required': 'Email is required.'
});

const fullUserSchema = Joi.object({
    username: usernameSchema,
    password: passSchema,
    email: emailSchema
});

export { fullUserSchema, usernameSchema, passSchema, emailSchema };
