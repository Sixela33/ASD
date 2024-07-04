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

const startDateEndDateSchema = Joi.object({
    startDate: Joi.date().min("1900-12-31").max("9999-12-31").allow('').messages({
        'date.base': 'From date must be a valid date format.',
        'date.min': 'From date cannot be earlier than December 31, 1900.',
        'date.max': 'From date cannot be later than December 31, 9999.'
    }),
    endDate: Joi.when('startDate', {
        is: Joi.date().min("1900-12-31").max("9999-12-31").required(),
        then: Joi.date().min(Joi.ref('startDate')).max("9999-12-31").allow('').messages({
            'date.base': 'To date must be a valid date format.',
            'date.min': 'To date cannot be earlier than the project start date.',
            'date.max': 'To date cannot be later than December 31, 9999.'
        }),
        otherwise: Joi.date().max("9999-12-31").allow('').messages({
            'date.base': 'To date must be a valid date format.',
            'date.max': 'To date cannot be later than December 31, 9999.'
        })
    })
})

const minMaxNumbers = Joi.object({
    minAmount: Joi.number().allow('').messages({}), 
    maxAmount: Joi.when('minAmount', {
        is:Joi.number().messages({}),
        then: Joi.number().min(Joi.ref('minAmount')).allow('').messages({}),
        otherwise: Joi.number().allow('').messages({})
    })
})

export default { idSchema, idArrays, maxLengthString, maxLengthStringMany, startDateEndDateSchema, minMaxNumbers };
