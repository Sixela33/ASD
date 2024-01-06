import express from 'express'
import UserController from '../controllers/UserController.js'
import PermissionsMiddelware from '../middleware/PermissionMiddleware.js'
import RoleController from '../controllers/RoleController.js'

// all the roles routes
class RoleRouter {

    constructor(){
        this.controller = new RoleController()
        this.router = express.Router()
    }

    start(){
        /*
        POST   ‘/create’            #Creates new role
        POST   ‘/give’	#Gives role to user
        DELETE ‘/removePermission’	#Removes role from user
        DELETE ‘/’                  #Removes role form database
        */
        
        this.router.post('/create', this.controller.createRole)
        this.router.post('/give', this.controller.addRoleToUser)
        this.router.patch('/removePermission', this.controller.removeRoleUser)
        this.router.delete('/', this.controller.removeRole)
        return this.router
    }
    
    
}




export default RoleRouter