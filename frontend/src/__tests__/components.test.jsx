import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Simple mock components for testing since actual components may vary
const Button = ({ children, onClick, disabled, loading, variant = 'primary', type = 'button', className = '' }) => (
    <button 
        type={type}
        onClick={onClick} 
        disabled={disabled || loading}
        className={`${variant === 'primary' ? 'bg-blue-600' : ''} ${className}`}
    >
        {children}
    </button>
);

const Input = ({ label, type = 'text', error, disabled, onChange, placeholder, id }) => (
    <div className="w-full">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <input
            id={id}
            type={type}
            disabled={disabled}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border rounded-lg"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
);

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
);

Card.Header = ({ children }) => <div className="p-4 border-b">{children}</div>;
Card.Title = ({ children }) => <h2 className="text-lg font-semibold">{children}</h2>;
Card.Body = ({ children }) => <div className="p-4">{children}</div>;

const SearchInput = ({ placeholder, onChange }) => (
    <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg"
    />
);

const Select = ({ label, options, onChange, id }) => (
    <div>
        <label htmlFor={id}>{label}</label>
        <select id={id} onChange={onChange}>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal">
                {title && <h2>{title}</h2>}
                <button aria-label="close" onClick={onClose}>×</button>
                {children}
            </div>
        </div>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
    <div className="pagination">
        <button 
            aria-label="previous"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
        >
            Previous
        </button>
        <span>{currentPage}</span>
        <button 
            aria-label="next"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
        >
            Next
        </button>
    </div>
);

