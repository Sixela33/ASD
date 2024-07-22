import ModelPostgres from "../model/DAO/ModelPostgres.js"

class BankTransactionService {

    constructor() {
        this.model = new ModelPostgres()
    }

    addBankTransactions = async (transactionData) => {
        await this.model.addBankTransactions(transactionData)
    }

    getBankTransactions = async (searchByName) => {
        await validateQueryString(searchByName)
        const result = await this.model.getBankTransactions(searchByName)
        return result.rows
    }

    getBankTransactionsByStatement = async (id) => {
        const result = await this.model.getBankTransactionsByStatement(id)
        return result.rows
    }

    deleteBankTransaction = async (id) => {
        const result = await this.model.deleteBankTransaction(id)
        return result.rows
    }

    editBankTransaction = async (transactionData) => {
        await this.model.editBankTransaction(transactionData)
    }

    linkInvoices = async (selectedInvoicesData, selectedTransactionID) => {
        const result = await this.model.linkInvoices(selectedInvoicesData, selectedTransactionID)
    }

    getTransactionInvoices = async (id) => {
        const result = await this.model.getTransactionInvoices(id)
        return result.rows
    }
}

export default BankTransactionService