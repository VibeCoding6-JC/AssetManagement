import { jest } from '@jest/globals';
import { mockRequest, mockResponse, generateTestUser } from '../helpers/auth.js';

// Mock the models
const mockUsersModel = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
};

const mockAssetsModel = {
    findAll: jest.fn()
};

// Mock modules
jest.unstable_mockModule('../../models/index.js', () => ({
    Users: mockUsersModel,
    Assets: mockAssetsModel
}));

describe('User Controller', () => {
    let UserController;

    beforeAll(async () => {
        const module = await import('../../controllers/UserController.js');
        UserController = module;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getUsers', () => {
        it('should return paginated users list', async () => {
            const mockUsers = [
                generateTestUser({ id: 1, email: 'user1@test.com' }),
                generateTestUser({ id: 2, email: 'user2@test.com' })
            ];

            mockUsersModel.findAndCountAll.mockResolvedValue({
                count: 2,
                rows: mockUsers
            });

            const req = mockRequest({ query: { page: 1, limit: 10 } });
            const res = mockResponse();

            await UserController.getUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        users: expect.any(Array),
                        pagination: expect.any(Object)
                    })
                })
            );
        });

        it('should filter users by role', async () => {
            mockUsersModel.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [generateTestUser({ role: 'admin' })]
            });

            const req = mockRequest({ query: { role: 'admin' } });
            const res = mockResponse();

            await UserController.getUsers(req, res);

            expect(mockUsersModel.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        role: 'admin'
                    })
                })
            );
        });

        it('should search users by name or email', async () => {
            mockUsersModel.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [generateTestUser()]
            });

            const req = mockRequest({ query: { search: 'admin' } });
            const res = mockResponse();

            await UserController.getUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getUserById', () => {
        it('should return user by UUID', async () => {
            const testUser = generateTestUser();
            mockUsersModel.findOne.mockResolvedValue(testUser);

            const req = mockRequest({ params: { id: 'test-uuid-123' } });
            const res = mockResponse();

            await UserController.getUserById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        uuid: testUser.uuid
                    })
                })
            );
        });

        it('should return 404 if user not found', async () => {
            mockUsersModel.findOne.mockResolvedValue(null);

            const req = mockRequest({ params: { id: 'non-existent-uuid' } });
            const res = mockResponse();

            await UserController.getUserById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('createUser', () => {
        it('should create a new user', async () => {
            const newUser = generateTestUser({ id: 3 });
            mockUsersModel.findOne.mockResolvedValue(null);
            mockUsersModel.create.mockResolvedValue(newUser);

            const req = mockRequest({
                body: {
                    name: 'New User',
                    email: 'new@test.com',
                    role: 'employee',
                    department: 'IT'
                }
            });
            const res = mockResponse();

            await UserController.createUser(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true
                })
            );
        });

        it('should return 400 if email already exists', async () => {
            mockUsersModel.findOne.mockResolvedValue(generateTestUser());

            const req = mockRequest({
                body: {
                    name: 'Duplicate User',
                    email: 'existing@test.com',
                    role: 'employee'
                }
            });
            const res = mockResponse();

            await UserController.createUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('already')
                })
            );
        });

        it('should return 400 if required fields are missing', async () => {
            const req = mockRequest({ body: { name: 'Incomplete User' } });
            const res = mockResponse();

            await UserController.createUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('updateUser', () => {
        it('should update user successfully', async () => {
            const testUser = {
                ...generateTestUser(),
                update: jest.fn().mockResolvedValue(true)
            };
            mockUsersModel.findOne.mockResolvedValue(testUser);

            const req = mockRequest({
                params: { id: 'test-uuid-123' },
                body: { name: 'Updated Name' }
            });
            const res = mockResponse();

            await UserController.updateUser(req, res);

            expect(testUser.update).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if user not found', async () => {
            mockUsersModel.findOne.mockResolvedValue(null);

            const req = mockRequest({
                params: { id: 'non-existent' },
                body: { name: 'Updated Name' }
            });
            const res = mockResponse();

            await UserController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteUser', () => {
        it('should delete user successfully', async () => {
            const testUser = {
                ...generateTestUser(),
                destroy: jest.fn().mockResolvedValue(true)
            };
            mockUsersModel.findOne.mockResolvedValue(testUser);

            const req = mockRequest({ params: { id: 'test-uuid-123' } });
            const res = mockResponse();

            await UserController.deleteUser(req, res);

            expect(testUser.destroy).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getUserAssets', () => {
        it('should return assets held by user', async () => {
            const testUser = generateTestUser();
            mockUsersModel.findOne.mockResolvedValue(testUser);
            mockAssetsModel.findAll.mockResolvedValue([
                { id: 1, name: 'Laptop 1', asset_tag: 'AST-001' },
                { id: 2, name: 'Monitor 1', asset_tag: 'AST-002' }
            ]);

            const req = mockRequest({ params: { id: 'test-uuid-123' } });
            const res = mockResponse();

            await UserController.getUserAssets(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Array)
                })
            );
        });
    });
});
