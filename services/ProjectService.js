import ModelPostgres from "../model/DAO/ModelPostgres.js"

class ProjectService {

    constructor() {
        this.model = new ModelPostgres()
    }

    createProject = async (projectDescription, projectDate, projectContact, empoyeeBudget, arrangements, creatorid) => {
        await this.model.createProject(projectDescription, projectDate, projectContact, empoyeeBudget, arrangements, creatorid)
    }

}

export default ProjectService