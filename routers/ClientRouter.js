import express from 'express'
import ClientController from '../controllers/ClientController.js'
import PermissionsMiddelware from '../middleware/PermissionMiddleware.js'
import ROLES_LIST from '../config/rolesList.js'

class ClientRouter {

    constructor(){
        this.controller = new ClientController()
        this.router = express.Router()
    }

    start(){

        const staffuserReq = new PermissionsMiddelware(ROLES_LIST['Staff']).call

        
        this.router.get('/', this.controller.getClients)
        this.router.post('/', staffuserReq, this.controller.addClient)
        this.router.patch('/', staffuserReq, this.controller.editClient)
        this.router.delete('/', staffuserReq, this.controller.deleteClient)
        return this.router
    }
    
    
}

export default ClientRouter