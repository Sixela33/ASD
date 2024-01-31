import express from 'express'
import VendorController from '../controllers/VendorController.js'

class VendorRouter {

    constructor(){
        this.controller = new VendorController()
        this.router = express.Router()
    }

    start(){
        
        this.router.post('/', this.controller.addVendor)
        this.router.get('/', this.controller.getVendors)
        return this.router
    }
    
    
}

export default VendorRouter