import ModelPostgres from "../model/DAO/ModelPostgres.js"
import fs from 'fs';
import path from 'path';

const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpg", "pdf"];
const FILES_BASE_PATH = process.env.LOCAL_FILES_LOCATION
const INVOICE_FILES_PATH = path.join(FILES_BASE_PATH, '/InvoiceFiles/');

class InvoiceService {

    constructor() {
        this.model = new ModelPostgres()
    }

    addInvoice = async (invoiceData, invoiceFlowerData, file, uploaderid) => {
        const fileExtension = path.extname(file?.originalname).toLowerCase().substring(1);

        if (!ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension)) {
            throw { message: "Invalid image file extension", status: 400 };
        }

        let folder = path.join(INVOICE_FILES_PATH + new Date().toISOString().split('T')[0]);

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        let number = 0;
        let filename
        let additive = ''
        do {
            filename = `${path.parse(file?.originalname).name.replace(/ /g, '_')}${additive}.${fileExtension}`;
            additive = `(${number})`
            number++;
        } while (fs.existsSync(path.join(folder, filename)));

        console.log(filename)
        folder = path.join(folder, filename)
        fs.writeFileSync(folder, file.buffer, "binary");

        invoiceFlowerData = JSON.parse(invoiceFlowerData).flat(Infinity)
        
        invoiceData = JSON.parse(invoiceData)
        const response = await this.model.addInvoice(invoiceData, folder, invoiceFlowerData, uploaderid)
        return response
    }

    getInvoices = async (offset, query) => {
        const result = await this.model.getInvoices(offset, query)
        return result.rows 
    }

    getProvidedProjects = async (id) => {
        let projects = await this.model.getProvidedProjects(id)
        projects = projects.rows
        
        let flowers = await this.model.getFlowersXInvoice(id) 
        flowers = flowers.rows
        
        return {projects, flowers}
    }
}

export default InvoiceService