import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './../axios';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true); // Start with loading = true
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Helper to check permission
    const can = (permissionName) => {
        return permissions.includes(permissionName);
    };

    // 1. Fetch permissions on Mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/user');
                setPermissions(response.data.permissions || []);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Session expired or invalid token");
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    // 2. Login Function (Sets token and state)
    const setUserPermission = (userData) => {
        setPermissions(userData.permissions || []);
        setIsAuthenticated(true);
        setLoading(false);
    };

    // 3. Logout Function
    const logout = () => {
        setPermissions([]);
        setIsAuthenticated(false);
        localStorage.removeItem('role');
        window.location.href = '/login';
    };

    return (
        <PermissionContext.Provider value={{ permissions, loading, isAuthenticated, can, setUserPermission, logout }}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermission = () => useContext(PermissionContext);