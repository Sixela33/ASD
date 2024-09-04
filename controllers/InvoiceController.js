import InvoiceService from "../services/InvoiceService.js"

class InvoiceController {

    constructor(fileStorage) {
        this.service = new InvoiceService(fileStorage)
    }

    addInvoice = async (req, res, next) => {
        try {
            const file = req.file
            const {invoiceData, InvoiceFlowerData} = req.body
            const creatorid = req.user.user.userid
            const response = await this.service.addInvoice(invoiceData, InvoiceFlowerData, file, creatorid)
            req.logger.info(`[NEW INVOICE] ${req.user.user.email} ID: ${JSON.stringify(invoiceData)}`)
            res.json(response)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }   
    
    addIncompleteInvoice= async (req, res, next) => {
        try {
            const file = req.file
            const {invoiceData} = req.body
            const creatorid = req.user.user.userid
            const response = await this.service.addIncompleteInvoice(invoiceData, file, creatorid)
            if (invoiceData.fileLocation) delete invoiceData.fileLocation 
            req.logger.info(`[NEW INCOMPLETE INVOICE] ${req.user.user.email} ID: ${JSON.stringify(invoiceData)}`)
            res.json({id: response})
        } catch (error) {
            console.log(error)
            next(error)
        }
    }   

    editInvoice = async (req, res, next) => {
        try {
            const file = req.file
            const {invoiceData, InvoiceFlowerData} = req.body
            const editorID = req.user.user.userid
            await this.service.editInvoice(invoiceData, InvoiceFlowerData, file, editorID)
            req.logger.info(`[INVOICE EDIT] ${req.user.user.email} ID: ${JSON.stringify(invoiceData)}`)

            res.sendStatus(200)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }    

    deleteInvoice = async (req, res, next) => {
        try {
            const {id} = req.params
            await this.service.deleteInvoice(id)
            req.logger.info(`[INVOICE DELETE] ${req.user.user.email} ID: ${id}`)

            res.sendStatus(200)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }    

    getInvoices = async (req, res, next) => {
        try {
            const { offset } = req.params
            const { orderBy, order, invoiceNumber, invoiceID, specificVendor, onlyMissing, rows, startDate, endDate, minAmount, maxAmount, withoutTransaction } = req.query
            const response = await this.service.getInvoices(offset,  orderBy, order, invoiceNumber, invoiceID, specificVendor, onlyMissing, rows, startDate, endDate, minAmount, maxAmount, withoutTransaction)
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

    getInvoiceData = async (req, res, next) => {
        try {
            const { id } = req.params
            const response = await this.service.getInvoiceData(id)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

    linkFlowersToInvoice = async (req, res, next) => {
        try {
            const {flowers, invoiceID} = req.body
            console.log(req.body)
            const response = await this.service.linkFlowersToInvoice(flowers, invoiceID)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    getInvoiceFlowers = async (req, res, next) => {
        try {
            const {id} = req.params
            const response = await this.service.getInvoiceFlowers(id)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

}

export default InvoiceController