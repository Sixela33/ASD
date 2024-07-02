import ModelPostgres from "../model/DAO/ModelPostgres.js"
import { validateArrangement, validateSingleArrangement } from "./Validations/ArrangementValidations.js"
import { validateId, validateIdArray, validateIdnotRequired, validateQueryStringLength } from "./Validations/IdValidation.js"
import validateProject from "./Validations/ProjectValidations.js"
import { validateNewSericeArray } from "./Validations/ExtraServicesValidations.js"
import createPresentation from "./GoogleSuite/CreatePPTpresentation.js"
import FileHandlerSelector from "../FileHandlers/FileHandlerSelector.js"

class ProjectService {

    constructor() {
        this.model = new ModelPostgres()
        this.fileHandler = new FileHandlerSelector('s3').start()

    }

    validateProjectStatus = async(id) => {
        const isClosed = await this.model.getIsProjectClosed(id)

        if (isclosed.length == 0) {
            throw {message: "Project not found" , status: 404}
        }

        if (isClosed[0].isclosed) {
            throw {message: "You can't edit a closed project" , status: 400}
        }
    }

    createProject = async (staffBudget, projectContact, projectDate, projectEndDate, projectDescription, clientid, profitMargin, arrangements, creatorid, extras, isRecurrent) => {
        extras = extras || []
        arrangements = arrangements || []
        
        await validateProject({staffBudget, projectContact, projectDate, projectEndDate, projectDescription, clientid, profitMargin, creatorid, isRecurrent})
        await validateArrangement(arrangements)
        await validateNewSericeArray(extras)
        const response = await this.model.createProject(staffBudget, projectContact, projectDate, projectEndDate, projectDescription, clientid, profitMargin, creatorid, arrangements, extras, isRecurrent)

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
        console.log(searchByID)
        if(Number(searchByID)){
            await validateId(Number(searchByID))
        }

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

        await this.validateProjectStatus(id)

        await this.model.addArrangementToProject(id, arrangementData)
    }

    editProjectData = async (id, projectData) => {
        await validateId(id)
        await validateProject(projectData)

        await this.validateProjectStatus(id)

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

        await this.validateProjectStatus(projectid)


        await this.model.changeFlowerInProject(projectid, previousflowerid, newflowerid)
    }

    deleteProject = async (id) => {
        await this.model.deleteProject(id)
    }

    createFlowerPPT = async (projectid, googleAccessToken) => {
        await validateId(projectid)
        let flowers = await this.model.getProjectFlowersForPpt(projectid)
        flowers = flowers.rows

        const flowersByColor = {}

        for (let flower of flowers) {
            if(!flower.flowerimage || !flower.flowercolors || !flower.flowername) continue
            flower.flowercolor = flower.flowercolors[0]
            flower.flowerimage = await this.fileHandler.processFileLocation(flower.flowerimage, 100)
            if(!flowersByColor[flower.flowercolor]) {
                flowersByColor[flower.flowercolor] = [flower]
            } else {
                flowersByColor[flower.flowercolor].push(flower)
            }     
        }

        if (Object.keys(flowersByColor).length == 1 && Object.keys(flowersByColor)[0] == 'null') {
            throw {message: 'This project has no flowers assigned', status: 400}
        }

        const presentationid = await createPresentation(googleAccessToken, flowersByColor)
        return presentationid
    }
}

export default ProjectService