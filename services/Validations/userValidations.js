import Joi from "joi"

const validateEmail = email => {
    const emailSchema = Joi.string().email().required()

    const { error } = emailSchema.validate(email)
    if (error) {
        throw {message: error.details[0].message, status: 403}
    } 

    return true
}

const validatePassword = pass => {
    const passSchema = Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()

    const { error } = passSchema.validate(pass)
    if (error) {
        throw {message: error.details[0].message, status: 403}
    } 

    return true
}

const validateUsername = username => {
    const usernameSchema = Joi.string().alphanum().min(3).max(30).required()

    const { error } = usernameSchema.validate(username)

    if (error) {
        throw {message: error.details[0].message, status: 403}
    } 

    return true
}



export {validateEmail, validatePassword, validateUsername}