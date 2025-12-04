// Global test setup
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { jest } from '@jest/globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '../.env.test'), quiet: true });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(30000);

// Clean up after all tests
afterAll(async () => {
    // Close any open handles
    await new Promise(resolve => setTimeout(resolve, 500));
});
