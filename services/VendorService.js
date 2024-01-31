import ModelPostgres from "../model/DAO/ModelPostgres.js"

class VendorService {

    constructor() {
        this.model = new ModelPostgres()
    }

    addVendor = async () => {

    }

    getVendors = async () => {
        const result = await this.model.getVendors()
        return result.rows 
    }
}

export default VendorService