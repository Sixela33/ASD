import ModelPostgres from "../model/DAO/ModelPostgres.js"
import path from 'path';
import { handleFileLocal } from "../utils/fileHandling.js";
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

    addInvoice = async (invoiceData, invoiceFlowerData, file, uploaderid) => {
        
        const fileLocation = handleFileLocal(file, ALLOWED_IMAGE_EXTENSIONS, INVOICE_FILES_PATH)
        invoiceFlowerData = JSON.parse(invoiceFlowerData).flat(Infinity)
        
        invoiceData = JSON.parse(invoiceData)
        const response = await this.model.addInvoice(invoiceData, fileLocation, invoiceFlowerData, uploaderid)
        return response
    }

    getInvoices = async (offset, query) => {
        const result = await this.model.getInvoices(offset, query)
        return result.rows 
    }

    getProvidedProjects = async (id) => {
        console.log(id)
        let invoiceData = await this.model.getInvoiceData(id)
        invoiceData = invoiceData.rows

        let projects = await this.model.getProvidedProjects(id)
        projects = projects.rows
        
        let flowers = await this.model.getFlowersXInvoice(id) 
        flowers = flowers.rows
        
        return {projects, flowers, invoiceData}
    }
}

export default InvoiceService