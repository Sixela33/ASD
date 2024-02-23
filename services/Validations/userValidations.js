import schemas from "../../validationObjects/schemas.js"

const validateEmail = email => {

    const { error } = schemas.emailSchema.validate(email)
    if (error) {
        throw {message: error.details[0].message, status: 403}
    } 

    return true
}

const validatePassword = pass => {

    const { error } = schemas.passSchema.validate(pass)
    if (error) {
        throw {message: error.details[0].message, status: 403}
    } 

    return true
}

const validateUsername = username => {

    const { error } = schemas.usernameSchema.validate(username)

    if (error) {
        throw {message: error.details[0].message, status: 403}
    } 

    return true
}

const validateFullUser = user => {
    
    const { error } = schemas.fullUserSchema.validate(user)

    if (error) {
        throw {message: error.details[0].message, status: 403}
    } 

    return true
}


export {validateEmail, validatePassword, validateUsername, validateFullUser}