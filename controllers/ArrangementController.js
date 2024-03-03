import ArrangementService from "../services/ArrangementService.js"

class ArrangementController {

    constructor() {
        this.service = new ArrangementService()
    }

    // Recibe un id de arreglo y un array con el formato [[flowerid, cantidad], [flowerid, cantidad], [flowerid, cantidad]]

    populateArrangement = async (req, res, next) => {
        try {
            const {arrangementid, flowers} = req.body
            await this.service.populateArrangement(arrangementid, flowers)
                
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    getArrangementTypes = async (req, res, next) => {
        try {
            
            const response = await this.service.getArrangementTypes()
                
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

    getArrangementData = async (req, res, next) => {
        try {
            const {id} = req.params
            const response = await this.service.getArrangementData(id)
                
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

    editArrangement = async (req, res, next) => {
        try {
            const {id} = req.params
            const arrangementData = req.body
            const response = await this.service.editArrangement(id, arrangementData)
                
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

    deleteArrangement = async (req, res, next) => {
        try {
            const {id} = req.params
            const response = await this.service.deleteArrangement(id)
                
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

}

export default ArrangementController