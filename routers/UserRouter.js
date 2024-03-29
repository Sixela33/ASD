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
        const adminPermission = new PermissionsMiddelware(ROLES_LIST['Admin']).call

        this.router.get('/all', staffPermission, this.controller.getUsersList) //
        this.router.post('/register', adminPermission, this.controller.registerUser) //
        this.router.post('/login', this.controller.loginUser) // 
        this.router.get('/refresh', this.controller.handleRefresh)
        this.router.get('/logout', this.controller.handleLogout)
        
        // the user that forgot hte password calls to this route and recieves an email with a link
        this.router.post('/forgotPassword', this.controller.forgotPassword)
        
        // user makes request with a code generated at "/forgotPassword" that allows him to change his password.
        this.router.post('/passwordRecovery', this.controller.passwordRecovery)
        
        return this.router
    }
}

export default UserRouter