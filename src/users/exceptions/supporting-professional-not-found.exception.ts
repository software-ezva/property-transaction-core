export class SupportingProfessionalNotFoundException extends Error {
  constructor(professionalId: string) {
    super(`Supporting professional with ID ${professionalId} not found`);
  }
}
