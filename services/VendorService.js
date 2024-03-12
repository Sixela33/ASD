import ModelPostgres from "../model/DAO/ModelPostgres.js"

class VendorService {

    constructor() {
        this.model = new ModelPostgres()
    }

    addVendor = async (vendorName) => {
        console.log(vendorName)
        await this.model.addVender(vendorName)
    }

    getVendors = async () => {
        const result = await this.model.getVendors()
        return result.rows 
    }

    editVendor = async (vendorname, vendorid) => {
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