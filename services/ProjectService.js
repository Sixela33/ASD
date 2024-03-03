import ModelPostgres from "../model/DAO/ModelPostgres.js"
import { validateArrangement } from "./Validations/ArrangementValidations.js"
import { validateId } from "./Validations/IdValidation.js"
import validateProject from "./Validations/ProjectValidations.js"

class ProjectService {

    constructor() {
        this.model = new ModelPostgres()
    }

    createProject = async (staffBudget, projectContact, projectDate, projectDescription, clientid, profitMargin, arrangements, creatorid) => {
        await validateProject({staffBudget, projectContact, projectDate, projectDescription, clientid, profitMargin, creatorid})
        await validateArrangement(arrangements)
        await this.model.createProject(staffBudget, projectContact, projectDate, projectDescription, clientid, profitMargin, creatorid, arrangements)

    }

    closeProject = async (id) => {
        await validateId(id)
        await this.model.closeProject(id)
    }

    openProject = async (id) => {
        await validateId(id)
        await this.model.openProject(id)
    }

    getProjects = async (offset, orderBy, order, showOpenOnly) => {
        await validateId(offset)
        const response = await this.model.getProjects(offset, orderBy, order, showOpenOnly)
        return response.rows
    }

    getProjectArrangements = async (id) => {
        await validateId(id)
        let arrangements = this.model.getProjectArrangements(id)
        let flowers = this.model.getProjectFlowers([id])
        let project = this.model.getProjectByID(id)

        arrangements = await arrangements
        flowers = await flowers
        project = await project
        return {project: project.rows, arrangements: arrangements.rows,flowers: flowers.rows }
    }
    

    getManyProjectsByID = async (ids) => {
        const response = await this.model.getManyProjectsByID(ids)
        return response.rows
    }

    getFlowersFromManyProjects = async (ids) => {
        const response = await this.model.getProjectFlowers(ids)
        return response.rows
    }
}

export default ProjectService