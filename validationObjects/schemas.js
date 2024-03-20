import Joi from "joi"

const idSchema = Joi.number().min(0).integer()
const idArrays = Joi.array().items(idSchema.required())

const maxLengthString = Joi.string().max(50).min(0).optional()
const maxLengthStringMany = Joi.array().items(maxLengthString).sparse(true)

export default {idSchema, idArrays, maxLengthString, maxLengthStringMany}