import VendorService from "../services/VendorService.js"

class VendorController {

    constructor() {
        this.service = new VendorService()
    }

    addVendor = async (req, res, next) => {
        try {
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    getVendors = async (req, res, next) => {
        try {
            const result = await this.service.getVendors()
            res.json(result)
        } catch (error) {
            next(error)
        }
    }

    
}

export default VendorController