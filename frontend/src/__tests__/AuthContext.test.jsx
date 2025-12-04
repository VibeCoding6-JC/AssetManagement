import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Mock axios
vi.mock('../api/axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
        interceptors: {
            request: { use: vi.fn(), eject: vi.fn() },
            response: { use: vi.fn(), eject: vi.fn() }
        }
    }
}));

const wrapper = ({ children }) => (
    <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
);

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('Initial State', () => {
        it('should start with null user', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.user).toBeNull();
            expect(result.current.isAuthenticated).toBe(false);
        });
    });

    describe('Login', () => {
        it('should login successfully and set user', async () => {
            const mockUser = {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                role: 'admin'
            };

            const axiosModule = await import('../api/axios');
            axiosModule.default.post.mockResolvedValue({
                data: {
                    success: true,
                    data: {
                        user: mockUser,
                        accessToken: 'test-token'
                    }
                }
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.login('test@example.com', 'password');
            });

            expect(result.current.user).toEqual(mockUser);
            expect(result.current.isAuthenticated).toBe(true);
            expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'test-token');
        });

        it('should throw error on failed login', async () => {
            const axiosModule = await import('../api/axios');
            axiosModule.default.post.mockRejectedValue(new Error('Invalid credentials'));

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await expect(
                act(async () => {
                    await result.current.login('wrong@example.com', 'wrongpass');
                })
            ).rejects.toThrow();
        });
    });

    describe('Logout', () => {
        it('should logout and clear user', async () => {
            const axiosModule = await import('../api/axios');
            axiosModule.default.delete.mockResolvedValue({ data: { success: true } });

            // Setup initial logged-in state
            localStorage.setItem('accessToken', 'test-token');
            localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test' }));

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.logout();
            });

            expect(result.current.user).toBeNull();
            expect(result.current.isAuthenticated).toBe(false);
            expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
            expect(localStorage.removeItem).toHaveBeenCalledWith('user');
        });
    });

    describe('Role Checks', () => {
        it('should correctly identify admin role', async () => {
            const mockAdmin = { id: 1, name: 'Admin', role: 'admin' };

            const axiosModule = await import('../api/axios');
            axiosModule.default.post.mockResolvedValue({
                data: {
                    success: true,
                    data: { user: mockAdmin, accessToken: 'token' }
                }
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.login('admin@test.com', 'pass');
            });

            expect(result.current.isAdmin()).toBe(true);
            expect(result.current.isStaff()).toBe(false);
            expect(result.current.isStaffOrAdmin()).toBe(true);
        });

        it('should correctly identify staff role', async () => {
            const mockStaff = { id: 1, name: 'Staff', role: 'staff' };

            const axiosModule = await import('../api/axios');
            axiosModule.default.post.mockResolvedValue({
                data: {
                    success: true,
                    data: { user: mockStaff, accessToken: 'token' }
                }
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.login('staff@test.com', 'pass');
            });

            expect(result.current.isAdmin()).toBe(false);
            expect(result.current.isStaff()).toBe(true);
            expect(result.current.isStaffOrAdmin()).toBe(true);
        });

        it('should correctly identify employee role', async () => {
            const mockEmployee = { id: 1, name: 'Employee', role: 'employee' };

            const axiosModule = await import('../api/axios');
            axiosModule.default.post.mockResolvedValue({
                data: {
                    success: true,
                    data: { user: mockEmployee, accessToken: 'token' }
                }
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.login('employee@test.com', 'pass');
            });

            expect(result.current.isAdmin()).toBe(false);
            expect(result.current.isStaff()).toBe(false);
            expect(result.current.isStaffOrAdmin()).toBe(false);
        });
    });
});
