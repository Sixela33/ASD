import ModelPostgres from "../model/DAO/ModelPostgres.js"
import { validateSingleArrangement, validateFlowersToPopulateArrangement } from "./Validations/ArrangementValidations.js"
import { validateId } from "./Validations/IdValidation.js"

class ArrangementService {

    constructor() {
        this.model = new ModelPostgres()
    }

    populateArrangement = async(arrangementid, flowers) => {
        await validateId(arrangementid)
        await validateFlowersToPopulateArrangement(flowers)
        await this.model.populateArrangement(arrangementid, flowers)
    }

    getArrangementTypes = async () => {
        const response = await this.model.getArrangementTypes()
        return response.rows
    }

    getArrangementData = async (id) => {
        let arrangementData = this.model.getArrangementDataByID(id)
        let arrangementFLowerData = this.model.getFlowersByArrangementID(id)

        arrangementData = await arrangementData
        arrangementFLowerData = await arrangementFLowerData
        console.log({arrangementData: arrangementData.rows, arrangementFlowers: arrangementFLowerData.rows})
        return {arrangementData: arrangementData.rows, arrangementFlowers: arrangementFLowerData.rows}
    }

    editArrangement = async (id, arrangementData) => {
        await validateSingleArrangement(arrangementData)
        await validateId(id)

        await this.model.editArrangement(id, arrangementData)
    }

    deleteArrangement = async (id) => {
        await validateId(id)

        await this.model.deleteArrangement(id)
    }
}

export default ArrangementService