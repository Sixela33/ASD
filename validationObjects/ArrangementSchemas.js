import Joi from "joi"
import schemas from "./schemas.js"

const arrangementSchema = Joi.object({
    arrangementType: schemas.idSchema.required(),
    arrangementDescription: Joi.string().required(),
    clientCost: Joi.number().min(0).required(),
    arrangementQuantity: Joi.number().min(0).required()
})

const flowerToPopulateArrangementSchema = Joi.object({
        flowerID: Joi.number().integer().min(1).required(),
        quantity: Joi.number().min(1).required(),
    })    


export {arrangementSchema, flowerToPopulateArrangementSchema}