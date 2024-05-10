import express from 'express'
import PermissionsMiddelware from '../middleware/PermissionMiddleware.js'
import FlowerController from '../controllers/FlowerController.js'
import multer from "multer"
import ROLES_LIST from '../config/rolesList.js'
import FlowerColorRouter from './FlowerColorRouter.js'

class FlowerRouter {

    constructor(fileStorage){
        this.controller = new FlowerController(fileStorage)
        this.flowerColorRouter = new FlowerColorRouter
        this.router = express.Router()
        const storage = multer.memoryStorage()
        this.uploads = multer({storage: storage})
    }

    start(){
        const staffuserReq = new PermissionsMiddelware(ROLES_LIST['Staff']).call

        // CreateFlower
        this.router.post('/', this.uploads.single('flower'), this.controller.addFlower)
        this.router.patch('/edit', staffuserReq, this.uploads.single('flower'), this.controller.editFlower)

        //GetFlowers
        this.router.get('/many/:offset/:query?', this.controller.getFlowers)
        this.router.get('/single/:id',staffuserReq, this.controller.getFlowerData)
        
        this.router.get('/flowerColors', this.controller.getUniqueFlowerColors)
        this.router.use('/colors', new FlowerColorRouter().start())
        return this.router
    }
    
}


export default FlowerRouter