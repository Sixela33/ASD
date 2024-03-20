import Joi from "joi"
import schemas from "./schemas.js"

const projectSchema = Joi.object({
    staffBudget: Joi.number().min(0).required(),
    projectContact: Joi.string().max(255),
    projectDate: Joi.date().required(),
    projectDescription: Joi.string().max(255).required(),
    clientid: schemas.idSchema.required(),
    profitMargin: Joi.number().required(),
    creatorid: Joi.number().min(0)
})


export {projectSchema}