import ModelPostgres from "../model/DAO/ModelPostgres.js"
import { validateId } from "./Validations/IdValidation.js"
import { validateVendor } from "./Validations/VendorValidations.js"

class VendorService {

    constructor() {
        this.model = new ModelPostgres()
    }

    addVendor = async (vendorName) => {
        await validateVendor(vendorName)
        await this.model.addVender(vendorName)
    }

    getVendors = async () => {
        const result = await this.model.getVendors()
        return result.rows 
    }

    editVendor = async (vendorname, vendorid) => {
        await validateVendor(vendorname)
        await validateId(vendorid)
        await this.model.editVendor(vendorname, vendorid)
    }

    removeVendor = async (id) => {
        await this.model.removeVendor(id)
    }

    reactivateVendor = async (id) => {
        await this.model.reactivateVendor(id)
    }
}

export default VendorService