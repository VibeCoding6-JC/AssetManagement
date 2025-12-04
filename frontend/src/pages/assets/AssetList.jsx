import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axios";
import { 
    Card, 
    Button, 
    Badge, 
    SearchInput, 
    Select, 
    Table, 
    Pagination,
    getStatusVariant,
    getConditionVariant 
} from "../../components/ui";
import { HiOutlinePlus, HiOutlineEye, HiOutlinePencil } from "react-icons/hi";
import dayjs from "dayjs";

const AssetList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
    
    // Filters
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [status, setStatus] = useState(searchParams.get("status") || "");
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
    const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "");

    useEffect(() => {
        fetchFilters();
    }, []);

    useEffect(() => {
        fetchAssets();
    }, [searchParams]);

    const fetchFilters = async () => {
        try {
            const [catRes, locRes] = await Promise.all([
                axiosInstance.get("/api/categories"),
                axiosInstance.get("/api/locations")
            ]);
            setCategories(catRes.data.data.map(c => ({ value: c.uuid, label: c.name })));
            setLocations(locRes.data.data.map(l => ({ value: l.uuid, label: l.name })));
        } catch (error) {
            console.error("Failed to fetch filters:", error);
        }
    };

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(searchParams);
            const response = await axiosInstance.get(`/api/assets?${params.toString()}`);
            setAssets(response.data.data);
            setMeta(response.data.meta);
        } catch (error) {
            console.error("Failed to fetch assets:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (status) params.set("status", status);
        if (selectedCategory) params.set("category", selectedCategory);
        if (selectedLocation) params.set("location", selectedLocation);
        params.set("page", "1");
        setSearchParams(params);
    };

    const handlePageChange = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", page.toString());
        setSearchParams(params);
    };

    const handleClearFilters = () => {
        setSearch("");
        setStatus("");
        setSelectedCategory("");
        setSelectedLocation("");
        setSearchParams(new URLSearchParams());
    };

    const statusOptions = [
        { value: "available", label: "Available" },
        { value: "assigned", label: "Assigned" },
        { value: "repair", label: "In Repair" },
        { value: "retired", label: "Retired" },
        { value: "missing", label: "Missing" }
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
                    <p className="text-gray-500">Manage your IT assets</p>
                </div>
                <Link to="/assets/create">
                    <Button>
                        <HiOutlinePlus className="w-5 h-5 mr-2" />
                        Add Asset
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card>
                <Card.Body>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder="Search assets..."
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <Select
                            options={statusOptions}
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            placeholder="All Status"
                        />
                        <Select
                            options={categories}
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            placeholder="All Categories"
                        />
                        <Select
                            options={locations}
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            placeholder="All Locations"
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleSearch} className="flex-1">
                                Search
                            </Button>
                            <Button variant="secondary" onClick={handleClearFilters}>
                                Clear
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Assets Table */}
            <Card>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <p>No assets found</p>
                            <Link to="/assets/create" className="mt-2 text-blue-600 hover:text-blue-700">
                                Add your first asset
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <Table.Head>
                                    <Table.Row>
                                        <Table.Header>Asset</Table.Header>
                                        <Table.Header>Category</Table.Header>
                                        <Table.Header>Location</Table.Header>
                                        <Table.Header>Status</Table.Header>
                                        <Table.Header>Condition</Table.Header>
                                        <Table.Header>Holder</Table.Header>
                                        <Table.Header>Value</Table.Header>
                                        <Table.Header className="text-right">Actions</Table.Header>
                                    </Table.Row>
                                </Table.Head>
                                <Table.Body>
                                    {assets.map((asset) => (
                                        <Table.Row key={asset.uuid}>
                                            <Table.Cell>
                                                <div>
                                                    <p className="font-medium text-gray-900">{asset.name}</p>
                                                    <p className="text-sm text-gray-500">{asset.asset_tag}</p>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>{asset.category?.name}</Table.Cell>
                                            <Table.Cell>{asset.location?.name}</Table.Cell>
                                            <Table.Cell>
                                                <Badge variant={getStatusVariant(asset.status)}>
                                                    {asset.status}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Badge variant={getConditionVariant(asset.condition)}>
                                                    {asset.condition}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell>
                                                {asset.holder?.name || "-"}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {formatCurrency(asset.purchase_price)}
                                            </Table.Cell>
                                            <Table.Cell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link to={`/assets/${asset.uuid}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <HiOutlineEye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link to={`/assets/${asset.uuid}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <HiOutlinePencil className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
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

export default AssetList;
