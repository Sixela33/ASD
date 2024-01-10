import FlowerService from "../services/FlowerService.js"

class FlowerController {

    constructor() {
        this.service = new FlowerService()
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

    getFlowers = async (req, res, next) => {
        try {
            const {offset, query} = req.params
            const response = await this.service.getFlowers(offset, query)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }
}

export default FlowerController