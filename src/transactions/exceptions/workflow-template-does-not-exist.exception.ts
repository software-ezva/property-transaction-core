import { NotFoundException } from '@nestjs/common';

export class WorkflowTemplateDoesNotExistException extends NotFoundException {
  constructor() {
    super('Workflow template does not exist for this transaction type');
  }
}
