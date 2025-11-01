/**
 * Utility class for generating and validating brokerage access codes
 */
export class AccessCodeGenerator {
  /**
   * Generates a random 6-character access code in format ABC123
   * First 3 characters are uppercase letters (A-Z)
   * Last 3 characters are digits (0-9)
   *
   * @returns A unique access code string
   * @example
   * const code = AccessCodeGenerator.generate();
   * // Returns something like: "XYZ789"
   */
  static generate(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';

    let code = '';

    // Generate 3 random uppercase letters
    for (let i = 0; i < 3; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    // Generate 3 random digits
    for (let i = 0; i < 3; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }

    return code;
  }

  /**
   * Validates if the access code matches the expected format
   * Must be exactly 6 characters: 3 uppercase letters followed by 3 digits
   *
   * @param code - The access code to validate
   * @returns true if the code is valid, false otherwise
   * @example
   * AccessCodeGenerator.isValid("ABC123"); // true
   * AccessCodeGenerator.isValid("abc123"); // false
   * AccessCodeGenerator.isValid("AB1234"); // false
   */
  static isValid(code: string): boolean {
    const pattern = /^[A-Z]{3}\d{3}$/;
    return pattern.test(code);
  }
}
