import Database from 'better-sqlite3';
import { SqliteTaskRepository } from '../../main/repositories/TaskRepository';

describe('SqliteTaskRepository', () => {
  let db: Database.Database;
  let repository: SqliteTaskRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    repository = new SqliteTaskRepository(db);
  });

  afterEach(() => db.close());

  it('creates and reads back a task, normalising the due date to UTC', () => {
    const created = repository.create({
      title: 'Review case bundle',
      description: 'Check exhibits',
      status: 'TODO',
      dueDateTime: '2026-11-01T10:00:00+01:00',
    });

    expect(created).toMatchObject({
      id: 1,
      title: 'Review case bundle',
      description: 'Check exhibits',
      status: 'TODO',
      dueDateTime: '2026-11-01T09:00:00.000Z',
    });
    expect(repository.findById(created.id)).toEqual(created);
  });

  it('stores a missing description as null', () => {
    const created = repository.create({ title: 'Task', status: 'TODO', dueDateTime: '2026-11-01T09:00:00Z' });

    expect(created.description).toBeNull();
  });

  it('returns all tasks ordered by due date', () => {
    repository.create({ title: 'Later', status: 'TODO', dueDateTime: '2026-12-01T09:00:00Z' });
    repository.create({ title: 'Sooner', status: 'TODO', dueDateTime: '2026-11-01T09:00:00Z' });

    expect(repository.findAll().map((t) => t.title)).toEqual(['Sooner', 'Later']);
  });

  it('updates status and returns undefined for unknown ids', () => {
    const { id } = repository.create({ title: 'Task', status: 'TODO', dueDateTime: '2026-11-01T09:00:00Z' });

    expect(repository.updateStatus(id, 'DONE')?.status).toBe('DONE');
    expect(repository.updateStatus(999, 'DONE')).toBeUndefined();
  });

  it('deletes tasks and reports whether anything was removed', () => {
    const { id } = repository.create({ title: 'Task', status: 'TODO', dueDateTime: '2026-11-01T09:00:00Z' });

    expect(repository.delete(id)).toBe(true);
    expect(repository.findById(id)).toBeUndefined();
    expect(repository.delete(id)).toBe(false);
  });
});
