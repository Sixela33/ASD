import FlowerService from "../services/FlowerService.js"

class FlowerController {

    constructor(fileStorage) {
        this.service = new FlowerService(fileStorage)
    }

    addFlower = async (req, res, next) => {
        try {
            const image = req.file
            const { name, colors, initialPrice, clientName, seasons } = req.body
            console.log("req.body", req.body)
            const response = await this.service.addFlower(image, name, colors, initialPrice, clientName, seasons)
            req.logger.info(`[NEW FLOWER] ${req.user.user.email} name: ${name}`)
            res.json(response)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    editFlower = async (req, res, next) => {
        try {
            const image = req.file
            const { name, colors, id, initialPrice } = req.body
            await this.service.editFlower(image, name, colors, id, initialPrice)
            req.logger.info(`[FLOWER EDIT] ${req.user.user.email} id: ${id}, name: ${name}`)
            res.sendStatus(200)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }   
    
    
    deleteFlower = async (req, res, next) => {
        try {
            const {id} = req.params
            await this.service.deleteFlower(id)
            req.logger.info(`[FLOWER DELETE] ${req.user.user.email} id: ${id}`)
            res.sendStatus(200)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }  

    recoverFlower = async (req, res, next) => {
        try {
            const {id} = req.params
            await this.service.recoverFlower(id)
            res.sendStatus(200)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }  

    getFlowers = async (req, res, next) => {
        try {
            const {offset, query} = req.params
            const { filterByColor, showIncomplete, showDisabled} = req.query
            const response = await this.service.getFlowers(offset, query, filterByColor, showIncomplete, showDisabled)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

    getFlowerData = async (req, res, next) => {
        try {
            const { id } = req.params
            const response = await this.service.getFlowerData(id)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

    getLatestFlowerData = async (req, res, next) => {
        try {
            const { id } = req.params
            const response = await this.service.getLatestFlowerData(id)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

    getIncompleteFlowers= async (req, res, next) => {
        try {
            const response = await this.service.getIncompleteFlowers()
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

    getAllSeasons = async (req, res, next) => {
        try {
            const response = await this.service.getAllSeasons()
            res.json(response)
        } catch (error) {
            next(error)
        }
    }
}

export default FlowerController