import ModelPostgres from "../model/DAO/ModelPostgres.js"

class ClientService {

    constructor() {
        this.model = new ModelPostgres()
    }

    addClients = async () => {

    }

    getClients = async () => {
        const result = await this.model.getClients()
        return result.rows 
    }
}

export default ClientService