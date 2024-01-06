import ModelPostgres from "../model/DAO/ModelPostgres.js"

class ArrangementService {

    constructor() {
        this.model = new ModelPostgres()
    }

    createArrangement = async (projectID, arrangementType, arrangementDescription, arrangementBudget) => {
        await this.model.createArrangement(projectID, arrangementType, arrangementDescription, arrangementBudget)
    }
}

export default ArrangementService