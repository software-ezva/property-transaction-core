import { InternalServerErrorException } from '@nestjs/common';

export class ItemCreationException extends InternalServerErrorException {
  constructor(description: string, originalError?: string) {
    super(
      `Failed to create item "${description}". ${originalError || ''}`.trim(),
    );
  }
}
