import { vi } from 'vitest';

// Create mock axios instance
const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
        request: {
            use: vi.fn(),
            eject: vi.fn()
        },
        response: {
            use: vi.fn(),
            eject: vi.fn()
        }
    },
    defaults: {
        headers: {
            common: {}
        }
    }
};

// Mock axios create to return our mock instance
const axios = {
    create: vi.fn(() => mockAxiosInstance),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
        request: {
            use: vi.fn(),
            eject: vi.fn()
        },
        response: {
            use: vi.fn(),
            eject: vi.fn()
        }
    }
};

export default axios;
export { mockAxiosInstance };
