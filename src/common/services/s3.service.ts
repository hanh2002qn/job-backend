import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

interface MulterFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || 'mock',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || 'mock',
      },
    });
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET') || 'mock-bucket';
  }

  async uploadFile(file: MulterFile, folder: string = 'uploads'): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${folder}/${uuidv4()}${fileExtension}`;

    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read' as ObjectCannedACL,
        },
      });

      await upload.done();

      // Return the public URL
      const region = this.configService.get<string>('AWS_REGION');
      return `https://${this.bucketName}.s3.${region}.amazonaws.com/${fileName}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error uploading file to S3: ${message}`);
      throw error;
    }
  }

  async uploadPublicFile(
    buffer: Buffer,
    fileName: string,
    mimetype: string,
    folder: string = 'public',
  ): Promise<string> {
    const key = `${folder}/${uuidv4()}-${fileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
        ACL: 'public-read' as ObjectCannedACL,
      });

      await this.s3Client.send(command);

      const region = this.configService.get<string>('AWS_REGION');
      return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error uploading public file to S3: ${message}`);
      throw error;
    }
  }
}
