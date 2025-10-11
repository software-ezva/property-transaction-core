import { Injectable, Logger } from '@nestjs/common';
import { DocumentFile } from '../interfaces/document-file.interface';
import { FirebaseService } from './firebase.service';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly isConfigured: boolean;

  constructor(private readonly firebaseService: FirebaseService) {
    this.isConfigured = this.firebaseService.isFirebaseConfigured();

    if (!this.isConfigured) {
      this.logger.warn(
        'Firebase Storage not configured - Operations will be mocked',
      );
    } else {
      this.logger.log('Firebase Storage configured successfully');
    }
  }

  async storageTemplateDocument(
    file: DocumentFile,
    category: string,
    title: string,
  ): Promise<string> {
    this.logger.log(`Uploading template document: ${file.originalname}`);
    const filePath = `templates/${category}/${title}`;
    return await this.uploadFile(file, filePath);
  }

  async storageTransactionDocument(
    templatePath: string,
    title: string,
    transactionId: string,
  ): Promise<string> {
    this.logger.log(`Uploading transaction document: ${title}`);
    const filePath = `transactions/${transactionId}/${title}`;
    return await this.duplicateFile(templatePath, filePath);
  }

  async uploadFile(file: DocumentFile, customPath?: string): Promise<string> {
    const filePath = customPath || this.generateGenericPath(file);

    if (!this.isConfigured) {
      // Mock para desarrollo/testing
      await new Promise((resolve) => setTimeout(resolve, 100));
      return filePath;
    }

    // Firebase real - si falla, que lance el error
    const bucket = this.firebaseService.getBucket();
    const fileRef = bucket.file(filePath);

    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        originalName: file.originalname,
      },
    });

    return filePath;
  }

  private generateGenericPath(file: DocumentFile): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `files/${timestamp}_${randomId}_${sanitizedFilename}`;
  }

  async generateSecureUrl(
    filePath: string,
    expirationHours = 1,
  ): Promise<string> {
    if (!this.isConfigured) {
      // Mock URL para desarrollo/testing
      const expiry = Date.now() + expirationHours * 60 * 60 * 1000;
      return `https://mock-storage.local/files/${encodeURIComponent(filePath)}?expires=${expiry}`;
    }

    // Firebase real - si falla, que lance el error
    const bucket = this.firebaseService.getBucket();
    const file = bucket.file(filePath);

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expirationHours * 60 * 60 * 1000,
    });

    return url;
  }

  async duplicateFile(
    filePathToDuplicate: string,
    pathToPaste: string,
  ): Promise<string> {
    if (!this.isConfigured) {
      // Mock para desarrollo/testing
      await new Promise((resolve) => setTimeout(resolve, 50));
      return pathToPaste;
    }

    // Firebase real - si falla, que lance el error
    const bucket = this.firebaseService.getBucket();
    await bucket.file(filePathToDuplicate).copy(bucket.file(pathToPaste));
    return pathToPaste;
  }

  async replaceDocument(
    file: DocumentFile,
    oldFilePath: string,
  ): Promise<void> {
    if (!this.isConfigured) {
      // Mock para desarrollo/testing
      await new Promise((resolve) => setTimeout(resolve, 50));
      return;
    }

    // Firebase real - si falla, que lance el error
    const bucket = this.firebaseService.getBucket();
    const fileRef = bucket.file(oldFilePath);

    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        originalName: file.originalname,
      },
    });
  }

  async deleteFile(filePath: string): Promise<void> {
    if (!this.isConfigured) {
      // Mock para desarrollo/testing
      await new Promise((resolve) => setTimeout(resolve, 30));
      return;
    }

    // Firebase real - si falla, que lance el error
    const bucket = this.firebaseService.getBucket();
    await bucket.file(filePath).delete();
  }
}
