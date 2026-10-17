# HMCTS Dev Test Backend (Node)

Backend API for the [HMCTS DTS developer challenge](https://github.com/hmcts/dts-developer-challenge), built with
Express 5 and TypeScript.

## Getting started

Requires Node 20+ (see `.nvmrc`).

```bash
npm install
npm run start:dev        # dev server with reload on http://localhost:4000
```

## Scripts

| Script                  | Purpose                       |
| ----------------------- | ----------------------------- |
| `npm test`              | Run all tests                 |
| `npm run test:coverage` | Tests with coverage report    |
| `npm run lint`          | ESLint + Prettier check       |
| `npm run build`         | Compile TypeScript to `dist/` |
