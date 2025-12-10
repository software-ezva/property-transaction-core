export class SupportingProfessionalAlreadyAssignedToTransactionException extends Error {
  constructor() {
    super('Supporting professional is already assigned to this transaction.');
  }
}
