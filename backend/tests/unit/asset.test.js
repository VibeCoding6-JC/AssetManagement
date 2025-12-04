import { jest } from '@jest/globals';
import { mockRequest, mockResponse } from '../helpers/auth.js';

// Mock the models
const mockAssetsModel = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
};

const mockCategoriesModel = {
    findOne: jest.fn(),
    findByPk: jest.fn()
};

const mockLocationsModel = {
    findOne: jest.fn(),
    findByPk: jest.fn()
};

const mockVendorsModel = {
    findOne: jest.fn(),
    findByPk: jest.fn()
};

const mockUsersModel = {
    findOne: jest.fn(),
    findByPk: jest.fn()
};

const mockTransactionsModel = {
    findAll: jest.fn()
};

// Mock modules
jest.unstable_mockModule('../../models/index.js', () => ({
    Assets: mockAssetsModel,
    Categories: mockCategoriesModel,
    Locations: mockLocationsModel,
    Vendors: mockVendorsModel,
    Users: mockUsersModel,
    Transactions: mockTransactionsModel
}));

describe('Asset Controller', () => {
    let AssetController;

    beforeAll(async () => {
        const module = await import('../../controllers/AssetController.js');
        AssetController = module;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockAsset = {
        id: 1,
        uuid: 'asset-uuid-123',
        name: 'Test Laptop',
        asset_tag: 'AST-001',
        serial_number: 'SN123456',
        category_id: 1,
        location_id: 1,
        vendor_id: 1,
        status: 'available',
        condition: 'good',
        purchase_date: '2024-01-01',
        purchase_price: 15000000,
        warranty_expiry: '2027-01-01'
    };

    describe('getAssets', () => {
        it('should return paginated assets list', async () => {
            mockAssetsModel.findAndCountAll.mockResolvedValue({
                count: 2,
                rows: [mockAsset, { ...mockAsset, id: 2 }]
            });

            const req = mockRequest({ query: { page: 1, limit: 10 } });
            const res = mockResponse();

            await AssetController.getAssets(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        assets: expect.any(Array),
                        pagination: expect.any(Object)
                    })
                })
            );
        });

        it('should filter assets by status', async () => {
            mockAssetsModel.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [mockAsset]
            });

            const req = mockRequest({ query: { status: 'available' } });
            const res = mockResponse();

            await AssetController.getAssets(req, res);

            expect(mockAssetsModel.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        status: 'available'
                    })
                })
            );
        });

        it('should filter assets by category', async () => {
            mockAssetsModel.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [mockAsset]
            });

            const req = mockRequest({ query: { category_id: '1' } });
            const res = mockResponse();

            await AssetController.getAssets(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should search assets by name, tag or serial', async () => {
            mockAssetsModel.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [mockAsset]
            });

            const req = mockRequest({ query: { search: 'Laptop' } });
            const res = mockResponse();

            await AssetController.getAssets(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getAssetById', () => {
        it('should return asset by UUID', async () => {
            mockAssetsModel.findOne.mockResolvedValue(mockAsset);

            const req = mockRequest({ params: { id: 'asset-uuid-123' } });
            const res = mockResponse();

            await AssetController.getAssetById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        uuid: mockAsset.uuid
                    })
                })
            );
        });

        it('should return 404 if asset not found', async () => {
            mockAssetsModel.findOne.mockResolvedValue(null);

            const req = mockRequest({ params: { id: 'non-existent' } });
            const res = mockResponse();

            await AssetController.getAssetById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('createAsset', () => {
        it('should create a new asset', async () => {
            mockAssetsModel.findOne.mockResolvedValue(null); // No duplicates
            mockCategoriesModel.findByPk.mockResolvedValue({ id: 1, name: 'Laptop' });
            mockLocationsModel.findByPk.mockResolvedValue({ id: 1, name: 'Office' });
            mockAssetsModel.create.mockResolvedValue(mockAsset);

            const req = mockRequest({
                body: {
                    name: 'Test Laptop',
                    asset_tag: 'AST-001',
                    serial_number: 'SN123456',
                    category_id: 1,
                    location_id: 1,
                    purchase_date: '2024-01-01',
                    purchase_price: 15000000
                }
            });
            const res = mockResponse();

            await AssetController.createAsset(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true
                })
            );
        });

        it('should return 400 if asset_tag already exists', async () => {
            mockAssetsModel.findOne.mockResolvedValue(mockAsset);

            const req = mockRequest({
                body: {
                    name: 'Duplicate Laptop',
                    asset_tag: 'AST-001',
                    serial_number: 'SN999999',
                    category_id: 1,
                    location_id: 1,
                    purchase_date: '2024-01-01',
                    purchase_price: 15000000
                }
            });
            const res = mockResponse();

            await AssetController.createAsset(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if required fields are missing', async () => {
            const req = mockRequest({
                body: { name: 'Incomplete Asset' }
            });
            const res = mockResponse();

            await AssetController.createAsset(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('updateAsset', () => {
        it('should update asset successfully', async () => {
            const assetWithUpdate = {
                ...mockAsset,
                update: jest.fn().mockResolvedValue(true)
            };
            mockAssetsModel.findOne.mockResolvedValue(assetWithUpdate);

            const req = mockRequest({
                params: { id: 'asset-uuid-123' },
                body: { name: 'Updated Laptop' }
            });
            const res = mockResponse();

            await AssetController.updateAsset(req, res);

            expect(assetWithUpdate.update).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if asset not found', async () => {
            mockAssetsModel.findOne.mockResolvedValue(null);

            const req = mockRequest({
                params: { id: 'non-existent' },
                body: { name: 'Updated Laptop' }
            });
            const res = mockResponse();

            await AssetController.updateAsset(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteAsset', () => {
        it('should delete asset successfully', async () => {
            const assetWithDestroy = {
                ...mockAsset,
                destroy: jest.fn().mockResolvedValue(true)
            };
            mockAssetsModel.findOne.mockResolvedValue(assetWithDestroy);

            const req = mockRequest({ params: { id: 'asset-uuid-123' } });
            const res = mockResponse();

            await AssetController.deleteAsset(req, res);

            expect(assetWithDestroy.destroy).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 if asset is currently assigned', async () => {
            const assignedAsset = {
                ...mockAsset,
                status: 'assigned',
                current_holder_id: 1
            };
            mockAssetsModel.findOne.mockResolvedValue(assignedAsset);

            const req = mockRequest({ params: { id: 'asset-uuid-123' } });
            const res = mockResponse();

            await AssetController.deleteAsset(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('getAssetHistory', () => {
        it('should return asset transaction history', async () => {
            mockAssetsModel.findOne.mockResolvedValue(mockAsset);
            mockTransactionsModel.findAll.mockResolvedValue([
                { id: 1, action_type: 'checkout', transaction_date: '2024-01-15' },
                { id: 2, action_type: 'checkin', transaction_date: '2024-02-15' }
            ]);

            const req = mockRequest({ params: { id: 'asset-uuid-123' } });
            const res = mockResponse();

            await AssetController.getAssetHistory(req, res);

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
