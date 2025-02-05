import { errors } from '@src/errors';

export class ServerErrorException extends Error {
  message = errors.serverError;
}
