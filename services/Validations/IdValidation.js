import schemas from "../../validationObjects/schemas.js"

const validateId = id => {

    const { error } = schemas.idSchema.required().validate(id)

    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

const validateIdnotRequired = id => {

    const { error } = schemas.idSchema.validate(id)

    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

const validateIdArray = ids => {
    const { error } = schemas.idArrays.required().validate(ids)

    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

const validateQueryStringLength = strings => {

    const { error } = schemas.maxLengthStringMany.validate(strings)

    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

const validateQueryString = string => {
    const { error } = schemas.maxLengthString.validate(string)

    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

const validateRequiredQueryString = string => {
    const { error } = schemas.maxLengthString.required().validate(string)

    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

const startDateEndDateValidation = dates => {
    const { error } = schemas.startDateEndDateSchema.validate(dates)

    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

const minMaxNumbersValidation = numbers => {
    const { error } = schemas.minMaxNumbers.validate(numbers)

    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

const validateBoolean = boolean => {
    const { error } = schemas.validateBoolean.validate(boolean)

    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

export {
    validateId, 
    validateIdArray, 
    validateQueryStringLength, 
    validateIdnotRequired, 
    validateQueryString, 
    validateRequiredQueryString, 
    startDateEndDateValidation,
    minMaxNumbersValidation,
    validateBoolean
}