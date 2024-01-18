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
}

export default ArrangementService