import Joi from "joi";

const transactionSchema = Joi.object({
    transactiondate: Joi.date().required().messages({
        'date.base': 'Transaction date must be a valid date.',
        'any.required': 'Transaction date is required.'
    }),
    vendorid: Joi.number().required().min(1).messages({
        'number.base': 'Vendor ID is required.',
        'number.min': 'Vendor ID is required.',
        'any.required': 'Vendor ID is required.'
    }),
    transactionid: Joi.number().optional()
});

export { transactionSchema }
