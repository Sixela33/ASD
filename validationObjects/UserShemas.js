import Joi from "joi"

const usernameSchema = Joi.string().min(3).max(30).required()
const passSchema = Joi.string().min(5).max(50).required()
const emailSchema = Joi.string().email().required()

const fullUserSchema = Joi.object({
    username: usernameSchema,
    password: passSchema,
    email: emailSchema
})

export {fullUserSchema, usernameSchema, passSchema, emailSchema}