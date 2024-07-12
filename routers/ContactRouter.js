import express from 'express'
import ContactController from '../controllers/ContactController.js'
import PermissionsMiddelware from '../middleware/PermissionMiddleware.js'
import ROLES_LIST from '../config/rolesList.js'

class ContactRouter {

    constructor(){
        this.controller = new ContactController()
        this.router = express.Router()
    }

    start(){

        const staffuserReq = new PermissionsMiddelware(ROLES_LIST['Staff']).call

        
        this.router.get('/', this.controller.getContacts)
        this.router.post('/', staffuserReq, this.controller.addContact)
        this.router.patch('/', staffuserReq, this.controller.editContact)
        this.router.delete('/', staffuserReq, this.controller.deleteContact)
        return this.router
    }
    
    
}

export default ContactRouter