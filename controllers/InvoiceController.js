import InvoiceService from "../services/InvoiceService.js"

class InvoiceController {

    constructor() {
        this.service = new InvoiceService()
    }

    addInvoice = async (req, res, next) => {
        try {
            const {invoiceData, InvoiceFlowerData} = req.body
            await this.service.addInvoice(invoiceData, InvoiceFlowerData)
            res.sendStatus(200)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }    
    getInvoices = async (req, res, next) => {
        try {
            const {offset, query} = req.params
            const response = await this.service.getInvoices(offset, query)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }
}

export default InvoiceController