import { vendorSchema } from "../../validationObjects/VendorSchemas.js";

const validateVendor = name => {

    const { error } = vendorSchema.validate(name)

    if (error) {
        throw {message: error.details[0].message, status: 403}
    } 

    return true
}

export {validateVendor}