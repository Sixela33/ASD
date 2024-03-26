import ModelPostgres from "../model/DAO/ModelPostgres.js"
import path from 'path';
import FileHandlerSelector from "../FileHandlers/FileHandlerSelector.js";
import fs from 'fs';
import { validateInvoice, validateFlowers, validateBankTransaction } from "./Validations/InvoiceValidations.js";
import { validateId, validateIdArray, validateQueryStringLength } from "./Validations/IdValidation.js";

const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpg", "pdf"];



class InvoiceService {

    constructor(fileStorage) {
        this.model = new ModelPostgres()
        
        this.fileHandler = new FileHandlerSelector(fileStorage).start()
    }

    addInvoice = async (invoiceData, invoiceFlowerData, file, updaterID) => {
        
        invoiceData = JSON.parse(invoiceData)
        invoiceFlowerData = JSON.parse(invoiceFlowerData).flat(Infinity)

        await validateInvoice(invoiceData)
        await validateFlowers(invoiceFlowerData)

        let fileLocation = invoiceData.fileLocation

        if (file){
            fileLocation = await this.fileHandler.handleNewFile(file, ALLOWED_IMAGE_EXTENSIONS, INVOICE_FILES_PATH)
        }

        if(!fileLocation) {
            throw {message: "A file is required to load an invoice", status: 400}
        }
        console.log("invoiceFlowerData", invoiceFlowerData)

        const response = await this.model.addInvoice(invoiceData, fileLocation, invoiceFlowerData, updaterID)
        return response
    }

    addIncompleteInvoice= async (invoiceData, file, updaterID) => {
        invoiceData = JSON.parse(invoiceData)

        await validateInvoice(invoiceData)

        let newFileLoc = invoiceData.fileLocation
        
        if (file) {
            newFileLoc = await this.fileHandler.handleNewFile(file, ALLOWED_IMAGE_EXTENSIONS, INVOICE_FILES_PATH)
        } 
        
        if(!newFileLoc) {
            throw {message: "A file is required to load an invoice", status: 400}
        }

        if (invoiceData.invoiceid) {
            await this.model.editIncompleteInvoice(invoiceData, newFileLoc, updaterID, invoiceData.invoiceid)

        } else {
            await this.model.addIncompleteInvoice(invoiceData, newFileLoc, updaterID)
            
        }

        return 
    }

    editInvoice = async (invoiceData, invoiceFlowerData, file, editorID) => {
        
        invoiceFlowerData = JSON.parse(invoiceFlowerData).flat(Infinity)
        invoiceData = JSON.parse(invoiceData)
        
        await validateInvoice(invoiceData)
        await validateFlowers(invoiceFlowerData)
        await validateId(invoiceData.invoiceid)

        let newFileLoc = invoiceData.fileLocation
        
        if (file) {
            newFileLoc = await this.fileHandler.handleNewFile(file, ALLOWED_IMAGE_EXTENSIONS, INVOICE_FILES_PATH)
        } 

        if(!newFileLoc) throw {}

        const response = await this.model.editInvoice(invoiceData, newFileLoc, invoiceFlowerData, editorID)
        return response
    }

    getInvoices = async (offset, orderBy, order, searchQuery, searchBy, specificVendor, onlyMissing, rows) => {
        await validateId(offset)
        await validateQueryStringLength([orderBy, order, searchQuery, searchBy, specificVendor, onlyMissing])
        const result = await this.model.getInvoices(offset,  orderBy, order, searchQuery, searchBy, specificVendor, onlyMissing, rows)
        return result.rows 
    }

    getProvidedProjects = async (id) => {
        await validateId(id)

        let invoiceData = this.model.getInvoiceData(id)
        let projects = this.model.getProvidedProjects(id)
        let flowers = this.model.getFlowersXInvoice(id) 
        let bankTransactions = this.model.getInvoiceBankTransactions(id)
        
        invoiceData = await invoiceData
        invoiceData = invoiceData.rows

        projects = await projects
        projects = projects.rows

        flowers = await flowers
        flowers = flowers.rows

        bankTransactions = await bankTransactions
        bankTransactions = bankTransactions.rows

        return {projects, flowers, invoiceData, bankTransactions}
    }

    getInvoiceData = async (id) => {
        await validateId(id)

        let invoiceData = this.model.getInvoiceData(id)
        let projects = this.model.getInvoiceProjects(id)
        let flowers = this.model.getFlowersXInvoice(id) 
        
        invoiceData = await invoiceData
        invoiceData = invoiceData.rows

        projects = await projects
        projects = projects.rows
        projects = projects.map(project => project.projectid)
    
        flowers = await flowers
        flowers = flowers.rows

        return {projects, flowers, invoiceData}
    }

    linkBaknTransaction = async (bankTransactionData, selectedInvoices) => {

        await validateIdArray(selectedInvoices)
        await validateBankTransaction(bankTransactionData)

        await this.model.linkBaknTransaction(bankTransactionData, selectedInvoices)

        return
    }
}

export default InvoiceService