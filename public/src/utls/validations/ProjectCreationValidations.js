import Joi from "joi"

const projectSchema = Joi.object({
    client: Joi.string().required().max(50),
    description: Joi.string().required().max(50),
    date: Joi.date().required(),
    contact: Joi.string().required().max(50),
    staffBudget: Joi.number().required(),
    profitMargin: Joi.number().required().min(0),
})

const arrangementSchema = Joi.object({
    arrangementType: Joi.string().required(),
    arrangementDescription: Joi.string().required(),
    flowerBudget: Joi.number().min(0).required(),
    arrangementQuantity: Joi.number().min(0).required()
})


const validateArrangement = arrangement => {
    const arrayArrangements = Joi.array().items(
        arrangementSchema
    )
    const { error } = arrayArrangements.validate(arrangement)
    if (error) {
        return {success: false, message: error.details[0]?.message}
    }

    return {success: true}
}

export {validateArrangement}