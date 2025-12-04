const Badge = ({ children, variant = "gray", className = "" }) => {
    const variants = {
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        gray: "bg-gray-100 text-gray-800",
        purple: "bg-purple-100 text-purple-800"
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

// Helper function to get status badge variant
export const getStatusVariant = (status) => {
    const statusMap = {
        available: "success",
        assigned: "info",
        repair: "warning",
        retired: "gray",
        missing: "danger"
    };
    return statusMap[status] || "gray";
};

// Helper function to get condition badge variant
export const getConditionVariant = (condition) => {
    const conditionMap = {
        new: "success",
        good: "info",
        fair: "warning",
        poor: "danger"
    };
    return conditionMap[condition] || "gray";
};

export default Badge;
