import Joi from "joi"

const arrangementSchema = Joi.object({
    arrangementType: Joi.number().min(0),
    arrangementDescription: Joi.string(),
    clientCost: Joi.number().min(0),
    flowerBudget: Joi.number().min(0),
    arrangementQuantity: Joi.number().min(0)
})

const validateArrangement = arrangement => {
    const arrayArrangements = Joi.array().items(
        arrangementSchema
    )
    const { error } = arrayArrangements.validate(arrangement)
    if (error) {
        throw {message: error.details[0]?.message, status: 403}
    }

    return true
}

export {validateArrangement, arrangementSchema}