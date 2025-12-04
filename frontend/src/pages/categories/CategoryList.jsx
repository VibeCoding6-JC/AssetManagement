import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";
import { Card, Button, Table, Modal, Input, SearchInput } from "../../components/ui";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import toast from "react-hot-toast";

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchCategories();
    }, [search]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/categories?search=${search}`);
            setCategories(response.data.data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditItem(null);
        setFormData({ name: "", description: "" });
        setErrors({});
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditItem(item);
        setFormData({ name: item.name, description: item.description || "" });
        setErrors({});
        setModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setErrors({ name: "Name is required" });
            return;
        }

        setSaving(true);
        try {
            if (editItem) {
                await axiosInstance.put(`/api/categories/${editItem.uuid}`, formData);
                toast.success("Category updated successfully");
            } else {
                await axiosInstance.post("/api/categories", formData);
                toast.success("Category created successfully");
            }
            setModalOpen(false);
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save category");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;

        try {
            await axiosInstance.delete(`/api/categories/${item.uuid}`);
            toast.success("Category deleted successfully");
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete category");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-500">Manage asset categories</p>
                </div>
                <Button onClick={openCreateModal}>
                    <HiOutlinePlus className="w-5 h-5 mr-2" />
                    Add Category
                </Button>
            </div>

            <Card>
                <Card.Body>
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Search categories..."
                        className="max-w-md"
                    />
                </Card.Body>
            </Card>

            <Card>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <p>No categories found</p>
                        </div>
                    ) : (
                        <Table>
                            <Table.Head>
                                <Table.Row>
                                    <Table.Header>Name</Table.Header>
                                    <Table.Header>Description</Table.Header>
                                    <Table.Header>Assets</Table.Header>
                                    <Table.Header className="text-right">Actions</Table.Header>
                                </Table.Row>
                            </Table.Head>
                            <Table.Body>
                                {categories.map((item) => (
                                    <Table.Row key={item.uuid}>
                                        <Table.Cell className="font-medium">{item.name}</Table.Cell>
                                        <Table.Cell className="text-gray-500 max-w-md truncate">
                                            {item.description || "-"}
                                        </Table.Cell>
                                        <Table.Cell>{item.assetCount || 0}</Table.Cell>
                                        <Table.Cell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>
                                                    <HiOutlinePencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
                                                    <HiOutlineTrash className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <Modal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                title={editItem ? "Edit Category" : "Add Category"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={saving}>
                            {editItem ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CategoryList;
