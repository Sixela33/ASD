import ModelPostgres from "../model/DAO/ModelPostgres.js"
import CreateTransactionCSV from "./GoogleSuite/CreateTransactionCSV.js"
import { minMaxNumbersValidation, startDateEndDateValidation, validateId, validateIdArray, validateQueryStringLength } from "./Validations/IdValidation.js"
import { validateNewTransaction, validateTransactionEdit } from "./Validations/TransactionValidations.js"

class BankTransactionService {

    constructor() {
        this.model = new ModelPostgres()
    }

    addBankTransactions = async (transactionData) => {
        await validateNewTransaction(transactionData)

        await this.model.addBankTransactions(transactionData)
    }

    getBankTransactions = async (offset, orderBy, order, specificVendor, startDate, endDate, minAmount, maxAmount, code) => {
        await validateId(offset)
        await validateQueryStringLength([orderBy, order, specificVendor, code])
        await startDateEndDateValidation({startDate, endDate})
        await minMaxNumbersValidation({minAmount, maxAmount})

        const result = await this.model.getBankTransactions(offset, orderBy, order, specificVendor, startDate, endDate, minAmount, maxAmount, code)
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

    getTransactionDataByID = async (id) => {
        await validateId

        let transaction_data = this.model.getBankTransactionDataByID(id)
        transaction_data = await transaction_data
        transaction_data = transaction_data?.rows

        const tempArray = transaction_data?.map(transaction => ({
            ...transaction,
            transactioncode: transaction.vendorcode + '-' + transaction.transactiondate
        }));

        return tempArray

    }

    getSingleBankTransactionData = async (id) => {
        await validateId(id)
        let transaction_data = this.getTransactionDataByID(id)
        let linked_invoices = this.model.getTransactionInvoices(id)
        let linked_projects = this.model.getTransactionProjects(id)
        
        transaction_data = await transaction_data
        linked_invoices = await linked_invoices
        linked_projects = await linked_projects

        linked_invoices = linked_invoices.rows
        linked_projects = linked_projects.rows

        return {
            transaction_data,
            linked_invoices,
            linked_projects
        }

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

    generateExcelDoc = async (id, googleAccessToken) => {
        await validateId(id)

        const result = await this.model.getStatementStTransactionsForExcel(id)
        // console.log(result.rows)
        await CreateTransactionCSV(googleAccessToken, result.rows)
        return result.rows
    }
}

export default BankTransactionService