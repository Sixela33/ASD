import express from 'express'
import PermissionsMiddelware from '../middleware/PermissionMiddleware.js'
import ProjectController from '../controllers/ProjectController.js'

class ProjectRouter {

    constructor(){
        this.controller = new ProjectController()
        this.router = express.Router()
    }

    start(){
  
        
        this.router.post('/create', this.controller.createProject)
        this.router.get('/')
        return this.router
    }
    
}


export default ProjectRouter