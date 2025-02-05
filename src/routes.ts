import { Express } from 'express';
import { AuthController } from '@src/Controllers/AuthController';

export const configureRoutes = (app: Express) => {
  const controller = new AuthController();

  app.post('/registration', controller.register.bind(controller));
  app.post('/login', controller.login.bind(controller));
  app.post('/refresh', controller.refresh.bind(controller));
  app.all('/check', controller.check.bind(controller));
};
