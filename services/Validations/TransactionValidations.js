import { transactionSchema } from "../../validationObjects/TransactionSchema.js"

const validateTransaction = trasnsaction => {
    const { error } = transactionSchema.validate(trasnsaction)
    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

export {validateTransaction}