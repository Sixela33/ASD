import FlowerService from "../services/FlowerService.js"

class FlowerController {

    constructor(fileStorage) {
        this.service = new FlowerService(fileStorage)
    }

    addFlower = async (req, res, next) => {
        try {
            const image = req.file
            const { name, color } = req.body
            await this.service.addFlower(image, name, color)
            res.sendStatus(200)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }    

    editFlower = async (req, res, next) => {
        try {
            const image = req.file
            const { name, color, prevFlowerPath, id } = req.body
            await this.service.editFlower(image, name, color, prevFlowerPath, id)
            res.sendStatus(200)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }    

    getFlowers = async (req, res, next) => {
        try {
            const {offset, query} = req.params
            const { filterByColor } = req.query
            console.log(req.query)
            const response = await this.service.getFlowers(offset, query, filterByColor)
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