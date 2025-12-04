import { jest } from '@jest/globals';
import { mockRequest, mockResponse } from '../helpers/auth.js';

// Mock the models
const mockLocationsModel = {
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
    Locations: mockLocationsModel,
    Assets: mockAssetsModel
}));

describe('Location Controller', () => {
    let LocationController;

    beforeAll(async () => {
        const module = await import('../../controllers/LocationController.js');
        LocationController = module;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockLocation = {
        id: 1,
        uuid: 'loc-uuid-123',
        name: 'HQ - Floor 1',
        address: 'Jl. Sudirman No. 1',
        description: 'Main office floor 1'
    };

    describe('getLocations', () => {
        it('should return all locations', async () => {
            mockLocationsModel.findAll.mockResolvedValue([
                mockLocation,
                { ...mockLocation, id: 2, name: 'HQ - Floor 2' }
            ]);

            const req = mockRequest();
            const res = mockResponse();

            await LocationController.getLocations(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Array)
                })
            );
        });
    });

    describe('getLocationById', () => {
        it('should return location by UUID', async () => {
            mockLocationsModel.findOne.mockResolvedValue(mockLocation);

            const req = mockRequest({ params: { id: 'loc-uuid-123' } });
            const res = mockResponse();

            await LocationController.getLocationById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if location not found', async () => {
            mockLocationsModel.findOne.mockResolvedValue(null);

            const req = mockRequest({ params: { id: 'non-existent' } });
            const res = mockResponse();

            await LocationController.getLocationById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('createLocation', () => {
        it('should create a new location', async () => {
            mockLocationsModel.findOne.mockResolvedValue(null);
            mockLocationsModel.create.mockResolvedValue(mockLocation);

            const req = mockRequest({
                body: { name: 'HQ - Floor 1', address: 'Jl. Sudirman No. 1' }
            });
            const res = mockResponse();

            await LocationController.createLocation(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should return 400 if name already exists', async () => {
            mockLocationsModel.findOne.mockResolvedValue(mockLocation);

            const req = mockRequest({
                body: { name: 'HQ - Floor 1' }
            });
            const res = mockResponse();

            await LocationController.createLocation(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('updateLocation', () => {
        it('should update location successfully', async () => {
            const locationWithUpdate = {
                ...mockLocation,
                update: jest.fn().mockResolvedValue(true)
            };
            mockLocationsModel.findOne.mockResolvedValue(locationWithUpdate);

            const req = mockRequest({
                params: { id: 'loc-uuid-123' },
                body: { name: 'Updated Floor 1' }
            });
            const res = mockResponse();

            await LocationController.updateLocation(req, res);

            expect(locationWithUpdate.update).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('deleteLocation', () => {
        it('should delete location if no assets are using it', async () => {
            const locationWithDestroy = {
                ...mockLocation,
                destroy: jest.fn().mockResolvedValue(true)
            };
            mockLocationsModel.findOne.mockResolvedValue(locationWithDestroy);
            mockAssetsModel.count.mockResolvedValue(0);

            const req = mockRequest({ params: { id: 'loc-uuid-123' } });
            const res = mockResponse();

            await LocationController.deleteLocation(req, res);

            expect(locationWithDestroy.destroy).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 if location has assets', async () => {
            mockLocationsModel.findOne.mockResolvedValue(mockLocation);
            mockAssetsModel.count.mockResolvedValue(10);

            const req = mockRequest({ params: { id: 'loc-uuid-123' } });
            const res = mockResponse();

            await LocationController.deleteLocation(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
