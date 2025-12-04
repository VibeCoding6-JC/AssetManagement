import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { mockRequest, mockResponse, mockNext, generateTestUser } from '../helpers/auth.js';

// Mock the models
const mockUsersModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
};

// Mock modules before importing controller
jest.unstable_mockModule('../../models/index.js', () => ({
    Users: mockUsersModel
}));

describe('Auth Controller', () => {
    let AuthController;

    beforeAll(async () => {
        // Dynamic import after mocking
        const module = await import('../../controllers/AuthController.js');
        AuthController = module;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should return 400 if email is missing', async () => {
            const req = mockRequest({ body: { password: 'password123' } });
            const res = mockResponse();

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false
                })
            );
        });

        it('should return 400 if password is missing', async () => {
            const req = mockRequest({ body: { email: 'test@test.com' } });
            const res = mockResponse();

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false
                })
            );
        });

        it('should return 401 if user not found', async () => {
            mockUsersModel.findOne.mockResolvedValue(null);

            const req = mockRequest({ 
                body: { email: 'notfound@test.com', password: 'password123' } 
            });
            const res = mockResponse();

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('Invalid')
                })
            );
        });

        it('should return 401 if user is inactive', async () => {
            const inactiveUser = generateTestUser({ is_active: false });
            mockUsersModel.findOne.mockResolvedValue(inactiveUser);

            const req = mockRequest({ 
                body: { email: 'inactive@test.com', password: 'password123' } 
            });
            const res = mockResponse();

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should return 200 with tokens on successful login', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            const testUser = {
                ...generateTestUser({ password: hashedPassword }),
                update: jest.fn().mockResolvedValue(true)
            };
            mockUsersModel.findOne.mockResolvedValue(testUser);

            const req = mockRequest({ 
                body: { email: 'admin@test.com', password: 'password123' } 
            });
            const res = mockResponse();

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        accessToken: expect.any(String),
                        user: expect.objectContaining({
                            email: 'admin@test.com'
                        })
                    })
                })
            );
            expect(res.cookie).toHaveBeenCalled();
        });
    });

    describe('logout', () => {
        it('should clear cookies and return success', async () => {
            const testUser = {
                ...generateTestUser(),
                update: jest.fn().mockResolvedValue(true)
            };
            mockUsersModel.findOne.mockResolvedValue(testUser);

            const req = mockRequest({ 
                cookies: { refreshToken: 'valid-refresh-token' } 
            });
            const res = mockResponse();

            await AuthController.logout(req, res);

            expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true
                })
            );
        });
    });

    describe('getMe', () => {
        it('should return current user data', async () => {
            const testUser = generateTestUser();
            mockUsersModel.findOne.mockResolvedValue(testUser);

            const req = mockRequest({ userId: 1 });
            const res = mockResponse();

            await AuthController.getMe(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        email: testUser.email
                    })
                })
            );
        });

        it('should return 404 if user not found', async () => {
            mockUsersModel.findOne.mockResolvedValue(null);

            const req = mockRequest({ userId: 999 });
            const res = mockResponse();

            await AuthController.getMe(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
