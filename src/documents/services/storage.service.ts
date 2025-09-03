import { Injectable, Logger } from '@nestjs/common';

interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  async storageTemplateDocument(
    file: UploadedFile,
    category: string,
    title: string,
  ): Promise<string> {
    this.logger.log(
      `Uploading template document to Firebase: ${file.originalname}`,
    );

    // Generar path estructurado: templates/category/title_timestamp_random_filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9.-]/g, '_');
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `templates/${category}/${sanitizedTitle}_${timestamp}_${randomId}_${sanitizedFilename}`;

    // Llamar a uploadFile con el path generado
    return await this.uploadFile(file, filePath);
  }

  async uploadFile(file: UploadedFile, customPath?: string): Promise<string> {
    this.logger.log(`Uploading file to Firebase: ${file.originalname}`);

    // Si no se proporciona un path personalizado, generar uno genérico
    const filePath = customPath || this.generateGenericPath(file);

    // En producción con Firebase:
    // const bucket = getStorage().bucket();
    // const fileRef = bucket.file(filePath);
    //
    // await fileRef.save(file.buffer, {
    //   metadata: {
    //     contentType: file.mimetype,
    //   },
    // });
    //
    // // Hacer el archivo privado (no público)
    // await fileRef.makePrivate();
    //
    // return filePath; // Retornar solo el path, no la URL

    // Mock implementation
    this.logger.log(`File uploaded to Firebase with path: ${filePath}`);
    await new Promise((resolve) => setTimeout(resolve, 100));

    return filePath; // Retorna el path del archivo, no la URL
  }

  private generateGenericPath(file: UploadedFile): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `files/${timestamp}_${randomId}_${sanitizedFilename}`;
  }

  generateSecureUrl(filePath: string, expirationHours = 1): string {
    this.logger.log(`Generating secure URL for file: ${filePath}`);

    // En producción con Firebase:
    // const bucket = getStorage().bucket();
    // const file = bucket.file(filePath);
    //
    // const [url] = await file.getSignedUrl({
    //   action: 'read',
    //   expires: Date.now() + (expirationHours * 60 * 60 * 1000),
    // });
    //
    // return url;

    // Mock implementation
    const expiry = Date.now() + expirationHours * 60 * 60 * 1000;
    const mockSecureUrl = `https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/${encodeURIComponent(filePath)}?alt=media&token=secure-token-${expiry}`;

    this.logger.log(
      `Generated secure URL expires in ${expirationHours} hour(s)`,
    );
    return mockSecureUrl;
  }

  async duplicateFile(originalPath: string): Promise<string> {
    this.logger.log(`Duplicating file from path: ${originalPath}`);

    // Generar nuevo path para el archivo duplicado
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const newPath = originalPath.replace(
      '/templates/',
      `/duplicates/${timestamp}_${randomId}_`,
    );

    // En producción con Firebase:
    // const bucket = getStorage().bucket();
    // const sourceFile = bucket.file(originalPath);
    // const destFile = bucket.file(newPath);
    //
    // await sourceFile.copy(destFile);
    // await destFile.makePrivate();

    // Mock implementation
    this.logger.log(`File duplicated to: ${newPath}`);
    await new Promise((resolve) => setTimeout(resolve, 50));

    return newPath;
  }

  async deleteFile(filePath: string): Promise<void> {
    this.logger.log(`Deleting file from Firebase: ${filePath}`);

    // En producción con Firebase:
    // const bucket = getStorage().bucket();
    // const file = bucket.file(filePath);
    //
    // try {
    //   await file.delete();
    //   this.logger.log(`File deleted successfully: ${filePath}`);
    // } catch (error) {
    //   // Si el archivo no existe, no es un error crítico
    //   if (error.code === 404) {
    //     this.logger.warn(`File not found for deletion: ${filePath}`);
    //   } else {
    //     this.logger.error(`Error deleting file: ${filePath}`, error);
    //     throw error;
    //   }
    // }

    // Mock implementation
    this.logger.log(`File deleted from Firebase: ${filePath}`);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  async replaceTemplateDocument(
    file: UploadedFile,
    oldFilePath: string,
  ): Promise<void> {
    this.logger.log(
      `Replacing template document: ${oldFilePath} with new file: ${file.originalname}`,
    );

    await this.deleteFile(oldFilePath);

    await this.uploadFile(file, oldFilePath);

    this.logger.log(`File replacement completed at path: ${oldFilePath}`);
  }
}
