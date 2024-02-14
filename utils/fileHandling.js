import fs from 'fs';
import path from 'path';

export const handleFileLocal = (file, allowedExtensions, basePath) => {
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
        filename = `${path.parse(file?.originalname).name.replace(/ /g, '_')}${additive}.${fileExtension}`;
        additive = `(${number})`
        number++;
    } while (fs.existsSync(path.join(folder, filename)));

    folder = path.join(folder, filename)
    fs.writeFileSync(folder, file.buffer, "binary");
    return folder
}