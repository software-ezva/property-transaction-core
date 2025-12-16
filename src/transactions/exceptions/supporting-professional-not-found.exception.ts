export class SupportingProfessionalNotFoundException extends Error {
  constructor(professionalId: string) {
    super(
      `El profesional con ID ${professionalId} no fue encontrado o no es un profesional de apoyo`,
    );
    this.name = 'SupportingProfessionalNotFoundException';
  }
}
