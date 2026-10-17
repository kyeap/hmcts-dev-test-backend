import request from 'supertest';
import { createApp } from '../../main/app';

describe('Root routes', () => {
  const app = createApp();

  it('GET / returns the welcome message', async () => {
    const res = await request(app).get('/').expect(200);
    expect(res.text).toMatch(/^Welcome/);
  });

  it('GET /health reports UP', async () => {
    await request(app).get('/health').expect(200, { status: 'UP' });
  });
});
