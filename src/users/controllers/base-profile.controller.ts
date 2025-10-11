import { Logger, HttpException, HttpStatus } from '@nestjs/common';
import {
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Auth0User } from '../interfaces/auth0-user.interface';

interface AuthenticatedRequest extends Request {
  user: Auth0User;
}

@ApiUnauthorizedResponse({
  description: 'User not authenticated or authorization failed',
})
@ApiInternalServerErrorResponse({
  description: 'Internal server error',
})
export abstract class BaseProfileController {
  protected readonly logger = new Logger(this.constructor.name);

  protected validateAuthentication(req: AuthenticatedRequest): void {
    if (!req.user) {
      this.logger.warn('User not authenticated in request');
      throw new HttpException(
        'User not authenticated',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  protected handleError(
    error: unknown,
    operation: string,
    userId?: string,
  ): never {
    const userInfo = userId ? ` for user: ${userId}` : '';
    this.logger.error(
      `Failed to ${operation}${userInfo}`,
      error instanceof Error ? error.stack : String(error),
    );

    if (error instanceof HttpException) {
      throw error;
    }

    throw new HttpException(
      `Internal server error during ${operation}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
