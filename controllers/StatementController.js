import StatementService from "../services/StatementService.js"

class StatementController {

    constructor(fileStorage) {
        this.service = new StatementService(fileStorage)
    }

    addStatement = async (req, res, next) => {
        try {
            const file = req.file
            const {statementData} = req.body
            const creatorid = req.user.user.userid
            const response = await this.service.addStatement(statementData, file, creatorid)
            req.logger.info(`[NEW STATEMENT] ${req.user.user.email} ID: ${JSON.stringify(response)}, DATA: ${statementData}`)
            res.json(response)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }  
    
    editStatement = async (req, res, next) => {
        try {
            const file = req.file
            const {statementData} = req.body
            const editorID = req.user.user.userid
            const response = await this.service.editStatement(statementData, file, editorID)
            req.logger.info(`[STATEMENT EDIT] ${req.user.user.email}, DATA: ${statementData}`)
            res.json(response)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }  

    getStatements = async (req, res, next) => {
        try {
            const {offset, orderBy, order, specificVendor, startDate, endDate} = req.query
            const response = await this.service.getStatements(offset, orderBy, order, specificVendor, startDate, endDate)
            res.json(response)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    getStatementDataByID = async (req, res, next) => {
        try {
            const {id} = req.params
            const response = await this.service.getStatementDataByID(id)
            res.json(response)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
    
}

export default StatementController