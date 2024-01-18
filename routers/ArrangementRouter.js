import express from 'express'
import PermissionsMiddelware from '../middleware/PermissionMiddleware.js'
import ArrangementController from '../controllers/ArrangementController.js'
class ArrangementRouter {
    
    constructor(){
        this.controller = new ArrangementController()
        this.router = express.Router()
    }

    start(){
  
        this.router.post('/', this.controller.populateArrangement)

        return this.router
    }
    
}


export default ArrangementRouter