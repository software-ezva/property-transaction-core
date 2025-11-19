import { NotFoundException } from '@nestjs/common';

export class RealEstateAgentProfileNotFoundException extends NotFoundException {
  constructor(agentId: string) {
    super(`Real estate agent profile with ID ${agentId} not found`);
  }
}
