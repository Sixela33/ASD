import ModelPostgres from "../model/DAO/ModelPostgres.js";
import fs from 'fs';
import path from 'path';
import { validateId } from "./Validations/IdValidation.js";
import { handleFileLocal } from "../utils/fileHandling.js";

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
        let savePath = ''
        if (image) {
            savePath = await handleFileLocal(image, ALLOWED_IMAGE_EXTENSIONS, FLOWER_IMAGE_PATH)
        }
        await this.model.addFlower(savePath, name, color)
    };

    getFlowers = async (offset, query) => {
        await validateId(offset)

        //let response = {rows: []}
        const response = await this.model.getFlowersQuery(offset, query)

        return response.rows
    };
}

export default FlowerService;
