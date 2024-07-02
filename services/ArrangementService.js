import ModelPostgres from "../model/DAO/ModelPostgres.js"
import { validateSingleArrangement, validateFlowersToPopulateArrangement } from "./Validations/ArrangementValidations.js"
import { validateId } from "./Validations/IdValidation.js"
import ProjectService from "./ProjectService.js"

class ArrangementService {

    constructor() {
        this.model = new ModelPostgres()
        this.projectService = new ProjectService()
    }

    validateProjectStatus = async(arrangementid) => {
        const isClosed = await this.model.isArrangementsProjectClosed(arrangementid)

        if(isClosed || isClosed.lenght == 0) {
            throw {message: "Project not found" , status: 404}
        }

        if (isClosed[0].isclosed) {
            throw {message: "You can't edit a closed project" , status: 400}
        }
    }

    populateArrangement = async(arrangementid, flowers) => {
        await validateId(arrangementid)
        await validateFlowersToPopulateArrangement(flowers)

        await this.validateProjectStatus(arrangementid)

        await this.model.populateArrangement(arrangementid, flowers)
    }

    getArrangementTypes = async () => {
        const response = await this.model.getArrangementTypes()
        return response.rows
    }

    createArrangementType = async (name) => {
        await this.model.loadArrangementType(name)
    }

    getArrangementData = async (id) => {
        let arrangementData = this.model.getArrangementDataByID(id)
        let arrangementFLowerData = this.model.getFlowersByArrangementID(id)

        arrangementData = await arrangementData
        arrangementFLowerData = await arrangementFLowerData
        return {arrangementData: arrangementData.rows, arrangementFlowers: arrangementFLowerData.rows}
    }

    editArrangement = async (id, arrangementData) => {
        await validateSingleArrangement(arrangementData)
        await validateId(id)

        await this.validateProjectStatus(id)

        await this.model.editArrangement(id, arrangementData)
    }

    deleteArrangement = async (id) => {
        await validateId(id)

        await this.validateProjectStatus(id)
        
        await this.model.deleteArrangement(id)
    }
}

export default ArrangementService