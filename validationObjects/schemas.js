import Joi from "joi"

const idSchema = Joi.number().min(0).required().integer()
const idArrays = Joi.array().items(idSchema)

export default {idSchema, idArrays}