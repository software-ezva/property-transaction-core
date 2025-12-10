import { InternalServerErrorException } from '@nestjs/common';

export class ChecklistCreationException extends InternalServerErrorException {
  constructor(name: string, originalError?: string) {
    super(
      `Failed to create checklist "${name}". ${originalError || ''}`.trim(),
    );
  }
}
