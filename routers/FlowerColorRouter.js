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

        const staffuserReq = new PermissionsMiddelware(ROLES_LIST['Staff']).call


        this.router.get('/', this.controller.getFlowerColors)
        this.router.post('/', this.controller.createFlowerColor)
        this.router.patch('/',staffuserReq, this.controller.editFlowerColor)
        this.router.get('/colorid/:name', staffuserReq, this.controller.getColorID)
        this.router.delete('/', staffuserReq, this.controller.deleteColor)
        return this.router
    }
    
}


export default FlowerColorRouter