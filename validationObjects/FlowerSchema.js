import Joi from "joi";
import schemas from "./schemas.js";

const flowerSchema = Joi.object({
    name: Joi.string().required().max(255).messages({
        'string.empty': 'Name cannot be empty.',
        'string.max': 'Name cannot exceed 255 characters.',
        'any.required': 'Name is required.'
    }), 
    colors: Joi.array().items(schemas.idSchema).unique().required().messages({
        'array.base': 'Colors must be an array.',
        'array.unique': 'The same color was assigned twice.',
        'any.required': 'At least one color is required.'
    }),    
    id: schemas.idSchema,
    initialPrice: Joi.number().min(0).allow('').messages({
        'number.min': 'Initial price cannot be less than 0.'
    })
});

export { flowerSchema };
