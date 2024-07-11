import ModelPostgres from "../model/DAO/ModelPostgres.js"
import { validateId, validateQueryString } from "./Validations/IdValidation.js"
import { validateClient } from "./Validations/clientValidations.js"

class ContactService {

    constructor() {
        this.model = new ModelPostgres()
    }

    addContacts = async (ContactName) => {
        await validateClient(ContactName)
        await this.model.createContact(ContactName)
    }

    getContacts = async (searchByName) => {
        await validateQueryString(searchByName)
        const result = await this.model.getContacts(searchByName)
        return result.rows
    }

    editContact = async (Contactid, Contactname) => {
        await validateId(Contactid)
        await validateQueryString(Contactname)
        await this.model.editContact(Contactid, Contactname)
    }

    deleteContact = async (id) => {
        await validateId(id)
        await this.model.deleteContact(id)
    }
}

export default ContactService