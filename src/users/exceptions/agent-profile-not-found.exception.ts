export class AgentProfileNotFoundException extends Error {
  constructor(agentId: string) {
    super(`Agent profile with ID ${agentId} not found`);
  }
}
