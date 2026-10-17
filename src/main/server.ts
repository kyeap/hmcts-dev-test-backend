import { createApp } from './app';

const port = Number(process.env.PORT ?? 4000);

const app = createApp();

const server = app.listen(port, () => {
  console.log(`test-backend listening on http://localhost:${port}`);
});

const shutdown = (): void => {
  server.close(() => process.exit(0));
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
