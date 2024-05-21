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
            await this.service.addIncompleteInvoice(invoiceData, file, creatorid)
            res.sendStatus(200)
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
            res.sendStatus(200)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }    
    getInvoices = async (req, res, next) => {
        try {
            const { offset } = req.params
            const { orderBy, order, searchQuery, searchBy, specificVendor, onlyMissing, rows } = req.query
            const response = await this.service.getInvoices(offset,  orderBy, order, searchQuery, searchBy, specificVendor, onlyMissing, rows)
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

    linkBaknTransaction = async (req, res, next) => {
        try {
            const { bankTransactionData, selectedInvoices } = req.body
            const response = await this.service.linkBaknTransaction(bankTransactionData, selectedInvoices)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

    processFile = async (req, res, next) => {
        try {
            const file = req.file
            const response = await this.service.extractInvoiceData(file)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }
}

export default InvoiceController