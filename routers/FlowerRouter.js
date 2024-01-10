import express from 'express'
import PermissionsMiddelware from '../middleware/PermissionMiddleware.js'
import FlowerController from '../controllers/FlowerController.js'
import multer from "multer"

class FlowerRouter {

    constructor(){
        this.controller = new FlowerController()
        this.router = express.Router()
        const storage = multer.memoryStorage()
        this.uploads = multer({storage: storage})
    }

    start(){
  
        // CreateFlower
        this.router.post('/', this.uploads.single('flower'), this.controller.addFlower)
        //GetFlowers
        this.router.get('/:offset/:query?', this.controller.getFlowers)
        return this.router
    }
    
}


export default FlowerRouter