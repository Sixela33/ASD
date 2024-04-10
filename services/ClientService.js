import ModelPostgres from "../model/DAO/ModelPostgres.js"
import { validateClient } from "./Validations/clientValidations.js"
class ClientService {

    constructor() {
        this.model = new ModelPostgres()
    }

    addClients = async (clientName) => {
        await validateClient(clientName)
        await this.model.createClient(clientName)
    }

    getClients = async () => {
        const result = await this.model.getClients()
        return result.rows 
    }

    editClient = async (clientid, clientname) => {
        await this.model.editClient(clientid, clientname)
    }
}

export default ClientService