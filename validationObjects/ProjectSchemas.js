import Joi from "joi";
import schemas from "./schemas.js";

const projectSchema = Joi.object({
    staffBudget: Joi.number().min(0).max(1).required().messages({
        'number.base': 'Staff budget must be a valid number.',
        'number.min': 'Staff budget must be greater than or equal to zero.',
        'number.max': 'Staff budget must be less than or equal to one.',
        'any.required': 'Staff budget is a required field.'
    }),
    projectContact: Joi.string().max(255).messages({
        'string.base': 'Project contact must be a valid string.',
        'string.max': 'Project contact cannot exceed 255 characters.'
    }),
    projectDate: Joi.date().required().min("1900-12-31").max("9999-12-31").messages({
        'date.base': 'Project date must be a valid date format.',
        'date.min': 'Project date cannot be earlier than December 31, 1900.',
        'date.max': 'Project date cannot be later than December 31, 9999.',
        'any.required': 'Project date is a required field.'
    }),
    projectEndDate: Joi.date().required().min(Joi.ref('projectDate')).max("9999-12-31").messages({
        'date.base': 'Project end date must be a valid date format.',
        'date.min': 'Project end date cannot be earlier than the project start date.',
        'date.max': 'Project end date cannot be later than December 31, 9999.',
        'any.required': 'Project end date is a required field.'
    }),
    projectDescription: Joi.string().max(255).required().messages({
        'string.base': 'Project description must be a valid string.',
        'string.empty': 'Project description cannot be empty.',
        'string.max': 'Project description cannot exceed 255 characters.',
        'any.required': 'Project description is a required field.'
    }),
    clientid: schemas.idSchema.required().messages({
        'any.required': 'Client ID is a required field.'
    }),
    profitMargin: Joi.number().required().min(0).max(1).messages({
        'number.base': 'Profit margin must be a valid number.',
        'number.min': 'Profit margin must be greater than or equal to zero.',
        'number.max': 'Profit margin must be less than or equal to one.',
        'any.required': 'Profit margin is a required field.'
    }),
    creatorid: Joi.number().min(0).messages({
        'number.base': 'Creator ID must be a valid number.',
        'number.min': 'Creator ID must be greater than or equal to zero.'
    }),
    isRecurrent: Joi.boolean().messages({
        'boolean.base': 'Is recurrent must be a valid boolean.'
    })
});

export { projectSchema };
