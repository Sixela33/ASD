import express from 'express'
import ClientController from '../controllers/ClientController.js'

class ClientRouter {

    constructor(){
        this.controller = new ClientController()
        this.router = express.Router()
    }

    start(){
        
        this.router.post('/', this.controller.addClient)
        this.router.get('/', this.controller.getClients)
        return this.router
    }
    
    
}

export default ClientRouter