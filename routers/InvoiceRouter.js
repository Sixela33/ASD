import express from 'express'
import InvoiceController from '../controllers/InvoiceController.js'
import multer from "multer"

class InvoiceRouter {

    constructor(){
        this.controller = new InvoiceController()
        this.router = express.Router()
        const storage = multer.memoryStorage()
        this.uploads = multer({storage: storage})
    }

    start(){
  
        // CreateFlower
        this.router.post('/', this.uploads.single('invoiceFile'), this.controller.addInvoice)
        this.router.post('/incomplete', this.uploads.single('invoiceFile'), this.controller.addIncompleteInvoice)
        this.router.patch('/', this.uploads.single('invoiceFile'), this.controller.editInvoice)
        //GetFlowers
        this.router.get('/invoices/:offset', this.controller.getInvoices)
        this.router.get('/providedProjects/:id', this.controller.getProvidedProjects)
        this.router.get('/invoiceData/:id', this.controller.getInvoiceData)
        this.router.post('/linkBankTransaction', this.controller.linkBaknTransaction)
        return this.router
    }
    
}


export default InvoiceRouter