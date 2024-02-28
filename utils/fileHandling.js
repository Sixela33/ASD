import fs from 'fs';
import path from 'path';

export const handleNewFileLocal = (file, allowedExtensions, basePath) => {
    const fileExtension = path.extname(file?.originalname).toLowerCase().substring(1);

    if (!allowedExtensions.includes(fileExtension)) {
        throw { message: "Invalid image file extension", status: 400 };
    }

    let folder = path.join(basePath + new Date().toISOString().split('T')[0]);

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

export const handleReplaceFile = (file, allowedExtensions, filepath, basePath) => {
    const newFile = handleNewFileLocal(file, allowedExtensions, basePath)
    if (newFile && filepath) {
        fs.unlink(filepath, (err) => {if(err) throw err})
    }

    return newFile

}