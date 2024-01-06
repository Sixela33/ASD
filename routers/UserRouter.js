import express from 'express'
import UserController from '../controllers/UserController.js'
import PermissionsMiddelware from '../middleware/PermissionMiddleware.js'

// all the user routes
class UserRouter {

    constructor(){
        this.controller = new UserController()
        this.router = express.Router()
    }

    start(){
        // gets user by email
        const adminPermission = new PermissionsMiddelware(['Admin']).call
        const superUserPermission = new PermissionsMiddelware(['SuperUser']).call

        this.router.get('/search/:userid?', adminPermission, this.controller.getUsers)
        this.router.get('/all', adminPermission, this.controller.getUsersList)

        this.router.post('/register', superUserPermission, this.controller.registerUser)
        this.router.post('/login', this.controller.loginUser)
        this.router.get('/refresh', this.controller.handleRefresh)
        this.router.get('/logout', this.controller.handleLogout)
        
        // the user that forgot hte password calls to this route and recieves an email with a link
        this.router.post('/forgotPassword', this.controller.forgotPassword)
        
        // user makes request with a code generated at "/forgotPassword" that allows him to change his password.
        this.router.post('/passwordRecovery/:id/:code', this.controller.passwordRecovery)
        
        return this.router
    }
}

export default UserRouter