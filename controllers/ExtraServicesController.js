import ExtraServicesService from "../services/ExtraServicesService.js"

class ExtraServicesController {

    constructor() {
        this.service = new ExtraServicesService()
    }


    addNewServiceToProject = async (req, res, next) => {
        try {
            const {serviceData, projectID} = req.body
            await this.service.addNewServiceToProject(serviceData, projectID)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    editService = async (req, res, next) => {
        try {
            const {serviceData} = req.body
            await this.service.editService(serviceData)
            res.sendStatus(200)

        } catch (error) {
            next(error)
        }
    }

}

export default ExtraServicesController