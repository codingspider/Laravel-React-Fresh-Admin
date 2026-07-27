import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './../axios';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const can = (permissionName) => {
        return permissions.includes(permissionName);
    };

    const fetchPermissions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/user');
            setPermissions(response.data.permissions || []);
            setIsAuthenticated(true);
        } catch (error) {
            setPermissions([]);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const setUserPermission = (userData) => {
        setPermissions(userData.permissions || []);
        setIsAuthenticated(true);
        setLoading(false);
    };

    const logout = () => {
        setPermissions([]);
        setIsAuthenticated(false);
        localStorage.removeItem('role');
        window.location.href = '/login';
    };

    return (
        <PermissionContext.Provider value={{ permissions, loading, isAuthenticated, can, setUserPermission, logout, refetchPermissions: fetchPermissions }}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermission = () => useContext(PermissionContext);
