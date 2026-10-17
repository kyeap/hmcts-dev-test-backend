import express, { Express } from 'express';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { TaskRepository } from './repositories/TaskRepository';
import { rootRouter } from './routes/root';
import { tasksRouter } from './routes/tasks';
import { TaskService } from './services/TaskService';

export const createApp = (repository: TaskRepository): Express => {
  const app = express();
  const openApiDoc = YAML.parse(fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8'));

  app.use(helmet());
  app.use(express.json());

  app.use('/', rootRouter());
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));
  app.get('/openapi.json', (_req, res) => {
    res.json(openApiDoc);
  });
  app.use('/tasks', tasksRouter(new TaskService(repository)));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
