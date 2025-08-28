export class StorageService {
  duplicateFile(originalUrl: string): Promise<string> {
    //debe ser async
    console.log(`Duplicating file from URL: ${originalUrl}`);
    // Simulate file duplication and return the new URL
    const newUrl = originalUrl.replace('/original/', '/duplicate/');
    console.log(`File duplicated to: ${newUrl}`);
    return Promise.resolve(newUrl);
  }
}
