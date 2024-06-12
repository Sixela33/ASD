import ModelPostgres from "../model/DAO/ModelPostgres.js"
import { validateId, validateQueryString } from "./Validations/IdValidation.js"
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
        await validateId(clientid)
        await validateQueryString(clientname)
        await this.model.editClient(clientid, clientname)
    }

    deleteClient = async (id) => {
        await validateId(id)
        await this.model.deleteClient(id)
    }
}

export default ClientService