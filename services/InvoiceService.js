import ModelPostgres from "../model/DAO/ModelPostgres.js"

class InvoiceService {

    constructor() {
        this.model = new ModelPostgres()
    }


    
    
    addInvoice = async () => {
        
    }

    getInvoices = async () => {
        const result = await this.model.getVendors()
        return result.rows 
    }
}

export default InvoiceService