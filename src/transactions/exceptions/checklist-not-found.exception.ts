import { BaseNotFoundException } from '../../common/exceptions/base/base-not-found.exception';

export class ChecklistNotFoundException extends BaseNotFoundException {
  constructor(checklistId: string) {
    super('Checklist', checklistId);
    this.name = 'ChecklistNotFoundException';
  }
}
