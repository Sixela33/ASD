import ModelPostgres from "../model/DAO/ModelPostgres.js"
import { validateNewService, validateEditService } from "./Validations/ExtraServicesValidations.js"
import { validateId } from "./Validations/IdValidation.js"

class ExtraServicesService {

    constructor() {
        this.model = new ModelPostgres()
    }

    addNewServiceToProject = async (serviceData, projectID) => {
        await validateNewService(serviceData)
        await validateId(projectID)
        await this.model.addNewServiceToProject(serviceData, projectID)
    }

    editService = async (serviceData) => {
        await validateEditService(serviceData)
        await this.model.editService(serviceData)
    }

}

export default ExtraServicesService