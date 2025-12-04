import { Link } from "react-router-dom";
import { Button } from "../components/ui";
import { HiOutlineQuestionMarkCircle, HiOutlineArrowLeft } from "react-icons/hi";

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                    <HiOutlineQuestionMarkCircle className="w-10 h-10 text-gray-600" />
                </div>
                <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
                <p className="text-gray-500 mb-8">
                    The page you're looking for doesn't exist or has been moved.
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

export default NotFound;
