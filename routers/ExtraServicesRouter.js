import ExtraServicesController from "../controllers/ExtraServicesController.js"
import express from 'express'

class ExtraServicesRouter {
    
    constructor(){
        this.controller = new ExtraServicesController()
        this.router = express.Router()
    }

    start() {

        this.router.post('/', this.controller.addNewServiceToProject)
        this.router.patch('/', this.controller.editService)
        return this.router
    }
}


export default ExtraServicesRouter