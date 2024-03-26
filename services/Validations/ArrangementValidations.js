import Joi from "joi"
import { arrangementSchema, flowerToPopulateArrangementSchema } from "../../validationObjects/ArrangementSchemas.js"

const validateArrangement = arrangement => {
    const arrayArrangements = Joi.array().items(
        arrangementSchema
    )
    const { error } = arrayArrangements.validate(arrangement)
    if (error) {
        throw {message: error.details[0]?.message, status: 400}
    }

    return true
}

const validateSingleArrangement = arrangement => {
    
    
    const { error } = arrangementSchema.validate(arrangement)
    if (error) {
        throw {message: error.details[0]?.message, status: 400}
    }

    return true
}

const validateFlowersToPopulateArrangement = flowers => {
    const arrayFlowers = Joi.array().items(flowerToPopulateArrangementSchema)

    const { error } = arrayFlowers.validate(flowers)
    if (error) {
        throw {message: error.details[0]?.message, status: 400}
    }

    return true
}

export {validateArrangement, validateSingleArrangement, validateFlowersToPopulateArrangement}