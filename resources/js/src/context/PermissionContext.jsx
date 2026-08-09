import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './../axios';
import { db, TABLES } from './../db';
import { cacheEntity, getCachedEntity } from './../services/offlineApi';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
    const [permissions, setPermissions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [restaurant, setRestaurant] = useState(null);
    const [user, setUser] = useState(null);

    const can = (permissionName) => {
        return permissions.includes(permissionName);
    };

    const hasRole = (roleName) => {
        return roles.includes(roleName);
    };

    const applyUserData = (userData) => {
        setPermissions(userData.permissions || []);
        setRoles(userData.roles || []);
        setRestaurant(userData.restaurant || null);
        setUser(userData);
        setIsAuthenticated(true);
    };

    const fetchPermissions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.apiGet('/user');
            const userData = response.data.data || response.data;
            applyUserData(userData);
            await cacheEntity(TABLES.USERS, [userData]);
        } catch (error) {
            const cached = await getCachedEntity(TABLES.USERS);
            if (cached.length > 0) {
                applyUserData(cached[0]);
            } else {
                setPermissions([]);
                setRoles([]);
                setRestaurant(null);
                setUser(null);
                setIsAuthenticated(false);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const setUserPermission = (userData) => {
        const unwrapped = userData.data || userData;
        applyUserData(unwrapped);
        setLoading(false);
    };

    const logout = () => {
        setPermissions([]);
        setRoles([]);
        setRestaurant(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('role');
        window.location.href = '/login';
    };

    return (
        <PermissionContext.Provider value={{ permissions, roles, restaurant, user, loading, isAuthenticated, can, hasRole, setUserPermission, logout, refetchPermissions: fetchPermissions }}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermission = () => useContext(PermissionContext);
