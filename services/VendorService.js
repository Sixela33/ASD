import ModelPostgres from "../model/DAO/ModelPostgres.js"
import { validateId, validateQueryString } from "./Validations/IdValidation.js"
import { validateVendor } from "./Validations/VendorValidations.js"

class VendorService {

    constructor() {
        this.model = new ModelPostgres()
    }

    addVendor = async (vendorname, vendorcode) => {
        await validateVendor({vendorname, vendorcode})
        await this.model.addVendor(vendorname, vendorcode)
    }

    getVendors = async (searchByName) => {
        await validateQueryString(searchByName)
        const result = await this.model.getVendors(searchByName)
        return result.rows 
    }

    editVendor = async (vendorname, vendorcode, vendorid) => {
        await validateVendor({vendorname, vendorcode})
        await validateId(vendorid)
        await this.model.editVendor(vendorname, vendorcode, vendorid)
    }

    removeVendor = async (id) => {
        await validateId(id)
        await this.model.removeVendor(id)
    }

}

export default VendorService