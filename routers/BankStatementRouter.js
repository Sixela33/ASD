import express from 'express'
import multer from "multer"
import StatementController from '../controllers/StatementController.js'

class BankStatementRouter {

    constructor(fileStorage){
        this.controller = new StatementController(fileStorage)
        this.router = express.Router()
        const storage = multer.memoryStorage()
        this.uploads = multer({storage: storage})
    }

    start(){
        
        // Upload statements
        this.router.post('/', this.uploads.single('statementFile'), this.controller.addStatement)
        this.router.patch('/', this.uploads.single('statementFile'), this.controller.editStatement)

        this.router.get('/', this.controller.getStatements)
        this.router.get('/byID/:id', this.controller.getStatementDataByID)
        return this.router
    }
    
}


export default BankStatementRouter