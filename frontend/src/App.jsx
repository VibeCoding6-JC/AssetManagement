import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { MainLayout, RequireAuth } from "./components/layout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// Asset Pages
import { AssetList, AssetDetail, AssetForm } from "./pages/assets";

// User Pages
import { UserList } from "./pages/users";

// Master Data Pages
import { CategoryList } from "./pages/categories";
import { LocationList } from "./pages/locations";
import { VendorList } from "./pages/vendors";

// Transaction Pages
import { TransactionList } from "./pages/transactions";

// Chat Page
import Chat from "./pages/Chat";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                    }}
                />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    
                    {/* Redirect root to dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* Protected Routes */}
                    <Route
                        element={
                            <RequireAuth>
                                <MainLayout />
                            </RequireAuth>
                        }
                    >
                        {/* Dashboard */}
                        <Route path="/dashboard" element={<Dashboard />} />
                        
                        {/* Assets */}
                        <Route path="/assets" element={<AssetList />} />
                        <Route path="/assets/create" element={<AssetForm />} />
                        <Route path="/assets/:id" element={<AssetDetail />} />
                        <Route path="/assets/:id/edit" element={<AssetForm />} />
                        
                        {/* Transactions */}
                        <Route path="/transactions" element={<TransactionList />} />
                        
                        {/* Master Data */}
                        <Route path="/categories" element={<CategoryList />} />
                        <Route path="/locations" element={<LocationList />} />
                        <Route path="/vendors" element={<VendorList />} />
                        
                        {/* Users - Admin Only */}
                        <Route
                            path="/users"
                            element={
                                <RequireAuth allowedRoles={["admin"]}>
                                    <UserList />
                                </RequireAuth>
                            }
                        />
                        
                        {/* AI Chat */}
                        <Route path="/chat" element={<Chat />} />
                    </Route>
                    
                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
