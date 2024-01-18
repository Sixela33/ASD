import ArrangementService from "../services/ArrangementService.js"

class ArrangementController {

    constructor() {
        this.service = new ArrangementService()
    }

    // Recibe un id de arreglo y un array con el formato [[flowerid, cantidad], [flowerid, cantidad], [flowerid, cantidad]]

    populateArrangement = async (req, res, next) => {
        try {
            const [arrangementid, flowers] = req.body
            await this.service.populateArrangement(arrangementid, flowers)
                
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

}

export default ArrangementController