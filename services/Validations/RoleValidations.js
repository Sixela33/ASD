import { roleSchema } from "../../validationObjects/RoleSchema.js";

const validateNewRole = email => {

    const { error } = roleSchema.validate(email)
    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

export {validateNewRole}