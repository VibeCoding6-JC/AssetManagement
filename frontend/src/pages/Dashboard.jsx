import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axios";
import { Card, Badge, getStatusVariant } from "../components/ui";
import { 
    HiOutlineDesktopComputer,
    HiOutlineUserGroup,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineCog,
    HiOutlineArchive,
    HiOutlineArrowRight
} from "react-icons/hi";
import dayjs from "dayjs";

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await axiosInstance.get("/api/dashboard/stats");
            setStats(response.data.data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const statCards = [
        { 
            title: "Total Assets", 
            value: stats?.summary?.totalAssets || 0, 
            icon: HiOutlineDesktopComputer,
            color: "bg-blue-500",
            link: "/assets"
        },
        { 
            title: "Available", 
            value: stats?.summary?.available || 0, 
            icon: HiOutlineCheckCircle,
            color: "bg-green-500",
            link: "/assets?status=available"
        },
        { 
            title: "Assigned", 
            value: stats?.summary?.assigned || 0, 
            icon: HiOutlineUserGroup,
            color: "bg-indigo-500",
            link: "/assets?status=assigned"
        },
        { 
            title: "In Repair", 
            value: stats?.summary?.repair || 0, 
            icon: HiOutlineCog,
            color: "bg-yellow-500",
            link: "/assets?status=repair"
        },
        { 
            title: "Retired", 
            value: stats?.summary?.retired || 0, 
            icon: HiOutlineArchive,
            color: "bg-gray-500",
            link: "/assets?status=retired"
        },
        { 
            title: "Missing", 
            value: stats?.summary?.missing || 0, 
            icon: HiOutlineExclamationCircle,
            color: "bg-red-500",
            link: "/assets?status=missing"
        }
    ];

    const getActionTypeLabel = (type) => {
        const labels = {
            checkout: "Checked Out",
            checkin: "Checked In",
            repair: "Sent to Repair",
            complete_repair: "Repair Completed",
            dispose: "Disposed",
            transfer: "Transferred"
        };
        return labels[type] || type;
    };

    const getActionTypeColor = (type) => {
        const colors = {
            checkout: "info",
            checkin: "success",
            repair: "warning",
            complete_repair: "success",
            dispose: "gray",
            transfer: "purple"
        };
        return colors[type] || "gray";
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Overview of your IT assets</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statCards.map((stat) => (
                    <Link key={stat.title} to={stat.link}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <Card.Body className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${stat.color}`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                        <p className="text-sm text-gray-500">{stat.title}</p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assets by Category */}
                <Card>
                    <Card.Header>
                        <h2 className="font-semibold text-gray-900">Assets by Category</h2>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <div className="divide-y divide-gray-100">
                            {stats?.assetsByCategory?.slice(0, 5).map((item, index) => (
                                <div key={index} className="flex items-center justify-between px-6 py-3">
                                    <span className="text-gray-700">{item.category}</span>
                                    <span className="font-medium text-gray-900">{item.count}</span>
                                </div>
                            ))}
                            {stats?.assetsByCategory?.length === 0 && (
                                <div className="px-6 py-8 text-center text-gray-500">
                                    No data available
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>

                {/* Assets by Location */}
                <Card>
                    <Card.Header>
                        <h2 className="font-semibold text-gray-900">Assets by Location</h2>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <div className="divide-y divide-gray-100">
                            {stats?.assetsByLocation?.slice(0, 5).map((item, index) => (
                                <div key={index} className="flex items-center justify-between px-6 py-3">
                                    <span className="text-gray-700">{item.location}</span>
                                    <span className="font-medium text-gray-900">{item.count}</span>
                                </div>
                            ))}
                            {stats?.assetsByLocation?.length === 0 && (
                                <div className="px-6 py-8 text-center text-gray-500">
                                    No data available
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <Card>
                    <Card.Header className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
                        <Link to="/transactions" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            View all <HiOutlineArrowRight className="w-4 h-4" />
                        </Link>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <div className="divide-y divide-gray-100">
                            {stats?.recentTransactions?.slice(0, 5).map((transaction) => (
                                <div key={transaction.uuid} className="px-6 py-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {transaction.asset?.name || "Unknown Asset"}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {transaction.employee?.name || "N/A"} • {dayjs(transaction.transaction_date).format("DD MMM YYYY HH:mm")}
                                            </p>
                                        </div>
                                        <Badge variant={getActionTypeColor(transaction.action_type)}>
                                            {getActionTypeLabel(transaction.action_type)}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            {stats?.recentTransactions?.length === 0 && (
                                <div className="px-6 py-8 text-center text-gray-500">
                                    No recent transactions
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>

                {/* Expiring Warranty */}
                <Card>
                    <Card.Header>
                        <h2 className="font-semibold text-gray-900">Expiring Warranty (30 days)</h2>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <div className="divide-y divide-gray-100">
                            {stats?.expiringWarranty?.map((asset) => (
                                <Link 
                                    key={asset.uuid} 
                                    to={`/assets/${asset.uuid}`}
                                    className="block px-6 py-3 hover:bg-gray-50"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{asset.name}</p>
                                            <p className="text-sm text-gray-500">{asset.asset_tag}</p>
                                        </div>
                                        <Badge variant="warning">
                                            {dayjs(asset.warranty_expiry).format("DD MMM YYYY")}
                                        </Badge>
                                    </div>
                                </Link>
                            ))}
                            {stats?.expiringWarranty?.length === 0 && (
                                <div className="px-6 py-8 text-center text-gray-500">
                                    No assets with expiring warranty
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
