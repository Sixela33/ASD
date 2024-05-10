import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const FILES_BASE_PATH = process.env.LOCAL_FILES_LOCATION

const FLOWER_IMAGE_PATH = path.join(FILES_BASE_PATH, '/flowerImages/');
const INVOICE_FILES_PATH = path.join(FILES_BASE_PATH, '/InvoiceFiles/');

class LocalStorageFileHandler {
    constructor () {
        if (!fs.existsSync(FLOWER_IMAGE_PATH)) {
            fs.mkdirSync(FLOWER_IMAGE_PATH, { recursive: true });
        }

        if (!fs.existsSync(INVOICE_FILES_PATH)) {
            fs.mkdirSync(INVOICE_FILES_PATH, { recursive: true });
        }

        this.basePath = process.env.LOCAL_FILES_LOCATION
    }


    handleNewFile = async (file, allowedExtensions, finalFolder) => {
        const fileExtension = path.extname(file?.originalname).toLowerCase().substring(1);

        if (!allowedExtensions.includes(fileExtension)) {
            throw { message: "Invalid image file extension", status: 400 };
        }

        let folder = path.join(this.basePath, finalFolder,  new Date().toISOString().split('T')[0]);

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        let number = 0;
        let filename
        let additive = ''

        do {
            filename = `${path.parse(file?.originalname).name.replace(/ /g, '_').replace(/[#?&]/g, '')}${additive}.${fileExtension}`;
            additive = `(${number})`
            number++;
        } while (fs.existsSync(path.join(folder, filename)))

        let buffer = file.buffer

        if(fileExtension != 'pdf'){
            buffer = await sharp(file.buffer).resize(512, 512).toBuffer() 
        }        
        
        folder = path.join(folder, filename)
        
        fs.writeFileSync(folder, buffer, "binary");
        return folder
    }

    handleReplaceFile = async (file, allowedExtensions, filepath, finalFolder) => {
        const newFile = this.handleNewFile(file, allowedExtensions, finalFolder)

        //removes old file
        if (newFile && filepath) {
            if(fs.existsSync(filepath)){
                fs.unlink(filepath, (err) => {if(err) throw err})
            }
        }

        return newFile

    }

    async processFileLocation(file, expiresIn = null) {
        return `${process.env.HOST}:${process.env.PORT}/api/${file}`
    }
}

export default LocalStorageFileHandler