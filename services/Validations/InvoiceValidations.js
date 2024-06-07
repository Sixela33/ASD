import { invoiceSchema, invoiceArrayFlowerSchema, bankTransactionSchema } from "../../validationObjects/InvoiceSchemas.js"

const validateInvoice = invoiceData => {

    const { error } = invoiceSchema.validate(invoiceData)

    if (error) {
        throw {message: error.details[0].message, status: 400}
    }

    return true
}

const validateFlowers = invoiceFlowers => {

    const { error } = invoiceArrayFlowerSchema.validate(invoiceFlowers)

    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}


const validateBankTransaction = baknTransaction => {

    const { error } = bankTransactionSchema.validate(baknTransaction)

    if (error) {
        throw {message: error.details[0].message, status: 400}
    } 

    return true
}
export {validateInvoice, validateFlowers, validateBankTransaction}