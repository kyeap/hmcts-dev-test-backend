import Database from 'better-sqlite3';
import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../../main/app';
import { SqliteTaskRepository } from '../../main/repositories/TaskRepository';

describe('Root routes', () => {
  let db: Database.Database;
  let app: Express;

  beforeEach(() => {
    db = new Database(':memory:');
    app = createApp(new SqliteTaskRepository(db));
  });

  afterEach(() => db.close());

  it('GET / returns the welcome message', async () => {
    const res = await request(app).get('/').expect(200);
    expect(res.text).toMatch(/^Welcome/);
  });

  it('GET /health reports UP', async () => {
    await request(app).get('/health').expect(200, { status: 'UP' });
  });
});
