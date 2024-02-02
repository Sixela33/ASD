import ModelPostgres from "../model/DAO/ModelPostgres.js"

class InvoiceService {

    constructor() {
        this.model = new ModelPostgres()
    }

    addInvoice = async (invoiceData, InvoiceFlowerData) => {
        console.log(invoiceData)
        console.log(InvoiceFlowerData)
        //const parsedDisplayFlowerData = JSON.parse(displayFlowerData)
        //console.log(parsedDisplayFlowerData)
    }

    getInvoices = async () => {
        const result = await this.model.getVendors()
        return result.rows 
    }
}

export default InvoiceService