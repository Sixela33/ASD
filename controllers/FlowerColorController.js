import FlowerColorService from "../services/FlowerColorService.js"

class FlowerColorController {

    constructor(fileStorage) {
        this.service = new FlowerColorService(fileStorage)
    }

    getFlowerColors = async (req, res ,next) => {
        try {
            const response = await this.service.getFlowerColors()
            res.json(response)

        } catch (error) {
            next(error)
        }
    }

    createFlowerColor = async (req, res ,next) => {
        try {
            const {flowerName} = req.body
            await this.service.createFlowerColor(flowerName)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    editFlowerColor = async (req, res ,next) => {
        try {
            const {flowerName, colorID} = req.body
            await this.service.editFlowerColor(colorID, flowerName)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }


}

export default FlowerColorController