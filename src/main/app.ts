import express, { Express } from 'express';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { TaskRepository } from './repositories/TaskRepository';
import { rootRouter } from './routes/root';
import { tasksRouter } from './routes/tasks';
import { TaskService } from './services/TaskService';

export const createApp = (repository: TaskRepository): Express => {
  const app = express();

  app.use(helmet());
  app.use(express.json());

  app.use('/', rootRouter());
  app.use('/tasks', tasksRouter(new TaskService(repository)));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
