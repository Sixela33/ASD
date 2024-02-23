import Joi from "joi"

const arrangementSchema = Joi.object({
    arrangementType: Joi.number().min(0),
    arrangementDescription: Joi.string(),
    clientCost: Joi.number().min(0),
    arrangementQuantity: Joi.number().min(0)
})

const userValidateSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    email: Joi.string().email().required()
})

const projectSchema = Joi.object({
    staffBudget: Joi.number().min(0),
    projectContact: Joi.string().max(255),
    projectDate: Joi.date(),
    projectDescription: Joi.string().max(255),
    clientid: Joi.number().min(0),
    profitMargin: Joi.number(),
    creatorid: Joi.number().min(0)
})

const idSchema = Joi.number().min(0).required()
const usernameSchema = Joi.string().alphanum().min(3).max(30).required()
const passSchema = Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
const emailSchema = Joi.string().email().required()

const fullUserSchema = Joi.object({
    username: usernameSchema,
    password: passSchema,
    email: emailSchema
})

export default {arrangementSchema, userValidateSchema, projectSchema, idSchema, usernameSchema, passSchema, emailSchema, fullUserSchema}