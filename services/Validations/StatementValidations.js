import { statementSchema } from "../../validationObjects/StatementSchema.js"

const validateStatement = statement => {
    const { error } = statementSchema.validate(statement)
    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

export {validateStatement}