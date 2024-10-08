import express from 'express'
import ProjectController from '../controllers/ProjectController.js'
import PermissionsMiddelware from '../middleware/PermissionMiddleware.js'
import ROLES_LIST from '../config/rolesList.js'

class ProjectRouter {

    constructor(){
        this.controller = new ProjectController()
        this.router = express.Router()
    }

    start(){
        const staffuserReq = new PermissionsMiddelware(ROLES_LIST['Staff']).call

        this.router.post('/create', staffuserReq, this.controller.createProject)
        this.router.delete('/remove/:id', staffuserReq, this.controller.deleteProject)
        this.router.patch('/:id', staffuserReq, this.controller.editProjectData)

        // Wrongly posts, should be gets
        this.router.post('/manyByID', this.controller.getManyProjectsByID)
        
        // get many projects for display
        this.router.get('/list/:offset', this.controller.getProjects)
        
        // get projectArrangements
        this.router.get('/arrangements/:id', this.controller.getProjectArrangements)

        // open/close projects
        this.router.post('/close/:id', staffuserReq, this.controller.closeProject)
        this.router.post('/open/:id', staffuserReq,this.controller.openProject)

        this.router.post('/addArrangement/:id', staffuserReq, this.controller.addArrangementToProject)
        this.router.post('/editflower/:id', this.controller.changeFlowerInProject)
            
        this.router.post('/createFlowerPPT', staffuserReq, this.controller.createFlowerPPT)

        this.router.post('/duplicateProject', staffuserReq, this.controller.duplicateProject)
        return this.router
        
    }
}


export default ProjectRouter