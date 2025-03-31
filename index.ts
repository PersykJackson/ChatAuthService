import { config } from 'dotenv';
config();

import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { configureRoutes } from '@src/routes';
import { AppDataSource } from '@src/database/AppDataSource';

const app = express();

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());

AppDataSource.initialize()
  .then(() => AppDataSource.runMigrations())
  .then(() => {
    configureRoutes(app);
    app.listen(Number(process.env.APP_PORT));
  });
