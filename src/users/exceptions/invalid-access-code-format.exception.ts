export class InvalidAccessCodeFormatException extends Error {
  constructor(code: string) {
    super(
      `Invalid access code format: "${code}". Must be 3 uppercase letters followed by 3 digits (e.g., ABC123)`,
    );
  }
}
