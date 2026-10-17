import { Router } from 'express';
import { TaskService } from '../services/TaskService';

export const tasksRouter = (service: TaskService): Router => {
  const router = Router();

  router.post('/', (req, res) => {
    const task = service.createTask(req.body);
    res.status(201).location(`${req.baseUrl}/${task.id}`).json(task);
  });

  router.get('/', (_req, res) => {
    res.json(service.getAllTasks());
  });

  router.get('/:id', (req, res) => {
    res.json(service.getTask(req.params.id));
  });

  router.patch('/:id/status', (req, res) => {
    res.json(service.updateStatus(req.params.id, req.body));
  });

  router.delete('/:id', (req, res) => {
    service.deleteTask(req.params.id);
    res.status(204).end();
  });

  return router;
};
