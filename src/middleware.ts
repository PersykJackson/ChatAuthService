import { Request, Response } from 'express-serve-static-core';
import { IncomingHttpHeaders } from 'http';
import { ZodObject, ZodRawShape } from 'zod';
import { errors } from '@src/errors';

function createMiddleware(middleware: (request: Request, response: Response) => boolean) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const action = descriptor.value;

    descriptor.value = function (request: Request, response: Response) {
      if (middleware(request, response)) {
        action.call(this, request, response);
      }
    };

    return descriptor;
  };
}

export const dataValidationMiddleware = <T extends ZodRawShape>(schema: ZodObject<T>) =>
  createMiddleware(function (request, response) {
    const validationResult = schema.safeParse(request.body);

    if (!validationResult.success) {
      response.status(400).send(errors.dataValidation);
    }

    return validationResult.success;
  });

export const authHeaderCheckMiddleware = (header: keyof IncomingHttpHeaders) =>
  createMiddleware(function (request, response) {
    const validationResult = !!request.headers[header];

    if (!validationResult) {
      response.status(401).send(errors.unauthorized);
    }

    return validationResult;
  });
