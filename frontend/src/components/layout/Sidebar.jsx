import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
    HiOutlineHome,
    HiOutlineDesktopComputer,
    HiOutlineUserGroup,
    HiOutlineCollection,
    HiOutlineLocationMarker,
    HiOutlineOfficeBuilding,
    HiOutlineClipboardList,
    HiOutlineLogout,
    HiOutlineMenu,
    HiOutlineX,
    HiOutlineChevronDown,
    HiOutlineUser
} from "react-icons/hi";

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const menuItems = [
        {
            name: "Dashboard",
            icon: HiOutlineHome,
            path: "/dashboard"
        },
        {
            name: "Assets",
            icon: HiOutlineDesktopComputer,
            path: "/assets"
        },
        {
            name: "Transactions",
            icon: HiOutlineClipboardList,
            path: "/transactions"
        },
        {
            name: "Master Data",
            icon: HiOutlineCollection,
            children: [
                { name: "Categories", path: "/categories", icon: HiOutlineCollection },
                { name: "Locations", path: "/locations", icon: HiOutlineLocationMarker },
                { name: "Vendors", path: "/vendors", icon: HiOutlineOfficeBuilding }
            ]
        },
        {
            name: "Users",
            icon: HiOutlineUserGroup,
            path: "/users",
            adminOnly: true
        }
    ];

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + "/");
    };

    const toggleDropdown = (name) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    return (
        <aside className={`fixed left-0 top-0 z-40 h-screen bg-gray-900 text-white transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <HiOutlineDesktopComputer className="w-8 h-8 text-blue-500" />
                        <span className="font-bold text-lg">IT Asset</span>
                    </div>
                )}
                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    {collapsed ? <HiOutlineMenu className="w-5 h-5" /> : <HiOutlineX className="w-5 h-5" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        // Skip admin-only items for non-admins
                        if (item.adminOnly && !isAdmin()) return null;

                        if (item.children) {
                            return (
                                <li key={item.name}>
                                    <button
                                        onClick={() => toggleDropdown(item.name)}
                                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors ${
                                            item.children.some(child => isActive(child.path)) ? "bg-gray-800 text-blue-400" : ""
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="w-5 h-5 flex-shrink-0" />
                                            {!collapsed && <span>{item.name}</span>}
                                        </div>
                                        {!collapsed && (
                                            <HiOutlineChevronDown className={`w-4 h-4 transition-transform ${openDropdown === item.name ? "rotate-180" : ""}`} />
                                        )}
                                    </button>
                                    {!collapsed && openDropdown === item.name && (
                                        <ul className="mt-1 ml-4 space-y-1">
                                            {item.children.map((child) => (
                                                <li key={child.path}>
                                                    <Link
                                                        to={child.path}
                                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${
                                                            isActive(child.path) ? "bg-blue-600 text-white" : "text-gray-400"
                                                        }`}
                                                    >
                                                        <child.icon className="w-4 h-4" />
                                                        <span className="text-sm">{child.name}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            );
                        }

                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors ${
                                        isActive(item.path) ? "bg-blue-600 text-white" : ""
                                    }`}
                                    title={collapsed ? item.name : ""}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    {!collapsed && <span>{item.name}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Info & Logout */}
            <div className="border-t border-gray-800 p-4">
                <div className={`flex items-center gap-3 mb-3 ${collapsed ? "justify-center" : ""}`}>
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <HiOutlineUser className="w-5 h-5" />
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors ${collapsed ? "justify-center" : ""}`}
                    title={collapsed ? "Logout" : ""}
                >
                    <HiOutlineLogout className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
