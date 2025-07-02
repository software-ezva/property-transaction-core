import { BadRequestException } from '@nestjs/common';

export class UserIsNotRealEstateAgentException extends BadRequestException {
  constructor() {
    super('User is not a real estate agent');
  }
}
