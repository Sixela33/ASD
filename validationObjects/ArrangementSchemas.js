import Joi from "joi";
import schemas from "./schemas.js";

const arrangementSchema = Joi.object({
    arrangementType: schemas.idSchema.required().messages({
        'any.required': 'Arrangement type is required.',
        'any.empty': 'Arrangement type cannot be empty.'
    }),
    arrangementDescription: Joi.string().required().messages({
        'string.empty': 'Arrangement description cannot be empty.',
        'any.required': 'Arrangement description is required.'
    }),
    clientCost: Joi.number().min(0).required().messages({
        'number.base': 'Client cost must be a number.',
        'number.min': 'Client cost must be greater than or equal to zero.',
        'any.required': 'Client cost is required.'
    }),
    arrangementQuantity: Joi.number().min(0).required().messages({
        'number.base': 'Arrangement quantity must be a number.',
        'number.min': 'Arrangement quantity must be greater than or equal to zero.',
        'any.required': 'Arrangement quantity is required.'
    }),
    installationTimes: Joi.number().min(1).required().messages({
        'number.base': 'Installation times must be a number.',
        'number.min': 'Installation times must be greater than or equal to one.',
        'any.required': 'Installation times are required.'
    }),
    arrangementLocation: Joi.string().max(100).required().messages({
        'string.base': 'Arrangement location must be a string.',
        'string.max': 'Arrangement location must be at most 100 characters long.',
        'any.required': 'Arrangement location is required.',
        'string.empty': 'Arrangement location cannot be empty.'
    })
});

const flowerToPopulateArrangementSchema = Joi.object({
    flowerID: Joi.number().integer().min(1).required().messages({
        'number.base': 'Flower ID must be a number.',
        'number.integer': 'Flower ID must be an integer.',
        'number.min': 'Flower ID must be greater than or equal to one.',
        'any.required': 'Flower ID is required.'
    }),
    quantity: Joi.number().min(1).required().messages({
        'number.base': 'Flower quantity must be a number.',
        'number.min': 'Flower quantity must be greater than or equal to one.',
        'any.required': 'Flower quantity is required.'
    })
});

export { arrangementSchema, flowerToPopulateArrangementSchema };
