import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

/**
 * Generate a test access token
 */
export const generateTestToken = (user = {}) => {
    const defaultUser = {
        id: 1,
        uuid: 'test-uuid-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
    };

    const tokenUser = { ...defaultUser, ...user };

    return jwt.sign(
        { userId: tokenUser.id, uuid: tokenUser.uuid },
        process.env.ACCESS_TOKEN_SECRET || 'test-access-secret-key-12345',
        { expiresIn: '15m' }
    );
};

/**
 * Generate test user data
 */
export const generateTestUser = (overrides = {}) => ({
    id: 1,
    uuid: 'test-uuid-123',
    name: 'Test Admin',
    email: 'admin@test.com',
    password: '$2b$10$hashedpassword',
    role: 'admin',
    department: 'IT',
    phone: '123456789',
    is_active: true,
    ...overrides
});

/**
 * Create mock request object
 */
export const mockRequest = (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    cookies: {},
    headers: {},
    user: null,
    userId: null,
    ...overrides
});

/**
 * Create mock response object
 */
export const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

/**
 * Create mock next function
 */
export const mockNext = () => jest.fn();
