import ModelPostgres from "../model/DAO/ModelPostgres.js"
import { validateQueryString } from "./Validations/IdValidation.js"
import { validateClient } from "./Validations/clientValidations.js"
class ClientService {

    constructor() {
        this.model = new ModelPostgres()
    }

    addClients = async (clientName) => {
        await validateClient(clientName)
        await this.model.createClient(clientName)
    }

    getClients = async (searchByName) => {
        await validateQueryString(searchByName)
        const result = await this.model.getClients(searchByName)
        return result.rows 
    }

    editClient = async (clientid, clientname) => {
        await this.model.editClient(clientid, clientname)
    }
}

export default ClientService