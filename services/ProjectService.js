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

    getProjects = async (offset) => {
        await validateId(offset)
        const response = await this.model.getProjects(offset)
        return response.rows
    }

    getProjectArrangements = async (id) => {
        await validateId(id)
        const arrangements = await this.model.getProjectArrangements(id)
        const flowers = await this.model.getProjectFlowers([id])
        const project = await this.model.getProjectByID(id)
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