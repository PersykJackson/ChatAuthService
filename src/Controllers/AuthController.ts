import { Request, Response } from 'express-serve-static-core';
import { z } from 'zod';
import { authHeaderCheckMiddleware, dataValidationMiddleware } from '@src/middleware';
import { AuthModel } from '@src/Models/AuthModel';
import { User, Auth } from '@src/schemas';
import { UnauthorizedException } from '@src/Exceptions/UnauthorizedException';
import { ServerErrorException } from '@src/Exceptions/ServerErrorException';

const Login = User.pick({ email: true, password: true });

type AuthResponse = z.infer<typeof Auth> | string;

export class AuthController {
  private authModel: AuthModel;

  constructor() {
    this.authModel = new AuthModel();
  }

  private handleError(response: Response, error: unknown) {
    if (error instanceof UnauthorizedException) {
      response.status(401).send(error.message);
    } else if (error instanceof ServerErrorException) {
      response.status(500).send(error.message);
      console.error(error);
    } else {
      response.status(500).send();
      console.error('Critical error: ', error);
    }
  }

  @dataValidationMiddleware(User)
  public register(request: Request<object, string, z.infer<typeof User>>, response: Response<string>) {
    this.authModel
      .createUser(request.body)
      .then(result => {
        if (result) {
          response.status(201).send();
        }
      })
      .catch(reason => this.handleError(response, reason));
  }

  @dataValidationMiddleware(Login)
  public login(request: Request<object, AuthResponse, z.infer<typeof Login>>, response: Response<AuthResponse>) {
    this.authModel
      .loginUser(request.body.email, request.body.password)
      .then(tokens => {
        response.status(200).send(tokens);
      })
      .catch(reason => this.handleError(response, reason));
  }

  @dataValidationMiddleware(Auth.pick({ refreshToken: true }))
  public refresh(
    request: Request<object, AuthResponse, Pick<z.infer<typeof Auth>, 'refreshToken'>>,
    response: Response<AuthResponse>,
  ) {
    this.authModel
      .refreshAuth(request.body.refreshToken)
      .then(tokens => {
        response.status(200).send(tokens);
      })
      .catch(reason => this.handleError(response, reason));
  }

  @authHeaderCheckMiddleware('authorization')
  public check(request: Request, response: Response<void>) {
    if (this.authModel.validateAuth(request.header('authorization')!)) {
      response.status(200).send();
    } else {
      response.status(401).send();
    }
  }
}
