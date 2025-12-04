const Card = ({ children, className = "", ...props }) => {
    return (
        <div 
            className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

const CardHeader = ({ children, className = "" }) => {
    return (
        <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
            {children}
        </div>
    );
};

const CardBody = ({ children, className = "" }) => {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    );
};

const CardFooter = ({ children, className = "" }) => {
    return (
        <div className={`px-6 py-4 border-t border-gray-100 ${className}`}>
            {children}
        </div>
    );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
