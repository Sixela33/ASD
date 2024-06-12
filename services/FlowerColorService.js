import ModelPostgres from "../model/DAO/ModelPostgres.js";
import { validateId, validateQueryString } from "./Validations/IdValidation.js";

class FlowerColorService {
    constructor() {
        this.model = new ModelPostgres();
    }

    getFlowerColors = async (searchByName) => {
        await validateQueryString(searchByName)
        let response = await this.model.getFlowerColors(searchByName)
        
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

    getColorID = async (name) => {
        await validateQueryString(name)
        const response = await this.model.getColorID(name)
        return response[0]
    }
    
    deleteColor = async (id) => {
        await validateId(id)
        await this.model.deleteColor(id)
        
    }


}

export default FlowerColorService;
