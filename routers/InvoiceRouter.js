import express from 'express'
import PermissionsMiddelware from '../middleware/PermissionMiddleware.js'
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
        //GetFlowers
        this.router.get('/invoices/:offset/:query?', this.controller.getInvoices)
        this.router.get('/providedProjects/:id', this.controller.getProvidedProjects)
        return this.router
    }
    
}


export default InvoiceRouter