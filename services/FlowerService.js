import ModelPostgres from "../model/DAO/ModelPostgres.js";
import { validateId } from "./Validations/IdValidation.js";
import { validateFlower } from "./Validations/FlowerValidations.js";
import FileHandlerSelector from "../FileHandlers/FileHandlerSelector.js";

const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpg", 'jpeg'];
const FLOWER_IMAGE_PATH = 'flowerImages'

class FlowerService {
    constructor(fileStorage) {

        this.model = new ModelPostgres();
        this.fileHandler = new FileHandlerSelector(fileStorage).start()
    }

    addFlower = async (image, name, colors, initialPrice) => {
        await validateFlower({name, colors, initialPrice})
        let savePath = ''
        if (image) {
            savePath = await this.fileHandler.handleNewFile(image, ALLOWED_IMAGE_EXTENSIONS, FLOWER_IMAGE_PATH, true)
        }
        
        const response = await this.model.addFlower(savePath, name, colors, initialPrice)
        return response[0]
    };

    editFlower = async (image, name, colors, id, initialPrice ) => {
        await validateFlower({name, colors, initialPrice})
        await validateId(id)
        let flowerData = await this.model.getFlowerData(id)
        flowerData = flowerData.rows[0]

        if(!flowerData) {
            throw { message: "Flower not found", status: 404 };
        }

        let filepath = flowerData.flowerimage

        if (image) {
            filepath = await this.fileHandler.handleReplaceFile(image, ALLOWED_IMAGE_EXTENSIONS, flowerData.flowerimage, FLOWER_IMAGE_PATH, true)
        }

        await this.model.editFlower(name, colors, id, filepath, initialPrice)
    }

    deleteFlower = async (id) => {
        await validateId(id)
        let flowerData = await this.model.getFlowerData(id)
        flowerData = flowerData.rows
        if(flowerData && flowerData[0]) {
            await this.fileHandler.handleDeleteFile(flowerData[0].flowerimage)
            await this.model.deleteFlower(id)
        } else {
            throw { message: "Flower not found", status: 404 };
        }

    }

    recoverFlower = async (id) => {
        await validateId(id)
        await this.model.recoverFlower(id)
    }

    getFlowers = async (offset, query, filterByColor, showIncomplete, showDisabled) => {
        await validateId(offset)
        const response = await this.model.getFlowersQuery(offset, query, filterByColor, showIncomplete, showDisabled)
        let flowers = response.rows

        for (let flower of flowers) {
            flower.flowerimage = await this.fileHandler.processFileLocation(flower.flowerimage)
          }
        return flowers
    }

    getFlowerData = async (id) => {
        await validateId(id)

        let data = this.model.getFlowerData(id)
        let prices = this.model.getFlowerPrices(id)

        data = await data
        prices = await prices

        data = data.rows

        for (let flower of data) {
            flower.flowerimage = await this.fileHandler.processFileLocation(flower.flowerimage)
          }

        return {flowerData: data, flowerPrices: prices.rows}
    }

    getLatestFlowerData = async (id) => {
        await validateId(id)

        let data = await this.model.getLatestFlowerData(id)

        data = data.rows

        return data
    }

    getIncompleteFlowers = async () => {
        let response = await this.model.getIncompleteFlowers()
        response = response.rows
        for (let flower of response) {
            flower.flowerimage = await this.fileHandler.processFileLocation(flower.flowerimage)
          }

        return response
    }
}

export default FlowerService;
