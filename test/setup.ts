// Global Jest setup for E2E tests
jest.setTimeout(30000); // Increase timeout for async DB operations

process.env.NODE_ENV = 'test'; // Set NODE_ENV to test