import ProjectService from "../services/ProjectService.js"

class ProjectController {

    constructor() {
        this.service = new ProjectService()
    }

    createProject = async (req, res, next) => {
        try {
            const { staffBudget, contact, date, description, client, profitMargin, arrangements, extras, isRecurrent, endDate} = req.body
            const creatorid = req.user.user.userid
            const response = await this.service.createProject(staffBudget, contact, date, endDate, description, client, profitMargin, arrangements, creatorid, extras, isRecurrent)
            req.logger.info(`[PROJECT CREATED] ${req.user.user.email} data: ${JSON.stringify(response)}`)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }
    
    closeProject = async (req, res, next) => {
        try {
            const {id} = req.params
            await this.service.closeProject(id)
            req.logger.info(`[PROJECT CLOSED] ${req.user.user.email} ID: ${id}`)

            res.send('Project closed successfully')
        } catch (error) {
            next(error)
        }
    }

    openProject = async (req, res, next) => {
        try {
            const {id} = req.params
            await this.service.openProject(id)
            req.logger.info(`[PROJECT OPENED] ${req.user.user.email} ID: ${id}`)
            res.send('Project opened successfully')

        } catch (error) {
            next(error)
        }
    }

    getProjects = async (req, res, next) => {
        try {
            const { offset} = req.params
            const { orderBy, order, showOpenOnly, searchByID, searchByContact, searchByDescription, rows, searchByClient } = req.query
            const result = await this.service.getProjects(offset, orderBy, order, showOpenOnly, searchByID, searchByContact, searchByDescription, rows, searchByClient)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }

    getProjectArrangements = async (req, res, next) => {
        try {
            const { id } = req.params
            const result = await this.service.getProjectArrangements(id)
            console.log("result", result)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }


    getManyProjectsByID = async (req, res, next) => {
        try {
            const {ids} = req.body
            let response = await this.service.getManyProjectsAndItsFlowers(ids)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

    addArrangementToProject = async (req, res, next) => {
        try {
            const { id } = req.params
            const arrangementData = req.body
            await this.service.addArrangementToProject(id, arrangementData)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    editProjectData = async (req, res, next) => {
        try {
            const { id } = req.params
            const projectData = req.body
            console.log(projectData)
            await this.service.editProjectData(id, projectData)
            req.logger.info(`[EDIT PROJECT DATA] ${req.user.user.email} ID: ${id}`)

            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    changeFlowerInProject = async (req, res, next) => {
        try {
            const { id } = req.params
            const {previousflowerid, newflowerid} = req.body
            await this.service.changeFlowerInProject(id, previousflowerid, newflowerid)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    deleteProject = async (req, res, next) => {
        try {
            const {id} = req.params
            await this.service.deleteProject(id)
            req.logger.info(`[DELETE PROJECT] ${req.user.user.email} ID: ${id}`)

            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    createFlowerPPT = async (req, res, next) => {
        try {
            const {projectID} = req.body
            const googleAccessToken = req.user.googleAccessToken
            const response = await this.service.createFlowerPPT(projectID, googleAccessToken)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }
}

export default ProjectController