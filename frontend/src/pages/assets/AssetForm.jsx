import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../api/axios";
import { Card, Button, Input, Select } from "../../components/ui";
import { HiOutlineArrowLeft } from "react-icons/hi";
import toast from "react-hot-toast";

const AssetForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [vendors, setVendors] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        asset_tag: "",
        serial_number: "",
        category_id: "",
        location_id: "",
        vendor_id: "",
        condition: "new",
        purchase_date: "",
        purchase_price: "",
        warranty_expiry: "",
        notes: ""
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchOptions();
        if (isEdit) {
            fetchAsset();
        }
    }, [id]);

    const fetchOptions = async () => {
        try {
            const [catRes, locRes, venRes] = await Promise.all([
                axiosInstance.get("/api/categories"),
                axiosInstance.get("/api/locations"),
                axiosInstance.get("/api/vendors")
            ]);
            setCategories(catRes.data.data.map(c => ({ value: c.uuid, label: c.name })));
            setLocations(locRes.data.data.map(l => ({ value: l.uuid, label: l.name })));
            setVendors(venRes.data.data.map(v => ({ value: v.uuid, label: v.name })));
        } catch (error) {
            console.error("Failed to fetch options:", error);
        }
    };

    const fetchAsset = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/assets/${id}`);
            const asset = response.data.data;
            setFormData({
                name: asset.name || "",
                asset_tag: asset.asset_tag || "",
                serial_number: asset.serial_number || "",
                category_id: asset.category?.uuid || "",
                location_id: asset.location?.uuid || "",
                vendor_id: asset.vendor?.uuid || "",
                condition: asset.condition || "new",
                purchase_date: asset.purchase_date?.split("T")[0] || "",
                purchase_price: asset.purchase_price || "",
                warranty_expiry: asset.warranty_expiry?.split("T")[0] || "",
                notes: asset.notes || ""
            });
        } catch (error) {
            console.error("Failed to fetch asset:", error);
            toast.error("Asset not found");
            navigate("/assets");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.asset_tag.trim()) newErrors.asset_tag = "Asset tag is required";
        if (!formData.serial_number.trim()) newErrors.serial_number = "Serial number is required";
        if (!formData.category_id) newErrors.category_id = "Category is required";
        if (!formData.location_id) newErrors.location_id = "Location is required";
        if (!formData.purchase_date) newErrors.purchase_date = "Purchase date is required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            const payload = {
                ...formData,
                purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : 0,
                vendor_id: formData.vendor_id || null,
                warranty_expiry: formData.warranty_expiry || null
            };

            if (isEdit) {
                await axiosInstance.put(`/api/assets/${id}`, payload);
                toast.success("Asset updated successfully");
            } else {
                await axiosInstance.post("/api/assets", payload);
                toast.success("Asset created successfully");
            }
            navigate("/assets");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save asset");
        } finally {
            setSaving(false);
        }
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

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <Link to="/assets">
                    <Button variant="ghost" size="sm">
                        <HiOutlineArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? "Edit Asset" : "Add New Asset"}
                    </h1>
                    <p className="text-gray-500">
                        {isEdit ? "Update asset information" : "Create a new asset record"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <Card.Header>
                                <h2 className="font-semibold text-gray-900">Basic Information</h2>
                            </Card.Header>
                            <Card.Body className="space-y-4">
                                <Input
                                    label="Asset Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. MacBook Pro 14"
                                    error={errors.name}
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Asset Tag"
                                        name="asset_tag"
                                        value={formData.asset_tag}
                                        onChange={handleChange}
                                        placeholder="e.g. AST-LP-001"
                                        error={errors.asset_tag}
                                        required
                                    />
                                    <Input
                                        label="Serial Number"
                                        name="serial_number"
                                        value={formData.serial_number}
                                        onChange={handleChange}
                                        placeholder="e.g. C02XL2THJGH5"
                                        error={errors.serial_number}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        label="Category"
                                        name="category_id"
                                        options={categories}
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        error={errors.category_id}
                                        required
                                    />
                                    <Select
                                        label="Location"
                                        name="location_id"
                                        options={locations}
                                        value={formData.location_id}
                                        onChange={handleChange}
                                        error={errors.location_id}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        label="Vendor"
                                        name="vendor_id"
                                        options={vendors}
                                        value={formData.vendor_id}
                                        onChange={handleChange}
                                        placeholder="Select vendor (optional)"
                                    />
                                    <Select
                                        label="Condition"
                                        name="condition"
                                        options={conditionOptions}
                                        value={formData.condition}
                                        onChange={handleChange}
                                    />
                                </div>
                            </Card.Body>
                        </Card>

                        <Card>
                            <Card.Header>
                                <h2 className="font-semibold text-gray-900">Purchase Details</h2>
                            </Card.Header>
                            <Card.Body className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Purchase Date"
                                        name="purchase_date"
                                        type="date"
                                        value={formData.purchase_date}
                                        onChange={handleChange}
                                        error={errors.purchase_date}
                                        required
                                    />
                                    <Input
                                        label="Purchase Price (IDR)"
                                        name="purchase_price"
                                        type="number"
                                        value={formData.purchase_price}
                                        onChange={handleChange}
                                        placeholder="0"
                                    />
                                </div>
                                <Input
                                    label="Warranty Expiry"
                                    name="warranty_expiry"
                                    type="date"
                                    value={formData.warranty_expiry}
                                    onChange={handleChange}
                                />
                            </Card.Body>
                        </Card>

                        <Card>
                            <Card.Header>
                                <h2 className="font-semibold text-gray-900">Additional Notes</h2>
                            </Card.Header>
                            <Card.Body>
                                <textarea
                                    name="notes"
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Any additional notes about this asset..."
                                    value={formData.notes}
                                    onChange={handleChange}
                                />
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div>
                        <Card className="sticky top-6">
                            <Card.Body className="space-y-4">
                                <Button 
                                    type="submit" 
                                    className="w-full" 
                                    loading={saving}
                                >
                                    {isEdit ? "Update Asset" : "Create Asset"}
                                </Button>
                                <Link to="/assets" className="block">
                                    <Button type="button" variant="secondary" className="w-full">
                                        Cancel
                                    </Button>
                                </Link>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AssetForm;
