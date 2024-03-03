import Joi from "joi"

const invoiceSchema = Joi.object({
    invoiceNumber: Joi.number().required().min(0),
    vendor: Joi.number().required().min(0),
    dueDate: Joi.date().required(),
    invoiceAmount: Joi.number().required().min(0),
    invoiceid: Joi.number().min(0).optional(),
    fileLocation: Joi.string().optional()
})

const validateInvoice = invoice => {
 
    const { error } = invoiceSchema.validate(invoice)
    if (error) {
        return {success: false, message: error.details[0]?.message}
    }

    return {success: true}
}

export {validateInvoice}