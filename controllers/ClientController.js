import ClientService from "../services/ClientService.js"

class ClientController {

    constructor() {
        this.service = new ClientService()
    }

    createClient = async (req, res, next) => {
        try {
            const {clientName, clientEmail} = req.body
            await this.service.createClient(clientName, clientEmail)
        } catch (error) {
            next(error)
        }
    }
    
}

export default ClientController