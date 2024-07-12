import Joi from "joi";
import schemas from "./schemas.js";

const addNewServiceSchema = Joi.object({
    description: Joi.string().required().max(255).messages({
        'string.empty': 'Description cannot be empty.',
        'string.max': 'Description cannot exceed 255 characters.',
        'any.required': 'Description is required.'
    }),
    clientcost: Joi.number().required().min(0).messages({
        'number.base': 'Client cost must be a number.',
        'number.min': 'Client cost must be a positive number or zero.',
        'any.required': 'Client cost is required.'
    }),
    ammount: Joi.number().required().min(0).messages({
        'number.base': 'extra service amount must be a number.',
        'number.min': 'extra service amount must be a positive number or zero.',
        'any.required': 'extra service amount is required.'
    })
});

const editServiceSchema = Joi.object({
    description: Joi.string().required().max(255).messages({
        'string.empty': 'Description cannot be empty.',
        'string.max': 'Description cannot exceed 255 characters.',
        'any.required': 'Description is required.'
    }),
    clientcost: Joi.number().required().min(0).messages({
        'number.base': 'Client cost must be a number.',
        'number.min': 'Client cost must be a positive number or zero.',
        'any.required': 'Client cost is required.'
    }),
    aditionalid: schemas.idSchema.required().messages({
        'any.required': 'Additional ID is required.'
    }),
    ammount: Joi.number().required().min(0).messages({
        'number.base': 'extra service amount must be a number.',
        'number.min': 'extra service amount must be a positive number or zero.',
        'any.required': 'extra service amount is required.'
    })
});

const newServiceArray = Joi.array().items(addNewServiceSchema)

export { addNewServiceSchema, editServiceSchema, newServiceArray};
