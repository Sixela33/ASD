import Joi from "joi"


const validateId = id => {
    const idSchema = Joi.number().min(0).required()

    const { error } = idSchema.validate(id)

    if (error) {
        throw {message: error.details[0].message, status: 403}
    } 

    return true
}

export {validateId}