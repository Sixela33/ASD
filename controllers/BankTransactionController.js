import BankTransactionService from "../services/BankTransactionService.js"

class BankTransactionController {

    constructor() {
        this.service = new BankTransactionService()
    }

    addBankTransaction = async (req, res, next) => {
        try {
            const transactionData = req.body
            await this.service.addBankTransactions(transactionData)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }
    

    getBankTransactions = async (req, res, next) => {
        try {
            const {offset, orderBy, order, specificVendor, startDate, endDate, minAmount, maxAmount, code} = req.query
            const result = await this.service.getBankTransactions(offset, orderBy, order, specificVendor, startDate, endDate, minAmount, maxAmount, code)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }

    getBankTransactionsByStatement = async (req, res, next) => {
        try {
            const {id} = req.params
            const result = await this.service.getBankTransactionsByStatement(id)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }

    getSingleBankTransactionData = async (req, res, next) => {
        try {
            const {id} = req.params
            const result = await this.service.getSingleBankTransactionData(id)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }

    deleteBankTransaction = async (req, res, next) => {
        try {
            const {id} = req.params
            await this.service.deleteBankTransaction(id)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    editBankTransaction = async (req, res, next) => {
        try {
            const transactionData = req.body
            await this.service.editBankTransaction(transactionData)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    linkInvoices = async (req, res, next) => {
        try {
            const {selectedInvoicesData, selectedTransactionID} = req.body
            const result = await this.service.linkInvoices(selectedInvoicesData, selectedTransactionID)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    }

    getTransactionInvoices = async (req, res, next) => {
        try {
            const {id} = req.params
            const result = await this.service.getTransactionInvoices(id)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }
    
}

export default BankTransactionController