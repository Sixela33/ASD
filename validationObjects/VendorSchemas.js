import Joi from "joi"

const vendorSchema = Joi.string().max(255).min(2).required()

export {vendorSchema}