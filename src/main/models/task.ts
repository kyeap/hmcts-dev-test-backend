import { z } from 'zod';

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDateTime: string;
  createdAt: string;
  updatedAt: string;
}

const statusSchema = z.enum(TASK_STATUSES, {
  error: () => `status must be one of: ${TASK_STATUSES.join(', ')}`,
});

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'title is required').max(200, 'title must be at most 200 characters'),
    description: z.string().trim().max(2000, 'description must be at most 2000 characters').nullish(),
    status: statusSchema.default('TODO'),
    dueDateTime: z.iso.datetime({
      offset: true,
      error: 'dueDateTime must be an ISO 8601 date-time, e.g. 2026-11-01T09:00:00Z',
    }),
  })
  .strict();

export const updateStatusSchema = z.object({ status: statusSchema }).strict();

export const taskIdSchema = z.coerce
  .number({ error: 'id must be a positive integer' })
  .int('id must be a positive integer')
  .positive('id must be a positive integer');

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
