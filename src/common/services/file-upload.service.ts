import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  key: string;
  fileName: string;
}

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION') || 'ap-southeast-1';
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || '';

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);
      const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

      this.logger.log(`File uploaded: ${url}`);

      return {
        url,
        key,
        fileName: file.originalname,
      };
    } catch (error) {
      this.logger.error('Failed to upload file to S3', error);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`File deleted: ${key}`);
    } catch (error) {
      this.logger.error('Failed to delete file from S3', error);
      throw error;
    }
  }

  /**
   * Extract text from uploaded file (basic implementation)
   * For PDF parsing, consider using pdf-parse library
   */
  extractTextFromFile(file: Express.Multer.File): string {
    // For text-based files
    if (file.mimetype === 'text/plain') {
      return file.buffer.toString('utf-8');
    }

    // For DOCX, PDF files - return buffer content as base64 for AI processing
    // The AI will handle parsing
    return file.buffer.toString('base64');
  }
}
