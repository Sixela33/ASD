import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import sharp from "sharp";
import path from 'path';
import crypto from 'crypto'

class S3FileHandler {
  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;

    this.s3 = new S3Client({
        region: process.env.AWS_S3_BUCKET_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      })
    }

  async handleNewFile(file, allowedExtensions, finalFolder) {
    const fileExtension = path.extname(file?.originalname).toLowerCase().substring(1);

    if (!allowedExtensions.includes(fileExtension)) {
      throw { message: "Invalid file extension", status: 400 };
    }

    const folder = new Date().toISOString().split('T')[0];
    const filename = crypto.randomBytes(32).toString('hex');
    let buffer = file.buffer

    if(fileExtension != 'pdf'){
      buffer = await sharp(file.buffer).resize(512, 512).toBuffer() 
    }
    
    const params = {
      Bucket: this.bucketName,
      Key: `${finalFolder}/${folder}/${filename}`,
      Body: buffer,
      ContentType: file.mimetype
    }

    await this.s3.send(new PutObjectCommand(params));

    return `${finalFolder}/${folder}/${filename}`;
  }

  async handleReplaceFile(file, allowedExtensions, filepath, finalFolder) {
    const newFileKey = await this.handleNewFile(file, allowedExtensions, finalFolder);

    // Remove old file
    if (!newFileKey) {
        throw {message: 'Error loading file', status: 500}
    }
    
    if(filepath) {
      const params = {
        Bucket: this.bucketName,
        Key: filepath,
      };
      
      await this.s3.send(new DeleteObjectCommand(params))
    }

    return newFileKey;
  }

  async processFileLocation(file, expiresIn = 120) {
    if(!file) return file

    const params = {
      Bucket: this.bucketName,
      Key: file
    }
  
    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(this.s3, command, { expiresIn: expiresIn });
    return url
  }
}

export default S3FileHandler;
