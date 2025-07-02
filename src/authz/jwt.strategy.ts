import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import * as dotenv from 'dotenv';
import { Auth0User } from '../users/interfaces/auth0-user.interface';

dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const config = {
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.AUTH0_ISSUER_URL}.well-known/jwks.json`,
        handleSigningKeyError: (err, cb) => {
          console.error('JWKS Error:', err);
          cb(err);
        },
      }),

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `${process.env.AUTH0_ISSUER_URL}`,
      algorithms: ['RS256'],
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super(config);
  }
  validate(payload: Auth0User): Auth0User {
    // Verify that the payload has the required fields
    if (!payload.sub) {
      throw new Error('Invalid token: missing sub');
    }

    // Map the payload to Auth0User interface
    const auth0User = {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
    };

    return auth0User;
  }
}
