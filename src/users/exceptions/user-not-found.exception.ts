import { BaseNotFoundException } from '../../common/exceptions/base';

export class UserNotFoundException extends BaseNotFoundException {
  constructor(userId: string) {
    super('User', userId);
    this.name = 'UserNotFoundException';
  }
}
