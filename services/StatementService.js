import ModelPostgres from "../model/DAO/ModelPostgres.js"
import FileHandlerSelector from "../FileHandlers/FileHandlerSelector.js";
import { validateStatement } from "./Validations/StatementValidations.js";

const ALLOWED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'pdf'];

const STATEMENT_FILES_PATH = 'StatementFiles'

class StatementService {

    constructor(fileStorage) {
        this.model = new ModelPostgres()
        
        this.fileHandler = new FileHandlerSelector(fileStorage).start()
    }

    addStatement = async (statementData, file, updaterID) => {
        statementData = JSON.parse(statementData)

        await validateStatement(statementData)

        let fileLocation = statementData.fileLocation

        if (file){
            fileLocation = await this.fileHandler.handleNewFile(file, ALLOWED_IMAGE_EXTENSIONS, STATEMENT_FILES_PATH, false)
        }

        if(!fileLocation) {
            throw {message: "A file is required to load an statement", status: 400}
        }

        const response = await this.model.addStatement(statementData, fileLocation, updaterID)

        response.fileLocation = await this.fileHandler.processFileLocation(response.fileLocation)
        return response
    }

    editStatement = async (statementData, file) => {
        statementData = JSON.parse(statementData)
        console.log(statementData, file)
        let newFileLoc = await this.model.getStatementFileLocation(statementData.statementid)
        console.log(newFileLoc)
        
        if(newFileLoc){
            newFileLoc = newFileLoc.filelocation
        }

        if (file) {
            newFileLoc = await this.fileHandler.handleReplaceFile(file, ALLOWED_IMAGE_EXTENSIONS, newFileLoc, STATEMENT_FILES_PATH)
        } 

        if(!newFileLoc) throw {}

        const response = await this.model.editStatement(statementData, newFileLoc)
        return response
    }

    getStatements = async (offset, orderBy, order, specificVendor, startDate, endDate) => {
        const response = await this.model.getStatements(offset, orderBy, order, specificVendor, startDate, endDate)
        return response.rows
    }

    getStatementDataByID = async (id) => {
        const response = await this.model.getStatementDataByID(id)
        if (response?.filelocation){
            response.filelocation = await this.fileHandler.processFileLocation(response.filelocation)
        }
        return response
    }
}

export default StatementService