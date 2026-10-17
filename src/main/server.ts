import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { createApp } from './app';
import { SqliteTaskRepository } from './repositories/TaskRepository';

const port = Number(process.env.PORT ?? 4000);
const dbPath = process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'tasks.db');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const app = createApp(new SqliteTaskRepository(db));

const server = app.listen(port, () => {
  console.log(`test-backend listening on http://localhost:${port} (API docs at /api-docs)`);
});

const shutdown = (): void => {
  server.close(() => {
    db.close();
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
