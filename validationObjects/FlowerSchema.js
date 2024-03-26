import Joi from "joi";
import schemas from "./schemas.js";

const flowerSchema = Joi.object({
    name: Joi.string().required().max(255).messages({
        'string.empty': 'Name cannot be empty.',
        'string.max': 'Name cannot exceed 255 characters.',
        'any.required': 'Name is required.'
    }), 
    color: Joi.string().max(255).messages({
        'string.max': 'Color cannot exceed 255 characters.'
    }),
    id: schemas.idSchema
});

export { flowerSchema };
