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
        this.router.post('/close/:id', this.controller.closeProject)
        this.router.post('/open/:id', this.controller.openProject)
        this.router.post('/manyByID', this.controller.getManyProjectsByID)
        this.router.post('/flowers', this.controller.getFlowersFromManyProjects)
        this.router.get('/list/:offset', this.controller.getProjects)
        this.router.get('/arrangements/:id', this.controller.getProjectArrangements)
        return this.router
    }
    
}


export default ProjectRouter