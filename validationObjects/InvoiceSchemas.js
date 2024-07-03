import Joi from "joi";
import schemas from "./schemas.js";

const invoiceSchema = Joi.object({
    invoiceAmount: Joi.number().required().messages({
        'number.base': 'Invoice amount must be a number.',
        'any.required': 'Invoice amount is required.'
    }),
    vendor: schemas.idSchema.required().messages({
        'any.required': 'Vendor ID is required.'
    }),
    dueDate: Joi.date().required().min("1900-12-31").max("9999-12-31").messages({
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
    })
});

const invoiceFlowerSchema = Joi.object({
    flowerid: schemas.idSchema.required().messages({
        'any.required': 'Flower ID is required.'
    }),
    projectid: schemas.idSchema.required().messages({
        'any.required': 'Project ID is required.'
    }),
    unitprice: Joi.number().required().messages({
        'number.base': 'Unit price must be a number.',
        'any.required': 'Unit price is required.'
    }),
    stemsperbox: Joi.number().min(1).required().messages({
        'number.base': 'Stems per box must be a number.',
        'number.min': 'Stems per box must be greater than or equal to one.',
        'any.required': 'Stems per box is required.'
    }),
    boxprice: Joi.number().required().messages({
        'number.base': 'Box price must be a number.',
        'any.required': 'Box price is required.'
    }),
    boxespurchased: Joi.number().min(1).required().messages({
        'number.base': 'Boxes purchased must be a number.',
        'number.min': 'Boxes purchased must be greater than or equal to one.',
        'any.required': 'Boxes purchased is required.'
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
