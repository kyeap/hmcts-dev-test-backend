import { NotFoundError } from '../errors/HttpError';
import { createTaskSchema, Task, taskIdSchema, updateStatusSchema } from '../models/task';
import { TaskRepository } from '../repositories/TaskRepository';

/**
 * Business logic for tasks. Validates raw input (throwing ZodError on failure)
 * and maps missing records to NotFoundError.
 */
export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  createTask(body: unknown): Task {
    return this.repository.create(createTaskSchema.parse(body));
  }

  getTask(rawId: unknown): Task {
    const id = taskIdSchema.parse(rawId);
    const task = this.repository.findById(id);
    if (!task) {
      throw new NotFoundError(`Task ${id} not found`);
    }
    return task;
  }

  getAllTasks(): Task[] {
    return this.repository.findAll();
  }

  updateStatus(rawId: unknown, body: unknown): Task {
    const id = taskIdSchema.parse(rawId);
    const { status } = updateStatusSchema.parse(body);
    const task = this.repository.updateStatus(id, status);
    if (!task) {
      throw new NotFoundError(`Task ${id} not found`);
    }
    return task;
  }

  deleteTask(rawId: unknown): void {
    const id = taskIdSchema.parse(rawId);
    if (!this.repository.delete(id)) {
      throw new NotFoundError(`Task ${id} not found`);
    }
  }
}
