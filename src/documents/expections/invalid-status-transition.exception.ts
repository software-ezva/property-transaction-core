import { DocumentStatus } from '../../common/enums';

export class InvalidStatusTransitionException extends Error {
  constructor(
    fromStatus: DocumentStatus,
    toStatus: DocumentStatus,
    message?: string,
  ) {
    super(
      message ||
        `Invalid status transition from '${fromStatus}' to '${toStatus}'.`,
    );
  }
}
