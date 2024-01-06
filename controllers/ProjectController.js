import ProjectService from "../services/ProjectService.js"

class ProjectController {

    constructor() {
        this.service = new ProjectService()
    }

    createProject = async (req, res, next) => {
        try {
            const { projectDescription, projectDate, projectContact, empoyeeBudget, arrangements } = req.body
            const creatorid = req.user.userid
            await this.service.createProject(projectDescription, projectDate, projectContact, empoyeeBudget, arrangements, creatorid)
        } catch (error) {
            next(error)
        }
    } 
    
}

export default ProjectController