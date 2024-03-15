import Joi from "joi"

const clientSchema = Joi.string().max(255).min(2).required()

export {clientSchema}