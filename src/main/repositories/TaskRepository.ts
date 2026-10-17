import Database from 'better-sqlite3';
import { CreateTaskInput, Task, TaskStatus } from '../models/task';

export interface TaskRepository {
  create(input: CreateTaskInput): Task;
  findById(id: number): Task | undefined;
  findAll(): Task[];
  updateStatus(id: number, status: TaskStatus): Task | undefined;
  delete(id: number): boolean;
}

interface TaskRow {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date_time: string;
  created_at: string;
  updated_at: string;
}

const toTask = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  description: row.description,
  status: row.status,
  dueDateTime: row.due_date_time,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class SqliteTaskRepository implements TaskRepository {
  constructor(private readonly db: Database.Database) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        title         TEXT    NOT NULL,
        description   TEXT,
        status        TEXT    NOT NULL CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
        due_date_time TEXT    NOT NULL,
        created_at    TEXT    NOT NULL,
        updated_at    TEXT    NOT NULL
      )
    `);
  }

  create(input: CreateTaskInput): Task {
    const now = new Date().toISOString();
    const result = this.db
      .prepare(
        `INSERT INTO tasks (title, description, status, due_date_time, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(input.title, input.description ?? null, input.status, new Date(input.dueDateTime).toISOString(), now, now);
    return this.findById(Number(result.lastInsertRowid)) as Task;
  }

  findById(id: number): Task | undefined {
    const row = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
    return row && toTask(row);
  }

  findAll(): Task[] {
    const rows = this.db.prepare('SELECT * FROM tasks ORDER BY due_date_time ASC, id ASC').all() as TaskRow[];
    return rows.map(toTask);
  }

  updateStatus(id: number, status: TaskStatus): Task | undefined {
    const result = this.db
      .prepare('UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?')
      .run(status, new Date().toISOString(), id);
    return result.changes ? this.findById(id) : undefined;
  }

  delete(id: number): boolean {
    return this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id).changes > 0;
  }
}
