import ModelPostgres from "../model/DAO/ModelPostgres.js"
import path from 'path';
import { handleNewFileLocal } from "../utils/fileHandling.js";
import fs from 'fs';
const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpg", "pdf"];
const FILES_BASE_PATH = process.env.LOCAL_FILES_LOCATION
const INVOICE_FILES_PATH = path.join(FILES_BASE_PATH, '/InvoiceFiles/');

class InvoiceService {

    constructor() {
        this.model = new ModelPostgres()
        if (!fs.existsSync(INVOICE_FILES_PATH)) {
            fs.mkdirSync(INVOICE_FILES_PATH, { recursive: true });
        }
    }

    addInvoice = async (invoiceData, invoiceFlowerData, file, updaterID) => {
        
        invoiceData = JSON.parse(invoiceData)
        invoiceFlowerData = JSON.parse(invoiceFlowerData).flat(Infinity)

        let fileLocation = invoiceData.fileLocation

        if (file){
            fileLocation = handleNewFileLocal(file, ALLOWED_IMAGE_EXTENSIONS, INVOICE_FILES_PATH)
        }

        const response = await this.model.addInvoice(invoiceData, fileLocation, invoiceFlowerData, updaterID)
        return response
    }

    addIncompleteInvoice= async (invoiceData, file, updaterID) => {
        invoiceData = JSON.parse(invoiceData)
        
        let newFileLoc = invoiceData.fileLocation
        
        if (file) {
            newFileLoc = handleNewFileLocal(file, ALLOWED_IMAGE_EXTENSIONS, INVOICE_FILES_PATH)
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
        
        let newFileLoc = invoiceData.fileLocation
        
        if (file) {
            newFileLoc = handleNewFileLocal(file, ALLOWED_IMAGE_EXTENSIONS, INVOICE_FILES_PATH)
        } 

        console.log(invoiceData)
        console.log("fileLocation", invoiceData.fileLocation)
        console.log("fileLocation2", newFileLoc)
        const response = await this.model.editInvoice(invoiceData, newFileLoc, invoiceFlowerData, editorID)
        return response
    }

    getInvoices = async (offset, orderBy, order, searchQuery, searchBy, specificVendor) => {
        const result = await this.model.getInvoices(offset,  orderBy, order, searchQuery, searchBy, specificVendor)
        return result.rows 
    }

    getProvidedProjects = async (id) => {
        console.log(id)
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
        await this.model.linkBaknTransaction(bankTransactionData, selectedInvoices)

        return
    }
}

export default InvoiceService