import Joi from "joi";

const statementSchema = Joi.object({
    statementdate: Joi.date().required().messages({
        'date.base': 'Statement date must be a valid date.',
        'any.required': 'Statement date is required.'
    }),
    vendorid: Joi.number().required().min(1).messages({
        'number.base': 'Vendor ID is required.',
        'number.min': 'Vendor ID is required.',
        'any.required': 'Vendor ID is required.'
    }),
    statementid: Joi.number().optional()
});

export { statementSchema }
