import { useContext, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminRoute = () => {
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && user) {
      const roles = user.roles || (user.role ? [user.role] : []);
      const isAdmin = roles.includes('ROLE_ADMIN');
      if (!isAdmin) {
        toast.error('Access Denied: Administrative privileges required.');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roles = user.roles || (user.role ? [user.role] : []);
  const isAdmin = roles.includes('ROLE_ADMIN');

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
