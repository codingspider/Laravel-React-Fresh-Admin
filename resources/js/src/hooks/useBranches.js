import { useEffect, useState, useCallback } from "react";
import { TABLES } from "../db";
import api from "../axios";
import { cacheEntity, getCachedEntity } from "../services/offlineApi";
import { GET_ALL_LOCATIONS } from "../routes/apiRoutes";

export function useBranches() {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFromCache, setIsFromCache] = useState(false);

    const fetchBranches = useCallback(async () => {
        setLoading(true);
        setIsFromCache(false);

        try {
            const localBranches = await getCachedEntity(TABLES.BRANCHES);
            if (localBranches.length > 0) {
                setBranches(localBranches);
                setIsFromCache(true);
            } else {
                const res = await api.get(GET_ALL_LOCATIONS);
                const branchData = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.data || res.data?.data || []);
                setBranches(branchData);
                setIsFromCache(false);
                await cacheEntity(TABLES.BRANCHES, branchData);
            }
        } catch (err) {
            console.error("fetchBranches error:", err);
            const cached = await getCachedEntity(TABLES.BRANCHES);
            if (cached.length > 0) {
                setBranches(cached);
                setIsFromCache(true);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshBranches = useCallback(async () => {
        setLoading(true);
        setIsFromCache(false);
        try {
            const res = await api.get(GET_ALL_LOCATIONS);
            const branchData = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.data || res.data?.data || []);
            setBranches(branchData);
            setIsFromCache(false);
            await cacheEntity(TABLES.BRANCHES, branchData);
        } catch (err) {
            console.error("refreshBranches error:", err);
            const cached = await getCachedEntity(TABLES.BRANCHES);
            if (cached.length > 0) {
                setBranches(cached);
                setIsFromCache(true);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    return { branches, loading, refreshBranches, isFromCache };
}
