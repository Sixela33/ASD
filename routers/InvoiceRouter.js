import express from 'express'
import PermissionsMiddelware from '../middleware/PermissionMiddleware.js'
import InvoiceController from '../controllers/InvoiceController.js'

class InvoiceRouter {

    constructor(){
        this.controller = new InvoiceController()
        this.router = express.Router()
    }

    start(){
  
        // CreateFlower
        this.router.post('/', this.controller.addInvoice)
        //GetFlowers
        this.router.get('/:offset/:query?', this.controller.getInvoices)
        return this.router
    }
    
}


export default InvoiceRouter