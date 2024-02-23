import Joi from "joi"
import schemas from "../../validationObjects/schemas.js"

const validateArrangement = arrangement => {
    const arrayArrangements = Joi.array().items(
        schemas.arrangementSchema
    )
    const { error } = arrayArrangements.validate(arrangement)
    if (error) {
        throw {message: error.details[0]?.message, status: 403}
    }

    return true
}

const validateSingleArrangement = arrangement => {
    
    
    const { error } = schemas.arrangementSchema.validate(arrangement)
    if (error) {
        throw {message: error.details[0]?.message, status: 403}
    }

    return true
}

export {validateArrangement, validateSingleArrangement}