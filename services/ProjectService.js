import ModelPostgres from "../model/DAO/ModelPostgres.js"
import { validateArrangement } from "./Validations/ArrangementValidations.js"
import validateProject from "./Validations/ProjectValidations.js"

class ProjectService {

    constructor() {
        this.model = new ModelPostgres()
    }

    createProject = async (staffBudget, projectContact, projectDate, projectDescription, projectClient, profitMargin, arrangements, creatorid) => {
        await validateProject({staffBudget, projectContact, projectDate, projectDescription, projectClient, profitMargin, creatorid})
        await validateArrangement(arrangements)
        await this.model.createProject(staffBudget, projectContact, projectDate, projectDescription, projectClient, profitMargin, creatorid, arrangements)

    }

}

export default ProjectService