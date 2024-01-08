import ProjectService from "../services/ProjectService.js"

class ProjectController {

    constructor() {
        this.service = new ProjectService()
    }

    createProject = async (req, res, next) => {
        try {
            console.log(req.body)
            const { staffBudget, projectContact, projectDate, projectDescription, projectClient, profitMargin, arrangements} = req.body
            const creatorid = req.user.userid
            await this.service.createProject(staffBudget, projectContact, projectDate, projectDescription, projectClient, profitMargin, arrangements, creatorid)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }    
}

export default ProjectController