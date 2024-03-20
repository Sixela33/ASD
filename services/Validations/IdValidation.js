import schemas from "../../validationObjects/schemas.js"

const validateId = id => {

    const { error } = schemas.idSchema.required().validate(id)

    if (error) {
        throw {message: error.details[0].message, status: 403}
    } 

    return true
}

const validateIdArray = ids => {
    const { error } = schemas.idArrays.required().validate(ids)

    if (error) {
        throw {message: error.details[0].message, status: 403}
    } 

    return true
}

const validateQueryStringLength = string => {

    const { error } = schemas.maxLengthStringMany.validate(string)

    if (error) {
        throw {message: error.details[0].message, status: 403}
    } 

    return true
}

export {validateId, validateIdArray, validateQueryStringLength}