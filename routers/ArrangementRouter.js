import express from 'express'
import PermissionsMiddelware from '../middleware/PermissionMiddleware.js'
import ArrangementController from '../controllers/ArrangementController.js'
class ArrangementRouter {
    
    constructor(){
        this.controller = new ArrangementController()
        this.router = express.Router()
    }

    start(){
  
        this.router.post('/creation', this.controller.populateArrangement)
        this.router.get('/types', this.controller.getArrangementTypes)
        this.router.get('/creation/:id', this.controller.getArrangementData)
        this.router.patch('/edit/:id', this.controller.editArrangement)

        return this.router
    }
    
}


export default ArrangementRouter