import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiHome } from 'react-icons/fi';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="inline-flex p-4 bg-red-50 text-red-600 rounded-2xl">
          <FiAlertTriangle className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800">404 - Page Not Found</h1>
        <p className="text-sm text-slate-500">
          The route or resource you requested does not exist or has been moved.
        </p>
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-lg shadow-md hover:bg-blue-700 transition-all"
          >
            <FiHome className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
