import ModelPostgres from "../model/DAO/ModelPostgres.js"

class ClientService {

    constructor() {
        this.model = new ModelPostgres()
    }

    createClient = async (clientName, clientEmail) => {
        await this.model.createClient(clientName, clientEmail)
    }
}

export default ClientService