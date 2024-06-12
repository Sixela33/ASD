import ModelPostgres from "../model/DAO/ModelPostgres.js"
import { validateId, validateQueryString } from "./Validations/IdValidation.js"
import { validateVendor } from "./Validations/VendorValidations.js"

class VendorService {

    constructor() {
        this.model = new ModelPostgres()
    }

    addVendor = async (vendorName) => {
        await validateVendor(vendorName)
        await this.model.addVender(vendorName)
    }

    getVendors = async (searchByName) => {
        await validateQueryString(searchByName)
        const result = await this.model.getVendors(searchByName)
        return result.rows 
    }

    editVendor = async (vendorname, vendorid) => {
        await validateVendor(vendorname)
        await validateId(vendorid)
        await this.model.editVendor(vendorname, vendorid)
    }

    removeVendor = async (id) => {
        console.log(id)
        await validateId(id)
        await this.model.removeVendor(id)
    }

}

export default VendorService