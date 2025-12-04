import { jest } from '@jest/globals';
import { mockRequest, mockResponse } from '../helpers/auth.js';

// Mock the models
const mockVendorsModel = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    count: jest.fn()
};

const mockAssetsModel = {
    count: jest.fn()
};

// Mock modules
jest.unstable_mockModule('../../models/index.js', () => ({
    Vendors: mockVendorsModel,
    Assets: mockAssetsModel
}));

describe('Vendor Controller', () => {
    let VendorController;

    beforeAll(async () => {
        const module = await import('../../controllers/VendorController.js');
        VendorController = module;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockVendor = {
        id: 1,
        uuid: 'vendor-uuid-123',
        name: 'PT. Lenovo Indonesia',
        contact_person: 'John Doe',
        email: 'john@lenovo.co.id',
        phone: '021-1234567',
        address: 'Jl. Sudirman, Jakarta'
    };

    describe('getVendors', () => {
        it('should return all vendors', async () => {
            mockVendorsModel.findAll.mockResolvedValue([
                mockVendor,
                { ...mockVendor, id: 2, name: 'PT. Dell Indonesia' }
            ]);

            const req = mockRequest();
            const res = mockResponse();

            await VendorController.getVendors(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Array)
                })
            );
        });

        it('should search vendors by name', async () => {
            mockVendorsModel.findAll.mockResolvedValue([mockVendor]);

            const req = mockRequest({ query: { search: 'Lenovo' } });
            const res = mockResponse();

            await VendorController.getVendors(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getVendorById', () => {
        it('should return vendor by UUID', async () => {
            mockVendorsModel.findOne.mockResolvedValue(mockVendor);

            const req = mockRequest({ params: { id: 'vendor-uuid-123' } });
            const res = mockResponse();

            await VendorController.getVendorById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if vendor not found', async () => {
            mockVendorsModel.findOne.mockResolvedValue(null);

            const req = mockRequest({ params: { id: 'non-existent' } });
            const res = mockResponse();

            await VendorController.getVendorById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('createVendor', () => {
        it('should create a new vendor', async () => {
            mockVendorsModel.create.mockResolvedValue(mockVendor);

            const req = mockRequest({
                body: {
                    name: 'PT. Lenovo Indonesia',
                    contact_person: 'John Doe',
                    email: 'john@lenovo.co.id',
                    phone: '021-1234567'
                }
            });
            const res = mockResponse();

            await VendorController.createVendor(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should return 400 if name is missing', async () => {
            const req = mockRequest({ body: {} });
            const res = mockResponse();

            await VendorController.createVendor(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('updateVendor', () => {
        it('should update vendor successfully', async () => {
            const vendorWithUpdate = {
                ...mockVendor,
                update: jest.fn().mockResolvedValue(true)
            };
            mockVendorsModel.findOne.mockResolvedValue(vendorWithUpdate);

            const req = mockRequest({
                params: { id: 'vendor-uuid-123' },
                body: { name: 'Updated Lenovo' }
            });
            const res = mockResponse();

            await VendorController.updateVendor(req, res);

            expect(vendorWithUpdate.update).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('deleteVendor', () => {
        it('should delete vendor if no assets are using it', async () => {
            const vendorWithDestroy = {
                ...mockVendor,
                destroy: jest.fn().mockResolvedValue(true)
            };
            mockVendorsModel.findOne.mockResolvedValue(vendorWithDestroy);
            mockAssetsModel.count.mockResolvedValue(0);

            const req = mockRequest({ params: { id: 'vendor-uuid-123' } });
            const res = mockResponse();

            await VendorController.deleteVendor(req, res);

            expect(vendorWithDestroy.destroy).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 if vendor has assets', async () => {
            mockVendorsModel.findOne.mockResolvedValue(mockVendor);
            mockAssetsModel.count.mockResolvedValue(5);

            const req = mockRequest({ params: { id: 'vendor-uuid-123' } });
            const res = mockResponse();

            await VendorController.deleteVendor(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
