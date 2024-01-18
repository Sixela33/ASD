import ProjectService from "../services/ProjectService.js"

class ProjectController {

    constructor() {
        this.service = new ProjectService()
    }

    createProject = async (req, res, next) => {
        try {
            const { staffBudget, projectContact, projectDate, projectDescription, projectClient, profitMargin, arrangements} = req.body
            const creatorid = req.user.userid
            await this.service.createProject(staffBudget, projectContact, projectDate, projectDescription, projectClient, profitMargin, arrangements, creatorid)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }    

    getProjects = async (req, res, next) => {
        try {
            const { offset } = req.params

            const result = await this.service.getProjects(offset)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }

    getProjectArrangements = async (req, res, next) => {
        try {
            const { id } = req.params
            const result = await this.service.getProjectArrangements(id)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }


    getManyProjectsByID = async (req, res, next) => {
        try {
            console.log(req.body)
            const {ids} = req.body
            const result = await this.service.getManyProjectsByID(ids)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }
}

export default ProjectController