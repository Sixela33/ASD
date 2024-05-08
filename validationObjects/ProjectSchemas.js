import Joi from "joi";
import schemas from "./schemas.js";

const projectSchema = Joi.object({
    staffBudget: Joi.number().min(0).max(1).required().messages({
        'number.base': 'Staff budget must be a number.',
        'number.min': 'Staff budget must be greater than or equal to zero.',
        'any.required': 'Staff budget is required.'
    }),
    projectContact: Joi.string().max(255).messages({
        'string.max': 'Project contact cannot exceed 255 characters.'
    }),
    projectDate: Joi.date().required().min("1900-12-31").max("9999-12-31").messages({
        'date.base': 'Project date must be a valid date.',
        'any.required': 'Project date is required.'
    }),
    projectDescription: Joi.string().max(255).required().messages({
        'string.empty': 'Project description cannot be empty.',
        'string.max': 'Project description cannot exceed 255 characters.',
        'any.required': 'Project description is required.'
    }),
    clientid: schemas.idSchema.required().messages({
        'any.required': 'Client ID is required.'
    }),
    profitMargin: Joi.number().required().min(0).max(1).messages({
        'number.base': 'Profit margin must be a number.',
        'any.required': 'Profit margin is required.'
    }),
    creatorid: Joi.number().min(0).messages({
        'number.base': 'Creator ID must be a number.',
        'number.min': 'Creator ID must be greater than or equal to zero.'
    }),
    isRecurrent: Joi.boolean()
});

export { projectSchema };
