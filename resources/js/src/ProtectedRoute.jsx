import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LOGIN, UNAUTHORIZED } from './routes/commonRoutes';
import api from './axios';

const ProtectedRoute = ({ role, children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/user');
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;

  // Not authenticated
  if (!user) {
    return <Navigate to={LOGIN} replace />;
  }

  // Check role if provided
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={UNAUTHORIZED} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;