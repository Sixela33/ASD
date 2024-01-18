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
        this.router.get('/list/:offset', this.controller.getProjects)
        this.router.post('/manyByID', this.controller.getManyProjectsByID)
        this.router.get('/arrangements/:id', this.controller.getProjectArrangements)
        return this.router
    }
    
}


export default ProjectRouter