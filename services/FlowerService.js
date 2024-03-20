import ModelPostgres from "../model/DAO/ModelPostgres.js";
import fs from 'fs';
import path from 'path';
import { validateId } from "./Validations/IdValidation.js";
import { validateFlower } from "./Validations/FlowerValidations.js";
import { handleNewFileLocal } from "../utils/fileHandling.js";
import { handleReplaceFile } from "../utils/fileHandling.js";

const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpg"];
const FILES_BASE_PATH = process.env.LOCAL_FILES_LOCATION
const FLOWER_IMAGE_PATH = path.join(FILES_BASE_PATH, '/flowerImages/');

class FlowerService {
    constructor() {
        this.model = new ModelPostgres();
        if (!fs.existsSync(FLOWER_IMAGE_PATH)) {
            fs.mkdirSync(FLOWER_IMAGE_PATH, { recursive: true });
        }
    }

    addFlower = async (image, name, color) => {
        await validateFlower({name, color})
        let savePath = ''
        
        if (image) {
            savePath = await handleNewFileLocal(image, ALLOWED_IMAGE_EXTENSIONS, FLOWER_IMAGE_PATH)
        }

        await this.model.addFlower(savePath, name, color)
    };

    editFlower = async (image, name, color, prevFlowerPath, id ) => {
        await validateFlower({name, color})
        await validateId(id)
        let filepath = prevFlowerPath

        if (image) {
            filepath = handleReplaceFile(image, ALLOWED_IMAGE_EXTENSIONS, prevFlowerPath, FLOWER_IMAGE_PATH)
        }

        await this.model.editFlower(name, color, id, filepath)
    }

    getFlowers = async (offset, query) => {
        await validateId(offset)

        const response = await this.model.getFlowersQuery(offset, query)

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
}

export default FlowerService;
