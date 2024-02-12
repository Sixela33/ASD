import ModelPostgres from "../model/DAO/ModelPostgres.js"

class ArrangementService {

    constructor() {
        this.model = new ModelPostgres()
    }

    createArrangement = async (projectID, arrangementType, arrangementDescription, arrangementBudget) => {
        await this.model.createArrangement(projectID, arrangementType, arrangementDescription, arrangementBudget)
    }

    populateArrangement = async(arrangementid, flowers) => {
        await this.model.populateArrangement(arrangementid, flowers)
    }

    getArrangementTypes = async () => {
        const response = await this.model.getArrangementTypes()
        return response.rows
    }

    getArrangementData = async (id) => {
        const arrangementData = await this.model.getArrangementDataByID(id)
        const arrangementFLowerData = await this.model.getFlowersByArrangementID(id)

        return {arrangementData: arrangementData.rows, arrangementFlowers: arrangementFLowerData.rows}
    }
}

export default ArrangementService