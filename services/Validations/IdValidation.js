import schemas from "../../validationObjects/schemas.js"

const validateId = id => {

    const { error } = schemas.idSchema.validate(id)

    if (error) {
        throw {message: error.details[0].message, status: 403}
    } 

    return true
}

const validateIdArray = ids => {
    const { error } = schemas.idArrays.validate(ids)

    if (error) {
        throw {message: error.details[0].message, status: 403}
    } 

    return true
}

export {validateId, validateIdArray}