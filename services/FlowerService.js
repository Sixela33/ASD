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

    editFlower = async (image, name, color, prevFlowerPath, id ) => {
        await validateFlower({name, color})
        await validateId(id)
        let filepath = prevFlowerPath

        if (image) {
            filepath = await this.fileHandler.handleReplaceFile(image, ALLOWED_IMAGE_EXTENSIONS, prevFlowerPath, FLOWER_IMAGE_PATH)
        }

        await this.model.editFlower(name, color, id, filepath)
    }

    getFlowers = async (offset, query, filterByColor) => {
        await validateId(offset)

        const response = await this.model.getFlowersQuery(offset, query, filterByColor)

        return response.rows
    };

    getFlowerData = async (id) => {
        await validateId(id)

        let data = this.model.getFlowerData(id)
        let prices = this.model.getFlowerPrices(id)

        data = await data
        prices = await prices

        return {flowerData: data.rows, flowerPrices: prices.rows}
    }

    getIncompleteFlowers = async () => {
        const response = await this.model.getIncompleteFlowers()
        return response.rows
    }

    getUniqueFlowerColors = async () => {
        const colors = await this.model.getUniqueFlowerColors()
        
        return colors.rows
    }
}

export default FlowerService;
