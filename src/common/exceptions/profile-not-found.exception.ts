export class ProfileNotFoundException extends Error {
  constructor(profileId: string) {
    super(`Profile with ID ${profileId} not found`);
    this.name = 'ProfileNotFoundException';
  }
}
