import ModelPostgres from "../model/DAO/ModelPostgres.js"

class ProjectService {

    constructor() {
        this.model = new ModelPostgres()
    }

    createProject = async (staffBudget, projectContact, projectDate, projectDescription, projectClient, profitMargin, arrangements, creatorid) => {
        await this.model.createProject(staffBudget, projectContact, projectDate, projectDescription, projectClient, profitMargin, creatorid)
    }

}

export default ProjectService