import ModelPostgres from "../model/DAO/ModelPostgres.js";
import { validateId, validateQueryString } from "./Validations/IdValidation.js";

class FlowerColorService {
    constructor() {
        this.model = new ModelPostgres();
    }

    getFlowerColors = async () => {
        let response = await this.model.getUniqueFlowerColors()
        
        return response
    }

    createFlowerColor = async (colorName) => {
        await validateQueryString(colorName)
        await this.model.createFlowerColor(colorName)
    }

    editFlowerColor = async (colorID, colorName) => {
        await validateQueryString(colorName)
        await validateId(colorID)
        await this.model.editFlowerColor(colorID, colorName)
    }


}

export default FlowerColorService;
