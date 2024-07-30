import {createTransactionSchema, editTransactionSchema} from '../../validationObjects/TransactionSchema.js'

const validateNewTransaction = trasnsaction => {
    const { error } = createTransactionSchema.validate(trasnsaction)
    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

const validateTransactionEdit = trasnsaction => {
    const { error } = editTransactionSchema.validate(trasnsaction)
    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}

export {validateNewTransaction, validateTransactionEdit}