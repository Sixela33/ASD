import InvoiceService from "../services/InvoiceService.js"

class InvoiceController {

    constructor() {
        this.service = new InvoiceService()
    }

    addInvoice = async (req, res, next) => {
        try {
            const file = req.file
            const {invoiceData, InvoiceFlowerData} = req.body
            const creatorid = req.user.userid
            await this.service.addInvoice(invoiceData, InvoiceFlowerData, file, creatorid)
            res.sendStatus(200)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }    
    getInvoices = async (req, res, next) => {
        try {
            const {offset} = req.params
            const { orderBy, order, searchQuery, searchBy } = req.query

            const response = await this.service.getInvoices(offset,  orderBy, order, searchQuery, searchBy)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

    getProvidedProjects = async (req, res, next) => {
        try {
            const { id } = req.params
            const response = await this.service.getProvidedProjects(id)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

    linkBaknTransaction = async (req, res, next) => {
        try {
            const { bankTransactionData, selectedInvoices } = req.body
            console.log("bodei", req.body)
            const response = await this.service.linkBaknTransaction(bankTransactionData, selectedInvoices)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }
}

export default InvoiceController