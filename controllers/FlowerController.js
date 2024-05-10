import FlowerService from "../services/FlowerService.js"

class FlowerController {

    constructor(fileStorage) {
        this.service = new FlowerService(fileStorage)
    }

    addFlower = async (req, res, next) => {
        try {
            const image = req.file
            const { name, colors } = req.body
            console.log(req.body)
            const response = await this.service.addFlower(image, name, colors)
            res.json(response)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    editFlower = async (req, res, next) => {
        try {
            const image = req.file
            const { name, colors, id } = req.body
            await this.service.editFlower(image, name, colors, id)
            res.sendStatus(200)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }    

    getFlowers = async (req, res, next) => {
        try {
            const {offset, query} = req.params
            const { filterByColor, showIncomplete} = req.query
            const response = await this.service.getFlowers(offset, query, filterByColor, showIncomplete)
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

    getIncompleteFlowers= async (req, res, next) => {
        try {
            const response = await this.service.getIncompleteFlowers()
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

    getUniqueFlowerColors= async (req, res, next) => {
        try {
            const response = await this.service.getUniqueFlowerColors()
            res.json(response)
        } catch (error) {
            next(error)
        }
    }
}

export default FlowerController