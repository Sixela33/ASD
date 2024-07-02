import FlowerColorService from "../services/FlowerColorService.js"

class FlowerColorController {

    constructor() {
        this.service = new FlowerColorService()
    }

    getFlowerColors = async (req, res ,next) => {
        try {
            const {searchByName} = req.query
            const response = await this.service.getFlowerColors(searchByName)
            res.json(response)

        } catch (error) {
            next(error)
        }
    }

    createFlowerColor = async (req, res ,next) => {
        try {
            const {colorName} = req.body
            await this.service.createFlowerColor(colorName)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    editFlowerColor = async (req, res ,next) => {
        try {
            const {colorName, colorID} = req.body
            await this.service.editFlowerColor(colorID, colorName)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    getColorID = async (req, res, next) => {
        try {
            const {name} = req.params
            const response = await this.service.getColorID(name)

            if(!response) {
                res.sendStatus(404)
            } else {
                res.json(response).status(200)
            }
        } catch (error) {
            next(error)
        }
    }

    deleteColor = async (req, res, next) => {
        try {
            const {id} = req.query
            await this.service.deleteColor(id)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }


}

export default FlowerColorController