import Joi from "joi";

const idSchema = Joi.number().min(0).integer().messages({
    'number.base': 'ID must be a number.',
    'number.min': 'ID must be greater than or equal to zero.',
    'number.integer': 'ID must be an integer.'
});

const idArrays = Joi.array().items(idSchema.required()).messages({
    'array.base': 'IDs must be provided as an array.',
    'array.required': 'At least one ID must be provided.'
});

const maxLengthString = Joi.string().max(50).min(0).optional().messages({
    'string.max': 'String length cannot exceed 50 characters.',
    'string.min': 'String length cannot be less than zero.'
});

const maxLengthStringMany = Joi.array().items(maxLengthString).sparse(true).messages({
    'array.base': 'Strings must be provided as an array.',
    'array.sparse': 'Invalid or empty strings are ignored.'
});

export default { idSchema, idArrays, maxLengthString, maxLengthStringMany };
