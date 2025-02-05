import { errors } from '@src/errors';

export class UnauthorizedException extends Error {
  message = errors.unauthorized;
}
