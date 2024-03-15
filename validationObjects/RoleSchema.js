import Joi from "joi"

const roleSchema = Joi.object({
    roleCode: Joi.number().min(0).required(),
    roleName: Joi.string().max(255).required(),
})


export {roleSchema}