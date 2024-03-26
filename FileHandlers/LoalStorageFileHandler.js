import fs from 'fs';
import path from 'path';

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


handleNewFile = async (file, allowedExtensions) => {
    const fileExtension = path.extname(file?.originalname).toLowerCase().substring(1);

    if (!allowedExtensions.includes(fileExtension)) {
        throw { message: "Invalid image file extension", status: 400 };
    }

    let folder = path.join(this.basePath + new Date().toISOString().split('T')[0]);

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
    } while (fs.existsSync(path.join(folder, filename)));

    folder = path.join(folder, filename)
    fs.writeFileSync(folder, file.buffer, "binary");
    return folder
}

handleReplaceFile = async (file, allowedExtensions, filepath) => {
    const newFile = this.handleNewFile(file, allowedExtensions)

    //removes old file
    if (newFile && filepath) {
        fs.unlink(filepath, (err) => {if(err) throw err})
    }

    return newFile

    }
}

export default LocalStorageFileHandler