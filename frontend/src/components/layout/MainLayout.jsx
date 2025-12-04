import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Toaster } from "react-hot-toast";

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster 
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: "#363636",
                        color: "#fff",
                    },
                    success: {
                        iconTheme: {
                            primary: "#22c55e",
                            secondary: "#fff",
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: "#ef4444",
                            secondary: "#fff",
                        },
                    },
                }}
            />
            <Sidebar />
            <main className="ml-64 min-h-screen p-6 transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
