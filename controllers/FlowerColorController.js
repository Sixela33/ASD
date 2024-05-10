import FlowerColorService from "../services/FlowerColorService.js"

class FlowerColorController {

    constructor() {
        this.service = new FlowerColorService()
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
            const {colorName} = req.body
            console.log("req.body", req.body)
            await this.service.createFlowerColor(colorName)
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

    getColorID = async (req, res, nect) => {
        try {
            const {name} = req.params
            const response = await this.service.getColorID(name)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }


}

export default FlowerColorController