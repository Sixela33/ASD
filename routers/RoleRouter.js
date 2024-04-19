import express from 'express'
import RoleController from '../controllers/RoleController.js'

// all the roles routes
class RoleRouter {

    constructor(){
        this.controller = new RoleController()
        this.router = express.Router()
    }

    start(){
        
        this.router.post('/create', this.controller.createRole)
        this.router.get('/', this.controller.getAllPermissionLevels)
        this.router.patch('/changePermissions', this.controller.changeUserPermissions)
        // this.router.post('/give', this.controller.addRoleToUser)
        // this.router.delete('/', this.controller.removeRole)
        return this.router
    }
    
    
}




export default RoleRouter