import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';

// Mock the axios module
vi.mock('../api/axios', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
        interceptors: {
            request: { use: vi.fn(), eject: vi.fn() },
            response: { use: vi.fn(), eject: vi.fn() }
        }
    }
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn()
    },
    Toaster: () => null
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ state: null })
    };
});

const renderLogin = () => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                <Login />
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('Rendering', () => {
        it('should render login form', () => {
            renderLogin();

            expect(screen.getByText('IT Asset Management')).toBeInTheDocument();
            expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        });

        it('should render demo credentials section', () => {
            renderLogin();

            expect(screen.getByText(/demo credentials/i)).toBeInTheDocument();
            expect(screen.getByText(/admin@company.com/)).toBeInTheDocument();
            expect(screen.getByText(/staff@company.com/)).toBeInTheDocument();
        });
    });

    describe('Form Input', () => {
        it('should update email input value', async () => {
            const user = userEvent.setup();
            renderLogin();

            const emailInput = screen.getByPlaceholderText(/email/i);
            await user.type(emailInput, 'test@example.com');

            expect(emailInput).toHaveValue('test@example.com');
        });

        it('should update password input value', async () => {
            const user = userEvent.setup();
            renderLogin();

            const passwordInput = screen.getByPlaceholderText(/password/i);
            await user.type(passwordInput, 'mypassword');

            expect(passwordInput).toHaveValue('mypassword');
        });

        it('should have password input with type password', () => {
            renderLogin();

            const passwordInput = screen.getByPlaceholderText(/password/i);
            expect(passwordInput).toHaveAttribute('type', 'password');
        });

        it('should have email input with type email', () => {
            renderLogin();

            const emailInput = screen.getByPlaceholderText(/email/i);
            expect(emailInput).toHaveAttribute('type', 'email');
        });
    });

    describe('Form Submission', () => {
        it('should have a submit button', () => {
            renderLogin();

            const submitButton = screen.getByRole('button', { name: /sign in/i });
            expect(submitButton).toHaveAttribute('type', 'submit');
        });

        it('should disable button while loading', async () => {
            const user = userEvent.setup();
            const axiosModule = await import('../api/axios');
            
            // Mock a slow response
            axiosModule.default.post.mockImplementation(() => 
                new Promise(resolve => setTimeout(resolve, 1000))
            );

            renderLogin();

            const emailInput = screen.getByPlaceholderText(/email/i);
            const passwordInput = screen.getByPlaceholderText(/password/i);
            
            await user.type(emailInput, 'admin@company.com');
            await user.type(passwordInput, 'admin123');

            const submitButton = screen.getByRole('button', { name: /sign in/i });
            await user.click(submitButton);

            // Button should be disabled during loading
            expect(submitButton).toBeDisabled();
        });
    });

    describe('Accessibility', () => {
        it('should have accessible inputs with placeholders', () => {
            renderLogin();

            const emailInput = screen.getByPlaceholderText(/email/i);
            const passwordInput = screen.getByPlaceholderText(/password/i);

            expect(emailInput).toBeInTheDocument();
            expect(passwordInput).toBeInTheDocument();
        });

        it('should have visible labels', () => {
            renderLogin();

            expect(screen.getByText('Email Address')).toBeInTheDocument();
            expect(screen.getByText('Password')).toBeInTheDocument();
        });
    });
});
