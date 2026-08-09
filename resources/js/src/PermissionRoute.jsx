import React from 'react';
import { Navigate } from 'react-router-dom';
import { LOGIN, UNAUTHORIZED } from './routes/commonRoutes';
import { usePermission } from './context/PermissionContext';
import Unauthorized from './components/auth/Unauthorized';

const PermissionRoute = ({ permission, children }) => {
  const { can, loading, isAuthenticated } = usePermission();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to={LOGIN} replace />;
  }

  if (!permission || can(permission)) {
    return children;
  }

  return <Unauthorized />;
};

export default PermissionRoute;
