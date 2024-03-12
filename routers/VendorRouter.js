import express from 'express'
import VendorController from '../controllers/VendorController.js'

class VendorRouter {

    constructor(){
        this.controller = new VendorController()
        this.router = express.Router()
    }

    start(){
        
        this.router.get('/', this.controller.getVendors)
        this.router.post('/', this.controller.addVendor)
        this.router.patch('/edit', this.controller.editVendor)
        this.router.patch('/activate', this.controller.editVendor)
        this.router.delete('/remove/:id', this.controller.removeVendor)
        return this.router
    }
    
}

export default VendorRouter