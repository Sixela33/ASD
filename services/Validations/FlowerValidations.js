import { flowerSchema } from "../../validationObjects/FlowerSchema.js"

const validateFlower = id => {

    const { error } = flowerSchema.validate(id)

    if (error) {
        throw {message: error.details[0].message, status: 403}
    } 

    return true
}

export {validateFlower}