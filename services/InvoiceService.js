import ModelPostgres from "../model/DAO/ModelPostgres.js"
import path from 'path';
import FileHandlerSelector from "../FileHandlers/FileHandlerSelector.js";
import fs from 'fs';
import { validateInvoice, validateFlowers, validateBankTransaction } from "./Validations/InvoiceValidations.js";
import { validateId, validateIdArray, validateQueryStringLength } from "./Validations/IdValidation.js";
import tesseract from 'tesseract.js'
import PdfParse from "pdf-parse";
import OCR_Model from "../ml_model/OCR_Model.js";

const ALLOWED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'pdf']

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

        for (let invoice of invoiceData) {
            invoice.filelocation = await this.fileHandler.processFileLocation(invoice.filelocation)
          }

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

    processFile = async (file) => {
        if (!file) {
            throw { message: "No file was found in request", status: 400 }
        }
    
        const fileExtension = path.extname(file.originalname).toLowerCase().substring(1)
    
        if (!ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension)) {
            throw { message: "Invalid file extension", status: 400 }
        }
    
        let text = ''
        const dataBuffer = file.buffer
        try {
            // Processing files differently depending on extension
            if (fileExtension == 'pdf') {
                // Extract text from PDF
                const data = await PdfParse(dataBuffer)
                text = data.text;
            } else if (['png', 'jpg', 'jpeg'].includes(fileExtension)) {
                // Extract text from image using Tesseract
                const result = await tesseract.recognize(dataBuffer, 'eng')
                text = result.data.text
            }
        } catch (error) {
            throw { message: "Error processing file" + error.message, status: 500}
        }
    
        console.log(text)
        return text
    }


    extractInvoiceData = async (file) => {

        const text = await this.processFile(file)
        console.log(text)
        return text
    };

}

export default InvoiceService