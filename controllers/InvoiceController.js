import InvoiceService from "../services/InvoiceService.js"

class InvoiceController {

    constructor() {
        this.service = new InvoiceService()
    }

    addInvoice = async (req, res, next) => {
        try {
            const a = req.body
            console.log(a)
            //await this.service.addInvoice(image, name, color)
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