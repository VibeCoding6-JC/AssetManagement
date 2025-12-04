import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axios";
import { 
    Card, 
    Button, 
    Badge, 
    SearchInput, 
    Select, 
    Table, 
    Pagination,
    Modal,
    Input
} from "../../components/ui";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import toast from "react-hot-toast";

const UserList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
    
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [role, setRole] = useState(searchParams.get("role") || "");
    
    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "employee",
        department: "",
        phone: ""
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchUsers();
    }, [searchParams]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(searchParams);
            const response = await axiosInstance.get(`/api/users?${params.toString()}`);
            setUsers(response.data.data);
            setMeta(response.data.meta);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (role) params.set("role", role);
        params.set("page", "1");
        setSearchParams(params);
    };

    const handlePageChange = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", page.toString());
        setSearchParams(params);
    };

    const openCreateModal = () => {
        setEditUser(null);
        setFormData({
            name: "",
            email: "",
            password: "",
            role: "employee",
            department: "",
            phone: ""
        });
        setErrors({});
        setModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
            department: user.department || "",
            phone: user.phone || ""
        });
        setErrors({});
        setModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (!editUser && !formData.password) newErrors.password = "Password is required for new user";
        if (formData.password && formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            const payload = { ...formData };
            if (!payload.password) delete payload.password;

            if (editUser) {
                await axiosInstance.put(`/api/users/${editUser.uuid}`, payload);
                toast.success("User updated successfully");
            } else {
                await axiosInstance.post("/api/users", payload);
                toast.success("User created successfully");
            }
            setModalOpen(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save user");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Are you sure you want to deactivate ${user.name}?`)) return;

        try {
            await axiosInstance.delete(`/api/users/${user.uuid}`);
            toast.success("User deactivated successfully");
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to deactivate user");
        }
    };

    const roleOptions = [
        { value: "admin", label: "Admin" },
        { value: "staff", label: "Staff" },
        { value: "employee", label: "Employee" }
    ];

    const getRoleVariant = (role) => {
        const variants = { admin: "danger", staff: "info", employee: "gray" };
        return variants[role] || "gray";
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-500">Manage users and employees</p>
                </div>
                <Button onClick={openCreateModal}>
                    <HiOutlinePlus className="w-5 h-5 mr-2" />
                    Add User
                </Button>
            </div>

            <Card>
                <Card.Body>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder="Search users..."
                            className="md:col-span-2"
                        />
                        <Select
                            options={roleOptions}
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="All Roles"
                        />
                        <Button onClick={handleSearch}>Search</Button>
                    </div>
                </Card.Body>
            </Card>

            <Card>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <p>No users found</p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <Table.Head>
                                    <Table.Row>
                                        <Table.Header>Name</Table.Header>
                                        <Table.Header>Email</Table.Header>
                                        <Table.Header>Role</Table.Header>
                                        <Table.Header>Department</Table.Header>
                                        <Table.Header>Status</Table.Header>
                                        <Table.Header className="text-right">Actions</Table.Header>
                                    </Table.Row>
                                </Table.Head>
                                <Table.Body>
                                    {users.map((user) => (
                                        <Table.Row key={user.uuid}>
                                            <Table.Cell className="font-medium">{user.name}</Table.Cell>
                                            <Table.Cell>{user.email}</Table.Cell>
                                            <Table.Cell>
                                                <Badge variant={getRoleVariant(user.role)}>
                                                    {user.role}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell>{user.department || "-"}</Table.Cell>
                                            <Table.Cell>
                                                <Badge variant={user.is_active ? "success" : "gray"}>
                                                    {user.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => openEditModal(user)}>
                                                        <HiOutlinePencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(user)}>
                                                        <HiOutlineTrash className="w-4 h-4 text-red-500" />
                                                    </Button>
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

            {/* User Modal */}
            <Modal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                title={editUser ? "Edit User" : "Add User"}
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
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                    />
                    <Input
                        label={editUser ? "Password (leave empty to keep current)" : "Password"}
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        required={!editUser}
                    />
                    <Select
                        label="Role"
                        name="role"
                        options={roleOptions}
                        value={formData.role}
                        onChange={handleChange}
                    />
                    <Input
                        label="Department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                    />
                    <Input
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={saving}>
                            {editUser ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UserList;
