import express from 'express'
import VendorController from '../controllers/VendorController.js'
import PermissionsMiddelware from '../middleware/PermissionMiddleware.js'
import ROLES_LIST from '../config/rolesList.js'

class VendorRouter {

    constructor(){
        this.controller = new VendorController()
        this.router = express.Router()
    }

    start(){
        const staffuserReq = new PermissionsMiddelware(ROLES_LIST['Staff']).call

        this.router.get('/', this.controller.getVendors)
        this.router.post('/', this.controller.addVendor)
        this.router.patch('/edit',staffuserReq, this.controller.editVendor)
        // this.router.patch('/activate', this.controller.editVendor)
        // this.router.delete('/remove/:id', this.controller.removeVendor)
        return this.router
    }
    
}

export default VendorRouter