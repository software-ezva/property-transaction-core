import {
  Logger,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Auth0User } from '../interfaces/auth0-user.interface';
import {
  UserNotFoundException,
  BrokerProfileNotFoundException,
  BrokerNotAssignedToBrokerageException,
  BrokerageNotFoundException,
  ProfileNotFoundException,
  UserAlreadyHasAProfileException,
} from '../exceptions';

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

    // Handle domain-specific exceptions
    if (
      error instanceof UserNotFoundException ||
      error instanceof BrokerProfileNotFoundException ||
      error instanceof BrokerNotAssignedToBrokerageException ||
      error instanceof BrokerageNotFoundException ||
      error instanceof ProfileNotFoundException
    ) {
      throw new NotFoundException(error.message);
    }

    if (error instanceof UserAlreadyHasAProfileException) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    // Handle NestJS HttpExceptions
    if (error instanceof HttpException) {
      throw error;
    }

    // Default: Internal server error
    throw new HttpException(
      `Internal server error during ${operation}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
