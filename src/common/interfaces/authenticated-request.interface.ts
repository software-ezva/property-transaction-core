import { Request } from 'express';
import { Auth0User } from '../../users/interfaces/auth0-user.interface';

export interface AuthenticatedRequest extends Request {
  user: Auth0User;
}
