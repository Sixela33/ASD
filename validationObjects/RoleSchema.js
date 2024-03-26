import Joi from "joi";

const roleSchema = Joi.object({
    roleCode: Joi.number().min(0).required().messages({
        'number.base': 'Role code must be a number.',
        'number.min': 'Role code must be greater than or equal to zero.',
        'any.required': 'Role code is required.'
    }),
    roleName: Joi.string().max(255).required().messages({
        'string.empty': 'Role name cannot be empty.',
        'string.max': 'Role name cannot exceed 255 characters.',
        'any.required': 'Role name is required.'
    })
});

export { roleSchema };
