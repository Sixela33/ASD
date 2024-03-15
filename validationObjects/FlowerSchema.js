import Joi from "joi"
import schemas from "./schemas.js"

const flowerSchema = Joi.object({
    name: Joi.string().required().max(255), 
    color: Joi.string().max(255),
    id: schemas.idSchema
})

export {flowerSchema}