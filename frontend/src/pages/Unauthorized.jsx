import { Link } from "react-router-dom";
import { Button } from "../components/ui";
import { HiOutlineExclamationCircle, HiOutlineArrowLeft } from "react-icons/hi";

const Unauthorized = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                    <HiOutlineExclamationCircle className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-500 mb-8">
                    You don't have permission to access this page.
                </p>
                <Link to="/dashboard">
                    <Button>
                        <HiOutlineArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;
