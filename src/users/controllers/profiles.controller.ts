import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('profiles')
@ApiTags('profiles')
export class ProfilesController {
  // This controller is intentionally empty.
  // Profile assignment endpoints have been moved to:
  // - POST /clients for client profile assignment
  // - POST /agents for agent profile assignment
  // - GET /clients for retrieving all clients
  // - GET /agents for retrieving all agents
}
