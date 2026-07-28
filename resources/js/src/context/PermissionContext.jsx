import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './../axios';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
    const [permissions, setPermissions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [restaurant, setRestaurant] = useState(null);

    const can = (permissionName) => {
        return permissions.includes(permissionName);
    };

    const hasRole = (roleName) => {
        return roles.includes(roleName);
    };

    const fetchPermissions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/user');
            const userData = response.data.data || response.data;
            setPermissions(userData.permissions || []);
            setRoles(userData.roles || []);
            setRestaurant(userData.restaurant || null);
            setIsAuthenticated(true);
        } catch (error) {
            setPermissions([]);
            setRoles([]);
            setRestaurant(null);
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
        setRoles(userData.roles || []);
        setRestaurant(userData.restaurant || null);
        setIsAuthenticated(true);
        setLoading(false);
    };

    const logout = () => {
        setPermissions([]);
        setRoles([]);
        setRestaurant(null);
        setIsAuthenticated(false);
        localStorage.removeItem('role');
        window.location.href = '/login';
    };

    return (
        <PermissionContext.Provider value={{ permissions, roles, restaurant, loading, isAuthenticated, can, hasRole, setUserPermission, logout, refetchPermissions: fetchPermissions }}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermission = () => useContext(PermissionContext);
