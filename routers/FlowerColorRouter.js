import express from 'express'
import PermissionsMiddelware from '../middleware/PermissionMiddleware.js'
import FlowerColorController from '../controllers/FlowerColorController.js'
import ROLES_LIST from '../config/rolesList.js'

class FlowerColorRouter {

    constructor(fileStorage){
        this.controller = new FlowerColorController(fileStorage)
        this.router = express.Router()
    }

    start(){

        this.router.get('/colors', this.controller.getFlowerColors)
        this.router.post('/colors', this.controller.createFlowerColor)
        this.router.patch('/colors', this.controller.editFlowerColor)
        return this.router
    }
    
}


export default FlowerColorRouter