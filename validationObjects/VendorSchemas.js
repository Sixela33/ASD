import Joi from "joi";

const vendorSchema = Joi.object({
    vendorname: Joi.string().max(255).min(2).required().messages({
        'string.empty': 'Vendor name cannot be empty.',
        'string.min': 'Vendor name must be at least 2 characters long.',
        'string.max': 'Vendor name cannot exceed 255 characters.',
        'any.required': 'Vendor name is required.'
    }),
    vendorcode: Joi.string().max(50).min(0).messages({
        'string.empty': 'Vendor code cannot be empty.',
        'string.min': 'Vendor code must be at least 0 characters long.',
        'string.max': 'Vendor code cannot exceed 50 characters.',
    }),
})

export { vendorSchema };
