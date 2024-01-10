import ModelPostgres from "../model/DAO/ModelPostgres.js";
import fs from 'fs';
import path from 'path';
import { validateId } from "./Validations/IdValidation.js";

const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpg"];
const FLOWER_IMAGE_PATH = './flowerImages/';

class FlowerService {
    constructor() {
        this.model = new ModelPostgres();
        if (!fs.existsSync(FLOWER_IMAGE_PATH)) {
            fs.mkdirSync(FLOWER_IMAGE_PATH, { recursive: true });
        }
    }

    saveImage = async (image, name, color) => {
        const fileExtension = path.extname(image?.originalname).toLowerCase().substring(1);

        if (!ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension)) {
            throw { message: "Invalid image file extension", status: 400 };
        }

        let number = 0;

        let filename;
        do {
            filename = `${name}_${color}_${number}.${fileExtension}`;
            number++;
        } while (fs.existsSync(path.join(FLOWER_IMAGE_PATH, filename)));

        console.log(filename)

        fs.writeFileSync(path.join(FLOWER_IMAGE_PATH, filename), image.buffer, "binary");

        return path.join(FLOWER_IMAGE_PATH, filename);
    };

    addFlower = async (image, name, color) => {
        const savePath = await this.saveImage(image, name, color);
        await this.model.addFlower(savePath, name, color)
    };

    getFlowers = async (offset, query) => {
        await validateId(offset)

        let response = {rows: []}
        if (query){
            response = await this.model.getFlowersQuery(offset, query)
            
        } else {
            response = await this.model.getFlowers(offset)

        }

        return response.rows
    };
}

export default FlowerService;
