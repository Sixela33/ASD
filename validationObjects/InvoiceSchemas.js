import Joi from "joi"
import schemas from "./schemas.js"

const invoiceSchema = Joi.object({
    invoiceAmount: Joi.number().min(0).required(),
    vendor: schemas.idSchema.required(),
    dueDate: Joi.date().required(),
    invoiceNumber: Joi.number().required(),
    invoiceid: Joi.number().min(0),
    fileLocation: Joi.string()
})

const invoiceFlowerSchema = Joi.object({
    flowerid: schemas.idSchema.required(),
    projectid: schemas.idSchema.required(),
    unitPrice: Joi.number().min(0).required(),
    filledStems: Joi.number().min(0).required(),
})

const invoiceArrayFlowerSchema = Joi.array().items(invoiceFlowerSchema)

const bankTransactionSchema = Joi.string().required()

export {invoiceSchema, invoiceFlowerSchema, invoiceArrayFlowerSchema, bankTransactionSchema}

