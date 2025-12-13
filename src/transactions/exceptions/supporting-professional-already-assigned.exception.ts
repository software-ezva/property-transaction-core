export class SupportingProfessionalAlreadyAssignedException extends Error {
  constructor(professionalId: string, transactionId: string) {
    super(
      `Supporting professional with ID ${professionalId} is already assigned to transaction ${transactionId}`,
    );
    this.name = 'SupportingProfessionalAlreadyAssignedException';
  }
}
