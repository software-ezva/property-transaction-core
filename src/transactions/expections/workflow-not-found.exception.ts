import { BaseNotFoundException } from '../../common/exceptions/base/base-not-found.exception';

/**
 * Exception thrown when a workflow is not found for a specific transaction
 */
export class WorkflowNotFoundException extends BaseNotFoundException {
  constructor(transactionId: string) {
    super(
      'workflow',
      `No workflow found for transaction with ID: ${transactionId}`,
    );
    this.name = 'WorkflowNotFoundException';
  }
}
