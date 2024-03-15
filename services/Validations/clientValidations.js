import { clientSchema } from "../../validationObjects/ClientValidationSchema.js";

const validateClient = name => {

    const { error } = clientSchema.validate(name)

    if (error) {
        throw {message: error.details[0].message, status: 403}
    } 

    return true
}

export {validateClient}