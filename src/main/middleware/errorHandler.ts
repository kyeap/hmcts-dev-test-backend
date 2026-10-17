import { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../errors/HttpError';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ status: 404, error: 'Not Found', message: `No route for ${req.method} ${req.path}` });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      details: err.issues.map((issue) => ({ field: issue.path.join('.') || null, message: issue.message })),
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ status: err.status, error: err.name, message: err.message, details: err.details });
    return;
  }

  // Malformed JSON body from express.json()
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ status: 400, error: 'Bad Request', message: 'Malformed JSON body' });
    return;
  }

  console.error(err);
  res.status(500).json({ status: 500, error: 'Internal Server Error', message: 'An unexpected error occurred' });
};
