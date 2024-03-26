import LocalStorageFileHandler from "./LoalStorageFileHandler.js"
import S3StorageFileHandler from "./S3StorageFileHandler.js"

class FileHandlerSelector {
    constructor(storage){
        this.storage = storage
    }

    start() {
        if(this.storage == 's3') {
            return new S3StorageFileHandler
        }

        return new LocalStorageFileHandler
    }
}

export default FileHandlerSelector