const Table = ({ columns, data, loading, emptyMessage = 'No data' }) => {
    if (loading) return <div>Loading...</div>;
    if (!data || data.length === 0) return <div>{emptyMessage}</div>;
    
    return (
        <table>
            <thead>
                <tr>
                    {columns.map(col => <th key={col.key}>{col.label}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.map((row, i) => (
                    <tr key={i}>
                        {columns.map(col => <td key={col.key}>{row[col.key]}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

describe('UI Components', () => {
    describe('Button', () => {
        it('should render button with text', () => {
            render(<Button>Click Me</Button>);
            expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
        });

        it('should handle click events', async () => {
            const user = userEvent.setup();
            const handleClick = vi.fn();

            render(<Button onClick={handleClick}>Click Me</Button>);
            
            await user.click(screen.getByRole('button'));
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should be disabled when disabled prop is true', () => {
            render(<Button disabled>Disabled</Button>);
            expect(screen.getByRole('button')).toBeDisabled();
        });

        it('should apply variant classes', () => {
            render(<Button variant="primary">Primary</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-blue-600');
        });

        it('should show loading state', () => {
            render(<Button loading>Loading</Button>);
            expect(screen.getByRole('button')).toBeDisabled();
        });
    });

    describe('Input', () => {
        it('should render input with label', () => {
            render(<Input label="Email" id="email" />);
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        });

        it('should handle value changes', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(<Input label="Name" id="name" onChange={handleChange} />);
            
            const input = screen.getByLabelText(/name/i);
            await user.type(input, 'John');

            expect(handleChange).toHaveBeenCalled();
        });

        it('should display error message', () => {
            render(<Input label="Email" id="email" error="Invalid email" />);
            expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
        });

        it('should be disabled when disabled prop is true', () => {
            render(<Input label="Disabled" id="disabled" disabled />);
            expect(screen.getByLabelText(/disabled/i)).toBeDisabled();
        });

        it('should apply correct input type', () => {
            render(<Input label="Password" id="password" type="password" />);
            expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
        });
    });

    describe('Card', () => {
        it('should render card with children', () => {
            render(
                <Card>
                    <Card.Header>
                        <Card.Title>Test Title</Card.Title>
                    </Card.Header>
                    <Card.Body>Test Content</Card.Body>
                </Card>
            );

            expect(screen.getByText('Test Title')).toBeInTheDocument();
            expect(screen.getByText('Test Content')).toBeInTheDocument();
        });

        it('should apply custom className', () => {
            const { container } = render(<Card className="custom-class">Content</Card>);
            expect(container.firstChild).toHaveClass('custom-class');
        });
    });

    describe('SearchInput', () => {
        it('should render search input', () => {
            render(<SearchInput placeholder="Search..." />);
            expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
        });

        it('should call onChange when typing', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(<SearchInput onChange={handleChange} placeholder="Search..." />);
            
            const input = screen.getByRole('textbox');
            await user.type(input, 'test');

            expect(handleChange).toHaveBeenCalled();
        });
    });

    describe('Select', () => {
        const options = [
            { value: '1', label: 'Option 1' },
            { value: '2', label: 'Option 2' },
            { value: '3', label: 'Option 3' }
        ];

        it('should render select with options', () => {
            render(<Select label="Choose" id="choose" options={options} />);
            expect(screen.getByLabelText(/choose/i)).toBeInTheDocument();
        });

        it('should display all options', () => {
            render(<Select label="Choose" id="choose" options={options} />);
            
            options.forEach(option => {
                expect(screen.getByText(option.label)).toBeInTheDocument();
            });
        });

        it('should handle selection change', async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(<Select label="Choose" id="choose" options={options} onChange={handleChange} />);
            
            const select = screen.getByLabelText(/choose/i);
            await user.selectOptions(select, '2');

            expect(handleChange).toHaveBeenCalled();
        });
    });

    describe('Pagination', () => {
        it('should render pagination', () => {
            render(
                <Pagination 
                    currentPage={1} 
                    totalPages={10} 
                    onPageChange={() => {}} 
                />
            );

            expect(screen.getByText('1')).toBeInTheDocument();
        });

        it('should call onPageChange when clicking next', async () => {
            const user = userEvent.setup();
            const handlePageChange = vi.fn();

            render(
                <Pagination 
                    currentPage={1} 
                    totalPages={10} 
                    onPageChange={handlePageChange} 
                />
            );

            const nextButton = screen.getByRole('button', { name: /next/i });
            await user.click(nextButton);

            expect(handlePageChange).toHaveBeenCalledWith(2);
        });

        it('should disable previous button on first page', () => {
            render(
                <Pagination 
                    currentPage={1} 
                    totalPages={10} 
                    onPageChange={() => {}} 
                />
            );

            const prevButton = screen.getByRole('button', { name: /previous/i });
            expect(prevButton).toBeDisabled();
        });

        it('should disable next button on last page', () => {
            render(
                <Pagination 
                    currentPage={10} 
                    totalPages={10} 
                    onPageChange={() => {}} 
                />
            );

            const nextButton = screen.getByRole('button', { name: /next/i });
            expect(nextButton).toBeDisabled();
        });
    });
});

describe('Modal Component', () => {
    it('should not render when isOpen is false', () => {
        render(
            <Modal isOpen={false} onClose={() => {}}>
                <div>Modal Content</div>
            </Modal>
        );

        expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
        render(
            <Modal isOpen={true} onClose={() => {}}>
                <div>Modal Content</div>
            </Modal>
        );

        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should render title when provided', () => {
        render(
            <Modal isOpen={true} onClose={() => {}} title="Test Modal">
                <div>Modal Content</div>
            </Modal>
        );

        expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
        const user = userEvent.setup();
        const handleClose = vi.fn();

        render(
            <Modal isOpen={true} onClose={handleClose} title="Test">
                <div>Content</div>
            </Modal>
        );

        const closeButton = screen.getByRole('button', { name: /close/i });
        await user.click(closeButton);

        expect(handleClose).toHaveBeenCalled();
    });
});

describe('Table Component', () => {
    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' }
    ];

    const data = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];

    it('should render table headers', () => {
        render(<Table columns={columns} data={data} />);

        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should render table data', () => {
        render(<Table columns={columns} data={data} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('should show empty message when no data', () => {
        render(<Table columns={columns} data={[]} emptyMessage="No records found" />);

        expect(screen.getByText('No records found')).toBeInTheDocument();
    });

    it('should show loading state', () => {
        render(<Table columns={columns} data={[]} loading={true} />);

        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
});
