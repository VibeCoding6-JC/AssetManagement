import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session on mount
        const initAuth = async () => {
            const token = localStorage.getItem("accessToken");
            const savedUser = localStorage.getItem("user");

            if (token && savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                    // Verify token is still valid
                    const response = await axiosInstance.get("/api/auth/me");
                    setUser(response.data.data);
                    localStorage.setItem("user", JSON.stringify(response.data.data));
                } catch (error) {
                    // Token invalid, clear storage
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        const response = await axiosInstance.post("/api/auth/login", {
            email,
            password
        });

        const { user: userData, accessToken } = response.data.data;
        
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        return response.data;
    };

    const logout = async () => {
        try {
            await axiosInstance.delete("/api/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            setUser(null);
        }
    };

    const isAdmin = () => user?.role === "admin";
    const isStaff = () => user?.role === "staff";
    const isStaffOrAdmin = () => user?.role === "admin" || user?.role === "staff";

    const value = {
        user,
        loading,
        login,
        logout,
        isAdmin,
        isStaff,
        isStaffOrAdmin,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;
