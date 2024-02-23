import ProjectService from "../services/ProjectService.js"

class ProjectController {

    constructor() {
        this.service = new ProjectService()
    }

    

    createProject = async (req, res, next) => {
        try {
            const { staffBudget, contact, date, description, client, profitMargin, arrangements} = req.body
            const creatorid = req.user.userid
            await this.service.createProject(staffBudget, contact, date, description, client, profitMargin, arrangements, creatorid)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }  
    
    closeProject = async (req, res, next) => {
        try {
            const {id} = req.params
            await this.service.closeProject(id)
            res.send('Project closed successfully')
        } catch (error) {
            next(error)
        }
    }

    openProject = async (req, res, next) => {
        try {
            const {id} = req.params
            await this.service.openProject(id)
            res.send('Project opened successfully')

        } catch (error) {
            next(error)
        }
    }

    getProjects = async (req, res, next) => {
        try {
            const { offset} = req.params
            const { orderBy, order, showOpenOnly } = req.query
            const result = await this.service.getProjects(offset, orderBy, order, showOpenOnly)
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
            const {ids} = req.body
            const result = await this.service.getManyProjectsByID(ids)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }

    getFlowersFromManyProjects = async (req, res, next) => {
        try {
            const { ids } = req.body
            const result = await this.service.getFlowersFromManyProjects(ids)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }
}

export default ProjectController