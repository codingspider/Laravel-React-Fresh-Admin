import { useEffect, useState, useCallback } from "react";
import { TABLES } from "../db";
import api from "../axios";
import { cacheEntity, getCachedEntity } from "../services/offlineApi";
import { GET_ALL_CATEGROIES } from "../routes/apiRoutes";

export function useCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFromCache, setIsFromCache] = useState(false);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setIsFromCache(false);

        try {
            const localCategories = await getCachedEntity(TABLES.CATEGORIES);
            if (localCategories.length > 0) {
                setCategories(localCategories);
                setIsFromCache(true);
            }

            const res = await api.get(GET_ALL_CATEGROIES);
            const latestCategories = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.data || res.data?.data || []);

            setCategories(latestCategories);
            setIsFromCache(false);

            await cacheEntity(TABLES.CATEGORIES, latestCategories);
        } catch (err) {
            console.error("fetchCategories error:", err);
            const cached = await getCachedEntity(TABLES.CATEGORIES);
            if (cached.length > 0) {
                setCategories(cached);
                setIsFromCache(true);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshCategories = useCallback(async () => {
        setLoading(true);
        setIsFromCache(false);
        try {
            const res = await api.get(GET_ALL_CATEGROIES);
            const categoryData = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.data || res.data?.data || []);
            setCategories(categoryData);
            setIsFromCache(false);
            await cacheEntity(TABLES.CATEGORIES, categoryData);
        } catch (err) {
            console.error("refreshCategories error:", err);
            const cached = await getCachedEntity(TABLES.CATEGORIES);
            if (cached.length > 0) {
                setCategories(cached);
                setIsFromCache(true);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return { categories, loading, refreshCategories, isFromCache };
}
