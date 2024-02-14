import Joi from "joi"

const arrangementSchema = Joi.object({
    arrangementType: Joi.object({
        arrangementtypeid: Joi.number(),
        typename: Joi.string()
    }).required().messages({'object.required': `arrangement Type is a required field`}),
    arrangementDescription: Joi.string().required(),
    clientCost: Joi.number().min(0).required(),
    arrangementQuantity: Joi.number().min(0).required()
})

const validateArrangement = arrangement => {
    const arrayArrangements = arrangementSchema

    const { error } = arrayArrangements.validate(arrangement, {errors: {wrap: {label: false}}})
    if (error) {
        return {success: false, message: error.details[0]?.message}
    }

    return {success: true}
}

export {validateArrangement, arrangementSchema}