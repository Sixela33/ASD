import Joi from "joi";

const clientSchema = Joi.string().max(255).min(2).required().messages({
    'string.empty': 'Client name cannot be empty.',
    'string.min': 'Client name must be at least 2 characters long.',
    'string.max': 'Client name cannot exceed 255 characters.',
    'any.required': 'Client name is required.'
});

export { clientSchema };
