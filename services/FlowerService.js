import ModelPostgres from "../model/DAO/ModelPostgres.js";
import fs from 'fs';
import path from 'path';
import { validateId } from "./Validations/IdValidation.js";
import { validateFlower } from "./Validations/FlowerValidations.js";
import FileHandlerSelector from "../FileHandlers/FileHandlerSelector.js";

const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpg"];
const FLOWER_IMAGE_PATH = 'flowerImages'

class FlowerService {
    constructor(fileStorage) {

        this.model = new ModelPostgres();
        this.fileHandler = new FileHandlerSelector(fileStorage).start()
    }

    addFlower = async (image, name, color) => {
        await validateFlower({name, color})
        let savePath = ''
        if (image) {
            savePath = await this.fileHandler.handleNewFile(image, ALLOWED_IMAGE_EXTENSIONS, FLOWER_IMAGE_PATH)
        }

        await this.model.addFlower(savePath, name, color)
    };

    editFlower = async (image, name, color, id ) => {
        await validateFlower({name, color})
        await validateId(id)
        let flowerData = await this.model.getFlowerData(id)
        flowerData = flowerData.rows[0]

        let filepath = flowerData.flowerimage

        if (image) {
            filepath = await this.fileHandler.handleReplaceFile(image, ALLOWED_IMAGE_EXTENSIONS, flowerData.flowerimage, FLOWER_IMAGE_PATH)
        }

        await this.model.editFlower(name, color, id, filepath)
    }

    getFlowers = async (offset, query, filterByColor) => {
        await validateId(offset)

        const response = await this.model.getFlowersQuery(offset, query, filterByColor)
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

    getIncompleteFlowers = async () => {
        let response = await this.model.getIncompleteFlowers()
        response = response.rows
        for (let flower of response) {
            flower.flowerimage = await this.fileHandler.processFileLocation(flower.flowerimage)
          }

        return response
    }

    getUniqueFlowerColors = async () => {
        const colors = await this.model.getUniqueFlowerColors()
        
        return colors.rows
    }
}

export default FlowerService;
