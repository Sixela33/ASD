import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import path from 'path';
import crypto from 'crypto'

class S3FileHandler {
  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
    this.region = process.env.AWS_S3_BUCKET_REGION
    this.accessKeyId = process.env.AWS_ACCESS_KEY
    this.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

    this.s3 = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey
        }
      })
    }

  async handleNewFile(file, allowedExtensions) {
    const fileExtension = path.extname(file?.originalname).toLowerCase().substring(1);

    if (!allowedExtensions.includes(fileExtension)) {
      throw { message: "Invalid file extension", status: 400 };
    }

    const folder = new Date().toISOString().split('T')[0];
    const filename = crypto.randomBytes(32).toString('hex');

    const params = {
      Bucket: this.bucketName,
      Key: `${folder}/${filename}`,
      Body: file.buffer,
      ContentType: file.mimetype
    }

    await this.s3.send(new PutObjectCommand(params));

    return `${folder}/${filename}`;
  }

  async getObjectSignedUrl(key) {
    const params = {
      Bucket: this.bucketName,
      Key: key
    }
  
    const command = new GetObjectCommand(params);
    const seconds = 60
    const url = await getSignedUrl(s3, command, { expiresIn: seconds });
  
    return url
  }

  async handleReplaceFile(file, allowedExtensions, filepath) {
    const newFileKey = await this.handleNewFile(file, allowedExtensions);

    // Remove old file
    if (!newFileKey) {
        throw {message: 'Error loading file', status: 500}
    }
    
    const oldKey = filepath;
    await this.s3.deleteObject({ Bucket: this.bucketName, Key: oldKey }).promise();

    return newFileKey;
  }
}

export default S3FileHandler;
