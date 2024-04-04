import Joi from "joi";
import schemas from "./schemas.js";

const invoiceSchema = Joi.object({
    invoiceAmount: Joi.number().min(0).required().messages({
        'number.base': 'Invoice amount must be a number.',
        'number.min': 'Invoice amount must be greater than or equal to zero.',
        'any.required': 'Invoice amount is required.'
    }),
    vendor: schemas.idSchema.required().messages({
        'any.required': 'Vendor ID is required.'
    }),
    dueDate: Joi.date().required().messages({
        'date.base': 'Due date must be a valid date.',
        'any.required': 'Due date is required.'
    }),
    invoiceNumber: Joi.string().required().messages({
        'any.required': 'Invoice number is required.'
    }),
    invoiceid: Joi.number().min(0).messages({
        'number.base': 'Invoice ID must be a number.',
        'number.min': 'Invoice ID must be greater than or equal to zero.'
    }),
    fileLocation: Joi.string().messages({
        'string.base': 'File location must be a string.'
    }),
    invoiceTax: Joi.number().min(0).messages({
        'number.base': 'Invoice Tax must be a number.',
        'number.min': 'Invoice Tax must be greater than or equal to zero.'

    })
});

const invoiceFlowerSchema = Joi.object({
    flowerid: schemas.idSchema.required().messages({
        'any.required': 'Flower ID is required.'
    }),
    projectid: schemas.idSchema.required().messages({
        'any.required': 'Project ID is required.'
    }),
    unitPrice: Joi.number().min(0).required().messages({
        'number.base': 'Unit price must be a number.',
        'number.min': 'Unit price must be greater than or equal to zero.',
        'any.required': 'Unit price is required.'
    }),
    filledStems: Joi.number().min(0).required().messages({
        'number.base': 'Filled stems must be a number.',
        'number.min': 'Filled stems must be greater than or equal to zero.',
        'any.required': 'Filled stems is required.'
    })
});

const invoiceArrayFlowerSchema = Joi.array().items(invoiceFlowerSchema).messages({
    'array.base': 'Invoice flowers must be provided as an array.'
});

const bankTransactionSchema = Joi.string().required().messages({
    'string.empty': 'Bank transaction cannot be empty.',
    'any.required': 'Bank transaction is required.'
});

export { invoiceSchema, invoiceFlowerSchema, invoiceArrayFlowerSchema, bankTransactionSchema };
