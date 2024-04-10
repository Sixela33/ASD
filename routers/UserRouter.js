import express from 'express'
import UserController from '../controllers/UserController.js'
import PermissionsMiddelware from '../middleware/PermissionMiddleware.js'
import ROLES_LIST from '../config/rolesList.js'

// all the user routes
class UserRouter {

    constructor(){
        this.controller = new UserController()
        this.router = express.Router()
    }

    start(){
        // gets user by email
        const staffPermission = new PermissionsMiddelware(ROLES_LIST['Staff']).call

        this.router.get('/all', staffPermission, this.controller.getUsersList) //
        this.router.get('/oauthlogin', this.controller.oauthLoginUser) // 
        this.router.get('/refresh', this.controller.handleRefresh)
        this.router.get('/logout', this.controller.handleLogout)
        
        return this.router
    }
}

export default UserRouter