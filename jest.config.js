module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/test'],
  collectCoverageFrom: ['src/main/**/*.ts', '!src/main/server.ts'],
};
