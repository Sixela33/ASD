import ModelPostgres from "../model/DAO/ModelPostgres.js"
import { validateArrangement, validateSingleArrangement } from "./Validations/ArrangementValidations.js"
import { validateId, validateIdArray, validateIdnotRequired, validateQueryStringLength } from "./Validations/IdValidation.js"
import validateProject from "./Validations/ProjectValidations.js"
import { validateNewSericeArray } from "./Validations/ExtraServicesValidations.js"

class ProjectService {

    constructor() {
        this.model = new ModelPostgres()
    }

    createProject = async (staffBudget, projectContact, projectDate, projectDescription, clientid, profitMargin, arrangements, creatorid, extras) => {
        extras = extras || []
        arrangements = arrangements || []
        
        await validateProject({staffBudget, projectContact, projectDate, projectDescription, clientid, profitMargin, creatorid})
        await validateArrangement(arrangements)
        await validateNewSericeArray(extras)
        const response = await this.model.createProject(staffBudget, projectContact, projectDate, projectDescription, clientid, profitMargin, creatorid, arrangements, extras)

        return response
    }

    closeProject = async (id) => {
        await validateId(id)
        await this.model.closeProject(id)
    }

    openProject = async (id) => {
        await validateId(id)
        await this.model.openProject(id)
    }

    getProjects = async (offset, orderBy, order, showOpenOnly, searchByID, searchByContact, searchByDescription, rows, searchByClient) => {
        await validateId(offset)
        await validateQueryStringLength([searchByID, searchByContact, searchByDescription, orderBy, searchByClient ])

        const response = await this.model.getProjects(offset, orderBy, order, showOpenOnly, searchByID, searchByContact, searchByDescription, rows, searchByClient)
        return response.rows
    }

    getProjectArrangements = async (id) => {
        await validateId(id)
        let arrangements = this.model.getProjectArrangements(id)
        let flowers = this.model.getProjectFlowers([id])
        let project = this.model.getProjectByID(id)
        let extras = this.model.getProjectExtras(id)

        arrangements = await arrangements
        flowers = await flowers
        project = await project
        extras = await extras
        
        return {
            project: project.rows, 
            arrangements: arrangements.rows,
            flowers: flowers.rows, 
            extras: extras.rows
        }
    }

    addArrangementToProject = async (id, arrangementData) => {
        await validateSingleArrangement(arrangementData)
        await validateId(id)

        await this.model.addArrangementToProject(id, arrangementData)
    }

    editProjectData = async (id, projectData) => {
        await validateId(id)
        await validateProject(projectData)

        await this.model.editProjectData(id, projectData)
    }

    getManyProjectsAndItsFlowers = async (ids) => {
        await validateIdArray(ids)

        let projects = this.model.getManyProjectsByID(ids)
        let flowers = this.model.getProjectFlowers(ids)

        projects = await projects
        projects = projects.rows
        
        flowers = await flowers
        flowers = flowers.rows
        
        return {projects, flowers}
    }

    changeFlowerInProject = async (projectid, previousflowerid, newflowerid) => {
        await validateIdArray([projectid, previousflowerid, newflowerid])
        await this.model.changeFlowerInProject(projectid, previousflowerid, newflowerid)
    }
}

export default ProjectService