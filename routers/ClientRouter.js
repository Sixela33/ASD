import express from 'express'
import PermissionsMiddelware from '../middleware/PermissionMiddleware.js'
import ClientController from '../controllers/ClientController.js'

class ClientRouter {

    constructor(){
        this.controller = new ClientController()
        this.router = express.Router()
    }

    start(){
  
        
        this.router.post('/', this.controller.createClient)
        this.router.get('/')
        return this.router
    }
    
}


export default ClientRouter