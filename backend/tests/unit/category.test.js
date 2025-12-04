import { jest } from '@jest/globals';
import { mockRequest, mockResponse } from '../helpers/auth.js';

// Mock the models
const mockCategoriesModel = {
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
    Categories: mockCategoriesModel,
    Assets: mockAssetsModel
}));

describe('Category Controller', () => {
    let CategoryController;

    beforeAll(async () => {
        const module = await import('../../controllers/CategoryController.js');
        CategoryController = module;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockCategory = {
        id: 1,
        uuid: 'cat-uuid-123',
        name: 'Laptop',
        description: 'Portable computers'
    };

    describe('getCategories', () => {
        it('should return all categories', async () => {
            mockCategoriesModel.findAll.mockResolvedValue([
                mockCategory,
                { ...mockCategory, id: 2, name: 'Desktop' }
            ]);

            const req = mockRequest();
            const res = mockResponse();

            await CategoryController.getCategories(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Array)
                })
            );
        });
    });

    describe('getCategoryById', () => {
        it('should return category by UUID', async () => {
            mockCategoriesModel.findOne.mockResolvedValue(mockCategory);

            const req = mockRequest({ params: { id: 'cat-uuid-123' } });
            const res = mockResponse();

            await CategoryController.getCategoryById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        name: 'Laptop'
                    })
                })
            );
        });

        it('should return 404 if category not found', async () => {
            mockCategoriesModel.findOne.mockResolvedValue(null);

            const req = mockRequest({ params: { id: 'non-existent' } });
            const res = mockResponse();

            await CategoryController.getCategoryById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('createCategory', () => {
        it('should create a new category', async () => {
            mockCategoriesModel.findOne.mockResolvedValue(null);
            mockCategoriesModel.create.mockResolvedValue(mockCategory);

            const req = mockRequest({
                body: { name: 'Laptop', description: 'Portable computers' }
            });
            const res = mockResponse();

            await CategoryController.createCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true
                })
            );
        });

        it('should return 400 if category name exists', async () => {
            mockCategoriesModel.findOne.mockResolvedValue(mockCategory);

            const req = mockRequest({
                body: { name: 'Laptop' }
            });
            const res = mockResponse();

            await CategoryController.createCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if name is missing', async () => {
            const req = mockRequest({ body: {} });
            const res = mockResponse();

            await CategoryController.createCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('updateCategory', () => {
        it('should update category successfully', async () => {
            const categoryWithUpdate = {
                ...mockCategory,
                update: jest.fn().mockResolvedValue(true)
            };
            mockCategoriesModel.findOne.mockResolvedValue(categoryWithUpdate);

            const req = mockRequest({
                params: { id: 'cat-uuid-123' },
                body: { name: 'Updated Laptop' }
            });
            const res = mockResponse();

            await CategoryController.updateCategory(req, res);

            expect(categoryWithUpdate.update).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('deleteCategory', () => {
        it('should delete category if no assets are using it', async () => {
            const categoryWithDestroy = {
                ...mockCategory,
                destroy: jest.fn().mockResolvedValue(true)
            };
            mockCategoriesModel.findOne.mockResolvedValue(categoryWithDestroy);
            mockAssetsModel.count.mockResolvedValue(0);

            const req = mockRequest({ params: { id: 'cat-uuid-123' } });
            const res = mockResponse();

            await CategoryController.deleteCategory(req, res);

            expect(categoryWithDestroy.destroy).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 if category has assets', async () => {
            mockCategoriesModel.findOne.mockResolvedValue(mockCategory);
            mockAssetsModel.count.mockResolvedValue(5);

            const req = mockRequest({ params: { id: 'cat-uuid-123' } });
            const res = mockResponse();

            await CategoryController.deleteCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
