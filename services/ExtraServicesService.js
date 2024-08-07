import ModelPostgres from "../model/DAO/ModelPostgres.js"
import { validateNewService, validateEditService } from "./Validations/ExtraServicesValidations.js"
import { validateId } from "./Validations/IdValidation.js"

class ExtraServicesService {

    constructor() {
        this.model = new ModelPostgres()
    }

    validateProjectStatus = async (extraid) => {
        const isClosed = await this.model.isExtraProjectClosed(extraid)

        if(!isClosed || isClosed.length == 0) {
            throw {message: "Project not found" , status: 404}
        }

        if (isClosed[0].isclosed) {
            throw {message: "You can't edit a closed project" , status: 400}
        }
    }

    addNewServiceToProject = async (serviceData, projectID) => {
        await validateNewService(serviceData)
        await validateId(projectID)

        const isClosed = await this.model.getIsProjectClosed(projectID)
        if (isClosed[0].isclosed) {
            throw {message: "You can't edit a closed project" , status: 400}
        }
        
        await this.model.addNewServiceToProject(serviceData, projectID)
    }

    editService = async (serviceData) => {
        await validateEditService(serviceData)

        await this.validateProjectStatus(serviceData.aditionalid)

        await this.model.editService(serviceData)
    }

}

export default ExtraServicesService