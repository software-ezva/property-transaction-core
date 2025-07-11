export class UserNotFoundException extends Error {
  constructor(identifier: string, type: 'id' | 'auth0Id' = 'id') {
    super(
      `User with ${type === 'id' ? 'ID' : 'Auth0 ID'} ${identifier} not found`,
    );
    this.name = 'UserNotFoundException';
  }
}
