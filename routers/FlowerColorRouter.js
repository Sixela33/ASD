import express from 'express'
import PermissionsMiddelware from '../middleware/PermissionMiddleware.js'
import FlowerColorController from '../controllers/FlowerColorController.js'
import ROLES_LIST from '../config/rolesList.js'

class FlowerColorRouter {

    constructor(){
        this.controller = new FlowerColorController()
        this.router = express.Router()
    }

    start(){

        this.router.get('/', this.controller.getFlowerColors)
        this.router.post('/', this.controller.createFlowerColor)
        this.router.patch('/', this.controller.editFlowerColor)
        this.router.get('/colorid/:name', this.controller.getColorID)
        return this.router
    }
    
}


export default FlowerColorRouter