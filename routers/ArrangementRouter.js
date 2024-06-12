import express from 'express'
import PermissionsMiddelware from '../middleware/PermissionMiddleware.js'
import ArrangementController from '../controllers/ArrangementController.js'
import ROLES_LIST from '../config/rolesList.js'

class ArrangementRouter {
    
    constructor(){
        this.controller = new ArrangementController()
        this.router = express.Router()
    }

    start(){
        const staffuserReq = new PermissionsMiddelware(ROLES_LIST['Staff']).call

        this.router.post('/creation', this.controller.populateArrangement)
        this.router.get('/types', this.controller.getArrangementTypes)
        this.router.get('/creation/:id', this.controller.getArrangementData)
        this.router.patch('/edit/:id', staffuserReq, this.controller.editArrangement)
        this.router.delete('/:id', staffuserReq, this.controller.deleteArrangement)
        return this.router
    }
    
}


export default ArrangementRouter