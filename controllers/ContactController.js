import ContactService from "../services/ContactService.js"

class ContactController {

    constructor() {
        this.service = new ContactService()
    }

    addContact = async (req, res, next) => {
        try {
            const {contactname} = req.body
            await this.service.addContacts(contactname)
            req.logger.info(`[NEW CONTACT] ${req.user.user.email} Name: ${contactname}`)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }
    

    getContacts = async (req, res, next) => {
        try {
            const {searchByName} = req.query
            const result = await this.service.getContacts(searchByName)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }

    editContact = async (req, res, next) => {
        try {
            const {contactid, contactname} = req.body
            await this.service.editContact(contactid, contactname)
            req.logger.info(`[CONTACT EDIT] ${req.user.user.email} ID: ${contactid} New name: ${contactname}`)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    deleteContact = async (req, res, next) => {
        try {
            const {id} = req.query
            await this.service.deleteContact(id)
            req.logger.info(`[CONTACT REMOVED] ${req.user.user.email} ID: ${id}`)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    
}

export default ContactController