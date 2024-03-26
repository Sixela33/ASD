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
