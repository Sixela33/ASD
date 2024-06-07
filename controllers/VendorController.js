import VendorService from "../services/VendorService.js"

class VendorController {

    constructor() {
        this.service = new VendorService()
    }

    addVendor = async (req, res, next) => {
        try {
            const {vendorname} = req.body
            await this.service.addVendor(vendorname)
            req.logger.info(`[NEW VENDOR] ${req.user.user.email} NAME: ${vendorname}`)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    getVendors = async (req, res, next) => {
        try {
            const {searchByName} = req.query
            const result = await this.service.getVendors(searchByName)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }

    editVendor = async (req, res, next) => {
        try {
            const {vendorname, vendorid} = req.body

            await this.service.editVendor(vendorname, vendorid)
            req.logger.info(`[EDIT VENDOR] ${req.user.user.email} NAME: ${vendorname}`)

            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    removeVendor = async (req, res, next) => {
        try {
            const {id} = req.params
            await this.service.removeVendor(id)
            req.logger.info(`[REMOVE VENDOR] ${req.user.user.email} ID: ${id}`)

            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    reactivateVendor  = async (req, res, next) => {
        try {
            const {id} = req.params

            await this.service.reactivateVendor(id)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }
}

export default VendorController