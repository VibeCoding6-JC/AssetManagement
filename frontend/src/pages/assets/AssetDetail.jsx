import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { 
    Card, 
    Button, 
    Badge, 
    Modal,
    Select,
    Input,
    Table,
    getStatusVariant,
    getConditionVariant 
} from "../../components/ui";
import { 
    HiOutlinePencil, 
    HiOutlineArrowLeft,
    HiOutlineUserAdd,
    HiOutlineUserRemove,
    HiOutlineCog,
    HiOutlineCheckCircle,
    HiOutlineTrash
} from "react-icons/hi";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const AssetDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin, isStaffOrAdmin } = useAuth();
    
    const [asset, setAsset] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Modals
    const [checkoutModal, setCheckoutModal] = useState(false);
    const [checkinModal, setCheckinModal] = useState(false);
    const [repairModal, setRepairModal] = useState(false);
    const [completeRepairModal, setCompleteRepairModal] = useState(false);
    
    // Form data
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [expectedReturnDate, setExpectedReturnDate] = useState("");
    const [conditionAfter, setConditionAfter] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        fetchAsset();
        fetchHistory();
        fetchUsers();
    }, [id]);

    const fetchAsset = async () => {
        try {
            const response = await axiosInstance.get(`/api/assets/${id}`);
            setAsset(response.data.data);
        } catch (error) {
            console.error("Failed to fetch asset:", error);
            toast.error("Asset not found");
            navigate("/assets");
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await axiosInstance.get(`/api/assets/${id}/history`);
            setHistory(response.data.data);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get("/api/users?limit=100");
            setUsers(response.data.data.map(u => ({ value: u.uuid, label: `${u.name} (${u.department})` })));
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    const handleCheckout = async () => {
        if (!selectedUser) {
            toast.error("Please select a user");
            return;
        }
        
        setActionLoading(true);
        try {
            await axiosInstance.post("/api/transactions/checkout", {
                asset_id: id,
                user_id: selectedUser,
                expected_return_date: expectedReturnDate || null,
                notes
            });
            toast.success("Asset checked out successfully");
            setCheckoutModal(false);
            resetForm();
            fetchAsset();
            fetchHistory();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to checkout asset");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckin = async () => {
        setActionLoading(true);
        try {
            await axiosInstance.post("/api/transactions/checkin", {
                asset_id: id,
                condition_after: conditionAfter || null,
                notes
            });
            toast.success("Asset checked in successfully");
            setCheckinModal(false);
            resetForm();
            fetchAsset();
            fetchHistory();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to checkin asset");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendToRepair = async () => {
        setActionLoading(true);
        try {
            await axiosInstance.post("/api/transactions/repair", {
                asset_id: id,
                notes
            });
            toast.success("Asset sent to repair");
            setRepairModal(false);
            resetForm();
            fetchAsset();
            fetchHistory();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send to repair");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCompleteRepair = async () => {
        setActionLoading(true);
        try {
            await axiosInstance.post("/api/transactions/complete-repair", {
                asset_id: id,
                condition_after: conditionAfter || "good",
                notes
            });
            toast.success("Repair completed");
            setCompleteRepairModal(false);
            resetForm();
            fetchAsset();
            fetchHistory();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to complete repair");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDispose = async () => {
        if (!window.confirm("Are you sure you want to dispose this asset? This action cannot be undone.")) {
            return;
        }
        
        setActionLoading(true);
        try {
            await axiosInstance.post("/api/transactions/dispose", {
                asset_id: id,
                notes: "Asset disposed"
            });
            toast.success("Asset disposed successfully");
            fetchAsset();
            fetchHistory();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to dispose asset");
        } finally {
            setActionLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedUser("");
        setExpectedReturnDate("");
        setConditionAfter("");
        setNotes("");
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getActionTypeLabel = (type) => {
        const labels = {
            checkout: "Checked Out",
            checkin: "Checked In",
            repair: "Sent to Repair",
            complete_repair: "Repair Completed",
            dispose: "Disposed"
        };
        return labels[type] || type;
    };

    const conditionOptions = [
        { value: "new", label: "New" },
        { value: "good", label: "Good" },
        { value: "fair", label: "Fair" },
        { value: "poor", label: "Poor" }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!asset) return null;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/assets">
                        <Button variant="ghost" size="sm">
                            <HiOutlineArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
                        <p className="text-gray-500">{asset.asset_tag}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link to={`/assets/${id}/edit`}>
                        <Button variant="secondary">
                            <HiOutlinePencil className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Action Buttons */}
            {isStaffOrAdmin() && (
                <Card>
                    <Card.Body>
                        <div className="flex flex-wrap gap-3">
                            {asset.status === "available" && (
                                <>
                                    <Button onClick={() => setCheckoutModal(true)}>
                                        <HiOutlineUserAdd className="w-4 h-4 mr-2" />
                                        Checkout
                                    </Button>
                                    <Button variant="warning" onClick={() => setRepairModal(true)}>
                                        <HiOutlineCog className="w-4 h-4 mr-2" />
                                        Send to Repair
                                    </Button>
                                </>
                            )}
                            {asset.status === "assigned" && (
                                <>
                                    <Button variant="success" onClick={() => setCheckinModal(true)}>
                                        <HiOutlineUserRemove className="w-4 h-4 mr-2" />
                                        Checkin
                                    </Button>
                                    <Button variant="warning" onClick={() => setRepairModal(true)}>
                                        <HiOutlineCog className="w-4 h-4 mr-2" />
                                        Send to Repair
                                    </Button>
                                </>
                            )}
                            {asset.status === "repair" && (
                                <Button variant="success" onClick={() => setCompleteRepairModal(true)}>
                                    <HiOutlineCheckCircle className="w-4 h-4 mr-2" />
                                    Complete Repair
                                </Button>
                            )}
                            {isAdmin() && asset.status !== "retired" && asset.status !== "assigned" && (
                                <Button variant="danger" onClick={handleDispose}>
                                    <HiOutlineTrash className="w-4 h-4 mr-2" />
                                    Dispose
                                </Button>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Asset Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <Card.Header>
                            <h2 className="font-semibold text-gray-900">Asset Information</h2>
                        </Card.Header>
                        <Card.Body>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500">Asset Tag</p>
                                    <p className="font-medium">{asset.asset_tag}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Serial Number</p>
                                    <p className="font-medium">{asset.serial_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Category</p>
                                    <p className="font-medium">{asset.category?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p className="font-medium">{asset.location?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge variant={getStatusVariant(asset.status)}>{asset.status}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Condition</p>
                                    <Badge variant={getConditionVariant(asset.condition)}>{asset.condition}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Purchase Date</p>
                                    <p className="font-medium">{dayjs(asset.purchase_date).format("DD MMM YYYY")}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Purchase Price</p>
                                    <p className="font-medium">{formatCurrency(asset.purchase_price)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Warranty Expiry</p>
                                    <p className="font-medium">
                                        {asset.warranty_expiry 
                                            ? dayjs(asset.warranty_expiry).format("DD MMM YYYY")
                                            : "-"
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Vendor</p>
                                    <p className="font-medium">{asset.vendor?.name || "-"}</p>
                                </div>
                            </div>
                            {asset.notes && (
                                <div className="mt-6 pt-6 border-t">
                                    <p className="text-sm text-gray-500">Notes</p>
                                    <p className="mt-1">{asset.notes}</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Transaction History */}
                    <Card>
                        <Card.Header>
                            <h2 className="font-semibold text-gray-900">Transaction History</h2>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {history.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    No transaction history
                                </div>
                            ) : (
                                <Table>
                                    <Table.Head>
                                        <Table.Row>
                                            <Table.Header>Date</Table.Header>
                                            <Table.Header>Action</Table.Header>
                                            <Table.Header>User</Table.Header>
                                            <Table.Header>Processed By</Table.Header>
                                            <Table.Header>Notes</Table.Header>
                                        </Table.Row>
                                    </Table.Head>
                                    <Table.Body>
                                        {history.map((tx) => (
                                            <Table.Row key={tx.uuid}>
                                                <Table.Cell>
                                                    {dayjs(tx.transaction_date).format("DD MMM YYYY HH:mm")}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Badge variant={getStatusVariant(tx.action_type === "checkout" ? "assigned" : "available")}>
                                                        {getActionTypeLabel(tx.action_type)}
                                                    </Badge>
                                                </Table.Cell>
                                                <Table.Cell>{tx.employee?.name || "-"}</Table.Cell>
                                                <Table.Cell>{tx.admin?.name}</Table.Cell>
                                                <Table.Cell className="max-w-xs truncate">
                                                    {tx.notes || "-"}
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Current Holder */}
                    <Card>
                        <Card.Header>
                            <h2 className="font-semibold text-gray-900">Current Holder</h2>
                        </Card.Header>
                        <Card.Body>
                            {asset.holder ? (
                                <div>
                                    <p className="font-medium text-lg">{asset.holder.name}</p>
                                    <p className="text-gray-500">{asset.holder.email}</p>
                                    <p className="text-gray-500">{asset.holder.department}</p>
                                    {asset.holder.phone && (
                                        <p className="text-gray-500">{asset.holder.phone}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">Not assigned</p>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Specifications */}
                    {asset.specifications && (
                        <Card>
                            <Card.Header>
                                <h2 className="font-semibold text-gray-900">Specifications</h2>
                            </Card.Header>
                            <Card.Body>
                                <div className="space-y-2">
                                    {Object.entries(JSON.parse(asset.specifications)).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="text-gray-500 capitalize">{key.replace(/_/g, " ")}</span>
                                            <span className="font-medium">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                </div>
            </div>

            {/* Checkout Modal */}
            <Modal isOpen={checkoutModal} onClose={() => setCheckoutModal(false)} title="Checkout Asset">
                <div className="space-y-4">
                    <Select
                        label="Assign to User"
                        options={users}
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        required
                    />
                    <Input
                        label="Expected Return Date"
                        type="date"
                        value={expectedReturnDate}
                        onChange={(e) => setExpectedReturnDate(e.target.value)}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setCheckoutModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCheckout} loading={actionLoading}>
                            Checkout
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Checkin Modal */}
            <Modal isOpen={checkinModal} onClose={() => setCheckinModal(false)} title="Checkin Asset">
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Return asset from: <strong>{asset.holder?.name}</strong>
                    </p>
                    <Select
                        label="Condition After Return"
                        options={conditionOptions}
                        value={conditionAfter}
                        onChange={(e) => setConditionAfter(e.target.value)}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setCheckinModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="success" onClick={handleCheckin} loading={actionLoading}>
                            Checkin
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Repair Modal */}
            <Modal isOpen={repairModal} onClose={() => setRepairModal(false)} title="Send to Repair">
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to send this asset to repair?
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Notes</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Describe the issue..."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setRepairModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="warning" onClick={handleSendToRepair} loading={actionLoading}>
                            Send to Repair
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Complete Repair Modal */}
            <Modal isOpen={completeRepairModal} onClose={() => setCompleteRepairModal(false)} title="Complete Repair">
                <div className="space-y-4">
                    <Select
                        label="Condition After Repair"
                        options={conditionOptions}
                        value={conditionAfter}
                        onChange={(e) => setConditionAfter(e.target.value)}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Describe repairs made..."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setCompleteRepairModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="success" onClick={handleCompleteRepair} loading={actionLoading}>
                            Complete Repair
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AssetDetail;
