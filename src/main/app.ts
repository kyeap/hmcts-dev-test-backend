import express, { Express } from 'express';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { rootRouter } from './routes/root';

export const createApp = (): Express => {
  const app = express();

  app.use(helmet());
  app.use(express.json());

  app.use('/', rootRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
