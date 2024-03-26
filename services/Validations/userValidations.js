import { emailSchema, passSchema, usernameSchema, fullUserSchema } from "../../validationObjects/UserShemas.js"

const validateEmail = email => {

    const { error } = emailSchema.validate(email)
    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

const validatePassword = pass => {

    const { error } = passSchema.validate(pass)
    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

const validateUsername = username => {

    const { error } = usernameSchema.validate(username)

    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

const validateFullUser = user => {
    
    const { error } = fullUserSchema.validate(user)

    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}


export {validateEmail, validatePassword, validateUsername, validateFullUser}