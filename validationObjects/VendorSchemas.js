import Joi from "joi";

const vendorSchema = Joi.string().max(255).min(2).required().messages({
    'string.empty': 'Vendor name cannot be empty.',
    'string.min': 'Vendor name must be at least 2 characters long.',
    'string.max': 'Vendor name cannot exceed 255 characters.',
    'any.required': 'Vendor name is required.'
});

export { vendorSchema };
