import Joi from "joi";

const createTransactionSchema = Joi.object({
    transactiondate: Joi.date().required().messages({
        'date.base': 'Transaction date must be a valid date.',
        'any.required': 'Transaction date is required.'
    }),
    statementid: Joi.number().required().min(1).messages({
        'number.base': 'Statement ID must be a number.',
        'number.min': 'Statement ID must be at least 1.',
        'any.required': 'Statement ID is required.'
    }),
    transactionamount: Joi.number().required().messages({
        'number.base': 'Transaction amount must be a number.',
        'any.required': 'Transaction amount is required.'
    }),
    transactioncode: Joi.string().required().messages({
        'string.base': 'Transaction code must be a string.',
        'any.required': 'Transaction code is required.'
    })
});

const editTransactionSchema = Joi.object({
    transactionid: Joi.number().required().messages({
        'number.base': 'Transaction ID must be a number.',
        'any.required': 'Transaction ID is required.'
    }), 
    transactiondate: Joi.date().required().messages({
        'date.base': 'Transaction date must be a valid date.',
        'any.required': 'Transaction date is required.'
    }),
    transactionamount: Joi.number().required().messages({
        'number.base': 'Transaction amount must be a number.',
        'any.required': 'Transaction amount is required.'
    }), 
    transactioncode: Joi.string().required().messages({
        'string.base': 'Transaction code must be a string.',
        'any.required': 'Transaction code is required.'
    })
})

export { createTransactionSchema, editTransactionSchema };
