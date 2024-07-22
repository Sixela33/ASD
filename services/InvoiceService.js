import ModelPostgres from "../model/DAO/ModelPostgres.js"
import FileHandlerSelector from "../FileHandlers/FileHandlerSelector.js";
import { validateInvoice, validateFlowers, validateBankTransaction } from "./Validations/InvoiceValidations.js";
import { minMaxNumbersValidation, startDateEndDateValidation, validateBoolean, validateId, validateIdArray, validateQueryStringLength } from "./Validations/IdValidation.js";

const ALLOWED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'pdf'];

const INVOICE_FILES_PATH = 'InvoiceFiles'

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

        const response = await this.model.addInvoice(invoiceData, fileLocation, invoiceFlowerData, updaterID)
        return response
    }

    addIncompleteInvoice = async (invoiceData, file, updaterID) => {
        invoiceData = JSON.parse(invoiceData)

        await validateInvoice(invoiceData)
        
        let newFileLoc

        if (invoiceData.invoiceid){
            newFileLoc = await this.model.getInvoiceFileLocation(invoiceData.invoiceid)
            newFileLoc = newFileLoc.rows

            if(newFileLoc[0]){
                newFileLoc = newFileLoc[0].filelocation
            }

            if (file) {
                newFileLoc = await this.fileHandler.handleReplaceFile(file, ALLOWED_IMAGE_EXTENSIONS, newFileLoc, INVOICE_FILES_PATH)
            }

        } else {
            if(file) {
                newFileLoc = await this.fileHandler.handleNewFile(file, ALLOWED_IMAGE_EXTENSIONS, INVOICE_FILES_PATH)
            }
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

        let newFileLoc = await this.model.getInvoiceFileLocation(invoiceData.invoiceid)
        newFileLoc = newFileLoc.rows

        if(newFileLoc[0]){
            newFileLoc = newFileLoc[0].filelocation
        }

        if (file) {
            newFileLoc = await this.fileHandler.handleReplaceFile(file, ALLOWED_IMAGE_EXTENSIONS, newFileLoc, INVOICE_FILES_PATH)
        } 

        if(!newFileLoc) throw {}

        const response = await this.model.editInvoice(invoiceData, newFileLoc, invoiceFlowerData, editorID)
        return response
    }

    deleteInvoice = async (id) => {
        await validateId(id)
        let invoiceData = await this.model.getInvoiceData(id)
        invoiceData = invoiceData.rows

        if(invoiceData && invoiceData[0]) {
            await this.model.deleteInvoice(id)
            await this.fileHandler.handleDeleteFile(invoiceData[0].fileLocation)
        } else {
            throw { message: "Invoice not found", status: 404 };
        }
    }

    getInvoices = async (offset, orderBy, order, invoiceNumber, invoiceID, specificVendor, onlyMissing, rows, startDate, endDate, minAmount, maxAmount, withoutTransaction) => {
        await validateId(offset)
        await validateQueryStringLength([orderBy, order, invoiceNumber, invoiceID, specificVendor, onlyMissing])
        await startDateEndDateValidation({startDate, endDate})
        await minMaxNumbersValidation({minAmount, maxAmount})
        await validateBoolean(withoutTransaction)
        const result = await this.model.getInvoices(offset,  orderBy, order, invoiceNumber, invoiceID, specificVendor, onlyMissing, rows, startDate, endDate, minAmount, maxAmount, withoutTransaction)
        return result.rows 
    }

    getProvidedProjects = async (id) => {
        await validateId(id)

        let invoiceData = this.model.getInvoiceData(id)
        let projects = this.model.getProvidedProjects(id)
        let flowers = this.model.getFlowersXInvoice(id) 
        
        invoiceData = await invoiceData
        invoiceData = invoiceData.rows

        for (let invoice of invoiceData) {
            invoice.filelocation = await this.fileHandler.processFileLocation(invoice.filelocation)
          }

        projects = await projects
        projects = projects.rows

        flowers = await flowers
        flowers = flowers.rows

        return {projects, flowers, invoiceData, bankTransactions:[]}
    }

    getInvoiceData = async (id) => {
        await validateId(id)

        let invoiceData = this.model.getInvoiceData(id)
        let projects = this.model.getInvoiceProjects(id)
        let flowers = this.model.getFlowersXInvoice(id) 
        
        invoiceData = await invoiceData
        invoiceData = invoiceData.rows

        for (let invoice of invoiceData) {
            invoice.filelocation = await this.fileHandler.processFileLocation(invoice.filelocation)
          }

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