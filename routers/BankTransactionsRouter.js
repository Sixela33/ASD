import express from 'express'
import BankTransactionController from '../controllers/BankTransactionController.js'


class BankTransactionRouter {

    constructor(){
        this.controller = new BankTransactionController()
        this.router = express.Router()
    }

    start(){
        
        this.router.post('/', this.controller.addBankTransaction)
        this.router.get('/', this.controller.getBankTransactions)
        this.router.get('/statement/:id', this.controller.getBankTransactionsByStatement)

        this.router.patch('/invoices', this.controller.linkInvoices)
        this.router.get('/invoices/:id', this.controller.getTransactionInvoices)

        return this.router
    }
    
    
}

export default BankTransactionRouter