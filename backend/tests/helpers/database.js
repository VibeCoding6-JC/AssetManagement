/**
 * Mock database models for unit testing
 */

export const mockUser = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
};

export const mockCategory = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
};

export const mockLocation = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
};

export const mockVendor = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
};

export const mockAsset = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
};

export const mockTransaction = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn()
};

/**
 * Reset all mocks
 */
export const resetAllMocks = () => {
    Object.values(mockUser).forEach(fn => fn.mockReset());
    Object.values(mockCategory).forEach(fn => fn.mockReset());
    Object.values(mockLocation).forEach(fn => fn.mockReset());
    Object.values(mockVendor).forEach(fn => fn.mockReset());
    Object.values(mockAsset).forEach(fn => fn.mockReset());
    Object.values(mockTransaction).forEach(fn => fn.mockReset());
};

/**
 * Create a mock Sequelize instance
 */
export const mockSequelize = {
    transaction: jest.fn().mockImplementation(async (callback) => {
        const t = {
            commit: jest.fn(),
            rollback: jest.fn()
        };
        try {
            const result = await callback(t);
            await t.commit();
            return result;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }),
    sync: jest.fn().mockResolvedValue(true),
    authenticate: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true)
};
