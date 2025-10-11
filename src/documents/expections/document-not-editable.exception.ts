import { BadRequestException } from '@nestjs/common';
import { DocumentStatus } from '../../common/enums';

export class DocumentNotEditableException extends BadRequestException {
  constructor(documentId: string, currentStatus: DocumentStatus) {
    super(
      `Document ${documentId} cannot be edited in its current state: ${currentStatus}`,
    );
  }
}
