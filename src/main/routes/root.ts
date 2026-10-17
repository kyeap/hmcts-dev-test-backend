import { Router } from 'express';

export const rootRouter = (): Router => {
  const router = Router();

  router.get('/', (_req, res) => {
    res.type('text/plain').send('Welcome to test-backend');
  });

  router.get('/health', (_req, res) => {
    res.json({ status: 'UP' });
  });

  return router;
};
