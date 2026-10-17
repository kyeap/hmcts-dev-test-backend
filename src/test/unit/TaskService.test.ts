import { ZodError } from 'zod';
import { NotFoundError } from '../../main/errors/HttpError';
import { CreateTaskInput, Task, TaskStatus } from '../../main/models/task';
import { TaskRepository } from '../../main/repositories/TaskRepository';
import { TaskService } from '../../main/services/TaskService';

const sampleTask: Task = {
  id: 1,
  title: 'Review case bundle',
  description: null,
  status: 'TODO',
  dueDateTime: '2026-11-01T09:00:00.000Z',
  createdAt: '2026-10-16T09:00:00.000Z',
  updatedAt: '2026-10-16T09:00:00.000Z',
};

const mockRepository = (): jest.Mocked<TaskRepository> => ({
  create: jest.fn((input: CreateTaskInput) => ({ ...sampleTask, ...input, description: input.description ?? null })),
  findById: jest.fn(),
  findAll: jest.fn(() => [sampleTask]),
  updateStatus: jest.fn(),
  delete: jest.fn(),
});

describe('TaskService', () => {
  let repository: jest.Mocked<TaskRepository>;
  let service: TaskService;

  beforeEach(() => {
    repository = mockRepository();
    service = new TaskService(repository);
  });

  describe('createTask', () => {
    it('creates a task with defaults applied', () => {
      service.createTask({ title: '  Review case bundle ', dueDateTime: '2026-11-01T09:00:00Z' });

      expect(repository.create).toHaveBeenCalledWith({
        title: 'Review case bundle',
        status: 'TODO',
        dueDateTime: '2026-11-01T09:00:00Z',
      });
    });

    it('accepts an explicit status, description and timezone offset', () => {
      service.createTask({
        title: 'Call applicant',
        description: 'Confirm hearing date',
        status: 'IN_PROGRESS',
        dueDateTime: '2026-11-01T09:00:00+01:00',
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'IN_PROGRESS', description: 'Confirm hearing date' }),
      );
    });

    it.each([
      ['missing title', { dueDateTime: '2026-11-01T09:00:00Z' }],
      ['blank title', { title: '   ', dueDateTime: '2026-11-01T09:00:00Z' }],
      ['title too long', { title: 'x'.repeat(201), dueDateTime: '2026-11-01T09:00:00Z' }],
      ['missing due date', { title: 'Task' }],
      ['date without time', { title: 'Task', dueDateTime: '2026-11-01' }],
      ['invalid date', { title: 'Task', dueDateTime: 'tomorrow' }],
      ['unknown status', { title: 'Task', dueDateTime: '2026-11-01T09:00:00Z', status: 'BLOCKED' }],
      ['unknown field', { title: 'Task', dueDateTime: '2026-11-01T09:00:00Z', priority: 'high' }],
      ['non-object body', 'just a string'],
    ])('rejects %s', (_label, body) => {
      expect(() => service.createTask(body)).toThrow(ZodError);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('getTask', () => {
    it('returns the task when found', () => {
      repository.findById.mockReturnValue(sampleTask);

      expect(service.getTask('1')).toBe(sampleTask);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('throws NotFoundError when missing', () => {
      repository.findById.mockReturnValue(undefined);

      expect(() => service.getTask('99')).toThrow(NotFoundError);
    });

    it.each(['abc', '0', '-1', '1.5'])('rejects invalid id %s', (id) => {
      expect(() => service.getTask(id)).toThrow(ZodError);
    });
  });

  it('getAllTasks returns all tasks from the repository', () => {
    expect(service.getAllTasks()).toEqual([sampleTask]);
  });

  describe('updateStatus', () => {
    it('updates the status', () => {
      const updated = { ...sampleTask, status: 'DONE' as TaskStatus };
      repository.updateStatus.mockReturnValue(updated);

      expect(service.updateStatus('1', { status: 'DONE' })).toBe(updated);
      expect(repository.updateStatus).toHaveBeenCalledWith(1, 'DONE');
    });

    it('rejects an invalid status', () => {
      expect(() => service.updateStatus('1', { status: 'FINISHED' })).toThrow(ZodError);
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('throws NotFoundError when missing', () => {
      repository.updateStatus.mockReturnValue(undefined);

      expect(() => service.updateStatus('99', { status: 'DONE' })).toThrow(NotFoundError);
    });
  });

  describe('deleteTask', () => {
    it('deletes an existing task', () => {
      repository.delete.mockReturnValue(true);

      expect(() => service.deleteTask('1')).not.toThrow();
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('throws NotFoundError when missing', () => {
      repository.delete.mockReturnValue(false);

      expect(() => service.deleteTask('99')).toThrow(NotFoundError);
    });
  });
});
