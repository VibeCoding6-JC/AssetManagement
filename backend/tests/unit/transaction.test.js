import { jest } from '@jest/globals';
import { mockRequest, mockResponse } from '../helpers/auth.js';

// Mock the models
const mockTransactionsModel = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn()
};

const mockAssetsModel = {
    findOne: jest.fn(),
    findByPk: jest.fn()
};

const mockUsersModel = {
    findOne: jest.fn(),
    findByPk: jest.fn()
};

const mockSequelize = {
    transaction: jest.fn()
};

// Mock modules
jest.unstable_mockModule('../../models/index.js', () => ({
    Transactions: mockTransactionsModel,
    Assets: mockAssetsModel,
    Users: mockUsersModel
}));

jest.unstable_mockModule('../../config/Database.js', () => ({
    default: mockSequelize
}));

describe('Transaction Controller', () => {
    let TransactionController;

    beforeAll(async () => {
        const module = await import('../../controllers/TransactionController.js');
        TransactionController = module;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Default mock for sequelize transaction
        mockSequelize.transaction.mockImplementation(async (callback) => {
            const t = { commit: jest.fn(), rollback: jest.fn() };
            return callback(t);
        });
    });

    const mockAsset = {
        id: 1,
        uuid: 'asset-uuid-123',
        name: 'Test Laptop',
        asset_tag: 'AST-001',
        status: 'available',
        condition: 'good',
        current_holder_id: null,
        update: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true)
    };

    const mockUser = {
        id: 2,
        uuid: 'user-uuid-123',
        name: 'John Doe',
        email: 'john@test.com',
        role: 'employee'
    };

    const mockTransaction = {
        id: 1,
        uuid: 'trans-uuid-123',
        asset_id: 1,
        user_id: 2,
        admin_id: 1,
        action_type: 'checkout',
        transaction_date: '2024-01-15'
    };

    describe('getTransactions', () => {
        it('should return paginated transactions', async () => {
            mockTransactionsModel.findAndCountAll.mockResolvedValue({
                count: 2,
                rows: [mockTransaction, { ...mockTransaction, id: 2 }]
            });

            const req = mockRequest({ query: { page: 1, limit: 10 } });
            const res = mockResponse();

            await TransactionController.getTransactions(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        transactions: expect.any(Array),
                        pagination: expect.any(Object)
                    })
                })
            );
        });

        it('should filter transactions by action_type', async () => {
            mockTransactionsModel.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [mockTransaction]
            });

            const req = mockRequest({ query: { action_type: 'checkout' } });
            const res = mockResponse();

            await TransactionController.getTransactions(req, res);

            expect(mockTransactionsModel.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        action_type: 'checkout'
                    })
                })
            );
        });
    });

    describe('getTransactionById', () => {
        it('should return transaction by UUID', async () => {
            mockTransactionsModel.findOne.mockResolvedValue(mockTransaction);

            const req = mockRequest({ params: { id: 'trans-uuid-123' } });
            const res = mockResponse();

            await TransactionController.getTransactionById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if transaction not found', async () => {
            mockTransactionsModel.findOne.mockResolvedValue(null);

            const req = mockRequest({ params: { id: 'non-existent' } });
            const res = mockResponse();

            await TransactionController.getTransactionById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('checkoutAsset', () => {
        it('should checkout an available asset', async () => {
            mockAssetsModel.findOne.mockResolvedValue(mockAsset);
            mockUsersModel.findOne.mockResolvedValue(mockUser);
            mockTransactionsModel.create.mockResolvedValue(mockTransaction);

            const req = mockRequest({
                body: {
                    asset_id: 'asset-uuid-123',
                    user_id: 'user-uuid-123',
                    notes: 'Checkout for project'
                },
                userId: 1
            });
            const res = mockResponse();

            await TransactionController.checkoutAsset(req, res);

            expect(mockAsset.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'assigned',
                    current_holder_id: 2
                }),
                expect.any(Object)
            );
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should return 400 if asset is not available', async () => {
            const assignedAsset = { ...mockAsset, status: 'assigned' };
            mockAssetsModel.findOne.mockResolvedValue(assignedAsset);

            const req = mockRequest({
                body: {
                    asset_id: 'asset-uuid-123',
                    user_id: 'user-uuid-123'
                },
                userId: 1
            });
            const res = mockResponse();

            await TransactionController.checkoutAsset(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('not available')
                })
            );
        });

        it('should return 404 if asset not found', async () => {
            mockAssetsModel.findOne.mockResolvedValue(null);

            const req = mockRequest({
                body: {
                    asset_id: 'non-existent',
                    user_id: 'user-uuid-123'
                },
                userId: 1
            });
            const res = mockResponse();

            await TransactionController.checkoutAsset(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('checkinAsset', () => {
        it('should checkin an assigned asset', async () => {
            const assignedAsset = {
                ...mockAsset,
                status: 'assigned',
                current_holder_id: 2,
                update: jest.fn().mockResolvedValue(true)
            };
            mockAssetsModel.findOne.mockResolvedValue(assignedAsset);
            mockTransactionsModel.create.mockResolvedValue(mockTransaction);

            const req = mockRequest({
                body: {
                    asset_id: 'asset-uuid-123',
                    condition_after: 'good',
                    notes: 'Returned in good condition'
                },
                userId: 1
            });
            const res = mockResponse();

            await TransactionController.checkinAsset(req, res);

            expect(assignedAsset.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'available',
                    current_holder_id: null
                }),
                expect.any(Object)
            );
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should mark asset for repair if condition is damaged', async () => {
            const assignedAsset = {
                ...mockAsset,
                status: 'assigned',
                current_holder_id: 2,
                update: jest.fn().mockResolvedValue(true)
            };
            mockAssetsModel.findOne.mockResolvedValue(assignedAsset);
            mockTransactionsModel.create.mockResolvedValue(mockTransaction);

            const req = mockRequest({
                body: {
                    asset_id: 'asset-uuid-123',
                    condition_after: 'damaged',
                    notes: 'Screen cracked'
                },
                userId: 1
            });
            const res = mockResponse();

            await TransactionController.checkinAsset(req, res);

            expect(assignedAsset.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'repair'
                }),
                expect.any(Object)
            );
        });

        it('should return 400 if asset is not assigned', async () => {
            mockAssetsModel.findOne.mockResolvedValue(mockAsset); // status: 'available'

            const req = mockRequest({
                body: {
                    asset_id: 'asset-uuid-123',
                    condition_after: 'good'
                },
                userId: 1
            });
            const res = mockResponse();

            await TransactionController.checkinAsset(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('sendToRepair', () => {
        it('should send asset to repair', async () => {
            const availableAsset = {
                ...mockAsset,
                update: jest.fn().mockResolvedValue(true)
            };
            mockAssetsModel.findOne.mockResolvedValue(availableAsset);
            mockTransactionsModel.create.mockResolvedValue(mockTransaction);

            const req = mockRequest({
                body: {
                    asset_id: 'asset-uuid-123',
                    notes: 'Battery replacement needed'
                },
                userId: 1
            });
            const res = mockResponse();

            await TransactionController.sendToRepair(req, res);

            expect(availableAsset.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'repair'
                }),
                expect.any(Object)
            );
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('completeRepair', () => {
        it('should complete repair and make asset available', async () => {
            const repairAsset = {
                ...mockAsset,
                status: 'repair',
                update: jest.fn().mockResolvedValue(true)
            };
            mockAssetsModel.findOne.mockResolvedValue(repairAsset);
            mockTransactionsModel.create.mockResolvedValue(mockTransaction);

            const req = mockRequest({
                body: {
                    asset_id: 'asset-uuid-123',
                    condition_after: 'good',
                    notes: 'Repaired successfully'
                },
                userId: 1
            });
            const res = mockResponse();

            await TransactionController.completeRepair(req, res);

            expect(repairAsset.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'available',
                    condition: 'good'
                }),
                expect.any(Object)
            );
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should return 400 if asset is not in repair', async () => {
            mockAssetsModel.findOne.mockResolvedValue(mockAsset); // status: 'available'

            const req = mockRequest({
                body: {
                    asset_id: 'asset-uuid-123',
                    condition_after: 'good'
                },
                userId: 1
            });
            const res = mockResponse();

            await TransactionController.completeRepair(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('disposeAsset', () => {
        it('should dispose an asset', async () => {
            const assetToDispose = {
                ...mockAsset,
                update: jest.fn().mockResolvedValue(true)
            };
            mockAssetsModel.findOne.mockResolvedValue(assetToDispose);
            mockTransactionsModel.create.mockResolvedValue(mockTransaction);

            const req = mockRequest({
                body: {
                    asset_id: 'asset-uuid-123',
                    notes: 'End of life - no longer functional'
                },
                userId: 1
            });
            const res = mockResponse();

            await TransactionController.disposeAsset(req, res);

            expect(assetToDispose.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'retired'
                }),
                expect.any(Object)
            );
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should return 400 if asset is currently assigned', async () => {
            const assignedAsset = { ...mockAsset, status: 'assigned', current_holder_id: 2 };
            mockAssetsModel.findOne.mockResolvedValue(assignedAsset);

            const req = mockRequest({
                body: {
                    asset_id: 'asset-uuid-123',
                    notes: 'Dispose'
                },
                userId: 1
            });
            const res = mockResponse();

            await TransactionController.disposeAsset(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
