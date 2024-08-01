import ModelPostgres from "../model/DAO/ModelPostgres.js"
import { validateId, validateIdArray } from "./Validations/IdValidation.js"
import { validateNewTransaction, validateTransactionEdit } from "./Validations/TransactionValidations.js"

class BankTransactionService {

    constructor() {
        this.model = new ModelPostgres()
    }

    addBankTransactions = async (transactionData) => {
        await validateNewTransaction(transactionData)

        await this.model.addBankTransactions(transactionData)
    }

    getBankTransactions = async (searchByName) => {
        await validateQueryString(searchByName)

        const result = await this.model.getBankTransactions(searchByName)
        return result.rows
    }

    getBankTransactionsByStatement = async (id) => {
        await validateId(id);
        const statement_result = await this.model.getStatementDataByID(id);
        const transaction_result = await this.model.getBankTransactionsByStatement(id);

        const tempArray = transaction_result?.map(transaction => ({
            ...transaction,
            transactioncode: statement_result.vendorcode + '-' + transaction.transactiondate
        }));
    
        return tempArray;
    }
    

    deleteBankTransaction = async (id) => {
        await validateId(id)

        const result = await this.model.deleteBankTransaction(id)
        return result.rows
    }

    editBankTransaction = async (transactionData) => {
        await validateTransactionEdit(transactionData)

        await this.model.editBankTransaction(transactionData)
    }

    linkInvoices = async (selectedInvoicesData, selectedTransactionID) => {
        await validateId(selectedTransactionID)
        await validateIdArray(selectedInvoicesData)

        await this.model.linkInvoices(selectedInvoicesData, selectedTransactionID)
    }

    getTransactionInvoices = async (id) => {
        await validateId(id)

        const result = await this.model.getTransactionInvoices(id)
        return result.rows
    }
}

export default BankTransactionService