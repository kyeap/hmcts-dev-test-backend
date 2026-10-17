import Database from 'better-sqlite3';
import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../../main/app';
import { SqliteTaskRepository } from '../../main/repositories/TaskRepository';

describe('Task API', () => {
  let db: Database.Database;
  let app: Express;

  const newTask = { title: 'Review case bundle', description: 'Check exhibits', dueDateTime: '2026-11-01T09:00:00Z' };

  beforeEach(() => {
    db = new Database(':memory:');
    app = createApp(new SqliteTaskRepository(db));
  });

  afterEach(() => db.close());

  describe('POST /tasks', () => {
    it('creates a task and returns 201 with a Location header', async () => {
      const res = await request(app).post('/tasks').send(newTask).expect(201);

      expect(res.headers.location).toBe(`/tasks/${res.body.id}`);
      expect(res.body).toMatchObject({
        title: 'Review case bundle',
        description: 'Check exhibits',
        status: 'TODO',
        dueDateTime: '2026-11-01T09:00:00.000Z',
      });
    });

    it('returns 400 with field details on validation failure', async () => {
      const res = await request(app).post('/tasks').send({ description: 'no title' }).expect(400);

      expect(res.body.message).toBe('Validation failed');
      expect(res.body.details.map((d: { field: string }) => d.field)).toEqual(
        expect.arrayContaining(['title', 'dueDateTime']),
      );
    });

    it('returns 400 for malformed JSON', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Content-Type', 'application/json')
        .send('{"title": ')
        .expect(400);

      expect(res.body.message).toBe('Malformed JSON body');
    });
  });

  it('GET /tasks returns all tasks', async () => {
    await request(app).post('/tasks').send(newTask);
    await request(app)
      .post('/tasks')
      .send({ ...newTask, title: 'Second' });

    const res = await request(app).get('/tasks').expect(200);
    expect(res.body).toHaveLength(2);
  });

  describe('GET /tasks/:id', () => {
    it('returns the task', async () => {
      const { body: created } = await request(app).post('/tasks').send(newTask);

      const res = await request(app).get(`/tasks/${created.id}`).expect(200);
      expect(res.body).toEqual(created);
    });

    it('returns 404 for an unknown id', async () => {
      const res = await request(app).get('/tasks/999').expect(404);
      expect(res.body.message).toBe('Task 999 not found');
    });

    it('returns 400 for a non-numeric id', async () => {
      await request(app).get('/tasks/abc').expect(400);
    });
  });

  describe('PATCH /tasks/:id/status', () => {
    it('updates the status', async () => {
      const { body: created } = await request(app).post('/tasks').send(newTask);

      const res = await request(app).patch(`/tasks/${created.id}/status`).send({ status: 'DONE' }).expect(200);
      expect(res.body.status).toBe('DONE');
    });

    it('returns 400 for an invalid status', async () => {
      const { body: created } = await request(app).post('/tasks').send(newTask);

      await request(app).patch(`/tasks/${created.id}/status`).send({ status: 'NOPE' }).expect(400);
    });

    it('returns 404 for an unknown id', async () => {
      await request(app).patch('/tasks/999/status').send({ status: 'DONE' }).expect(404);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('deletes the task', async () => {
      const { body: created } = await request(app).post('/tasks').send(newTask);

      await request(app).delete(`/tasks/${created.id}`).expect(204);
      await request(app).get(`/tasks/${created.id}`).expect(404);
    });

    it('returns 404 for an unknown id', async () => {
      await request(app).delete('/tasks/999').expect(404);
    });
  });

  it('returns 404 JSON for unknown routes', async () => {
    const res = await request(app).get('/nope').expect(404);
    expect(res.body.error).toBe('Not Found');
  });
});
