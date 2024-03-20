import ClientService from "../services/ClientService.js"

class ClientController {

    constructor() {
        this.service = new ClientService()
    }

    addClient = async (req, res, next) => {
        try {
            const {clientname} = req.body
            await this.service.addClients(clientname)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }
    

    getClients = async (req, res, next) => {
        try {
            const result = await this.service.getClients()
            res.json(result)
        } catch (error) {
            next(error)
        }
    }

    
}

export default ClientController