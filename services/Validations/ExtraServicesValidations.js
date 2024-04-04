import { addNewServiceSchema, editServiceSchema, newServiceArray } from "../../validationObjects/ExtraServicesValidations.js"

const validateNewService = service => {

    const { error } = addNewServiceSchema.validate(service)

    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

const validateEditService = service => {

    const { error } = editServiceSchema.validate(service)

    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

const validateNewSericeArray = services => {


    const { error } = newServiceArray.validate(services)

    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

export {validateNewService, validateEditService, validateNewSericeArray}