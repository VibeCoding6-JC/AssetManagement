import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axios";
import { Card, Badge, Select, Table, Pagination, Input } from "../../components/ui";
import dayjs from "dayjs";

const TransactionList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
    
    const [actionType, setActionType] = useState(searchParams.get("action_type") || "");
    const [startDate, setStartDate] = useState(searchParams.get("start_date") || "");
    const [endDate, setEndDate] = useState(searchParams.get("end_date") || "");

    useEffect(() => {
        fetchTransactions();
    }, [searchParams]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(searchParams);
            const response = await axiosInstance.get(`/api/transactions?${params.toString()}`);
            setTransactions(response.data.data);
            setMeta(response.data.meta);
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        const params = new URLSearchParams();
        if (actionType) params.set("action_type", actionType);
        if (startDate) params.set("start_date", startDate);
        if (endDate) params.set("end_date", endDate);
        params.set("page", "1");
        setSearchParams(params);
    };

    const handlePageChange = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", page.toString());
        setSearchParams(params);
    };

    const actionTypeOptions = [
        { value: "checkout", label: "Checkout" },
        { value: "checkin", label: "Checkin" },
        { value: "repair", label: "Repair" },
        { value: "complete_repair", label: "Complete Repair" },
        { value: "dispose", label: "Dispose" }
    ];

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

    const getActionTypeColor = (type) => {
        const colors = {
            checkout: "info",
            checkin: "success",
            repair: "warning",
            complete_repair: "success",
            dispose: "gray"
        };
        return colors[type] || "gray";
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                <p className="text-gray-500">View asset transaction history</p>
            </div>

            <Card>
                <Card.Body>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Select
                            options={actionTypeOptions}
                            value={actionType}
                            onChange={(e) => setActionType(e.target.value)}
                            placeholder="All Actions"
                        />
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            placeholder="Start Date"
                        />
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            placeholder="End Date"
                        />
                        <button
                            onClick={handleFilter}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Filter
                        </button>
                    </div>
                </Card.Body>
            </Card>

            <Card>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <p>No transactions found</p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <Table.Head>
                                    <Table.Row>
                                        <Table.Header>Date</Table.Header>
                                        <Table.Header>Asset</Table.Header>
                                        <Table.Header>Action</Table.Header>
                                        <Table.Header>User</Table.Header>
                                        <Table.Header>Processed By</Table.Header>
                                        <Table.Header>Notes</Table.Header>
                                    </Table.Row>
                                </Table.Head>
                                <Table.Body>
                                    {transactions.map((tx) => (
                                        <Table.Row key={tx.uuid}>
                                            <Table.Cell>
                                                {dayjs(tx.transaction_date).format("DD MMM YYYY HH:mm")}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Link 
                                                    to={`/assets/${tx.asset?.uuid}`}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <div>
                                                        <p className="font-medium">{tx.asset?.name}</p>
                                                        <p className="text-sm text-gray-500">{tx.asset?.asset_tag}</p>
                                                    </div>
                                                </Link>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Badge variant={getActionTypeColor(tx.action_type)}>
                                                    {getActionTypeLabel(tx.action_type)}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell>
                                                {tx.employee ? (
                                                    <div>
                                                        <p className="font-medium">{tx.employee.name}</p>
                                                        <p className="text-sm text-gray-500">{tx.employee.department}</p>
                                                    </div>
                                                ) : "-"}
                                            </Table.Cell>
                                            <Table.Cell>{tx.admin?.name || "-"}</Table.Cell>
                                            <Table.Cell className="max-w-xs truncate">
                                                {tx.notes || "-"}
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                            <Pagination
                                currentPage={meta.page}
                                totalPages={meta.totalPages}
                                totalItems={meta.total}
                                itemsPerPage={meta.limit}
                                onPageChange={handlePageChange}
                            />
                        </>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default TransactionList;
