export class UserAlreadyHasAProfileException extends Error {
  constructor(userId?: string, profileType?: string) {
    super(`User ${userId} already has a profile of type ${profileType}`);
    this.name = 'UserAlreadyHasAProfileException';
  }
}
