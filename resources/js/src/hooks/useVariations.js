import { useState, useEffect, useCallback } from "react";
import { TABLES, db } from "../db";
import api from "../axios";
import { cacheEntity, getCachedEntity } from "../services/offlineApi";
import { GET_BRANCH_VARIATIONS } from "../routes/apiRoutes";

export function useVariations() {
    const [variations, setVariations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFromCache, setIsFromCache] = useState(false);

    const loadLocal = async () => {
        const savedVariations = await getCachedEntity(TABLES.VARIATIONS);
        if (savedVariations.length === 0) return null;

        const withChildren = [];
        for (const v of savedVariations) {
            const items = await db.variation_items.where("variation_id").equals(v.id).toArray();
            withChildren.push({ ...v, variation_items: items });
        }
        return withChildren;
    };

    const saveToLocal = async (data) => {
        await db.variations.clear();
        await db.variation_items.clear();
        for (const v of data) {
            await db.variations.put({ id: v.id, branch_id: v.branch_id, name: v.name });
            for (const item of v.variation_items || []) {
                await db.variation_items.put({
                    id: item.id,
                    variation_id: v.id,
                    name: item.name,
                    price: item.price,
                });
            }
        }
    };

    const fetchVariations = useCallback(async () => {
        setLoading(true);
        setIsFromCache(false);

        try {
            const localData = await loadLocal();
            if (localData) {
                setVariations(localData);
                setIsFromCache(true);
                setLoading(false);
                return;
            }

            const res = await api.get(GET_BRANCH_VARIATIONS);
            const serverData = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.data || res.data?.data || []);
            setVariations(serverData);
            setIsFromCache(false);
            await cacheEntity(TABLES.VARIATIONS, serverData);
            await saveToLocal(serverData);
        } catch (error) {
            console.error("fetchVariations error:", error);
            const cached = await loadLocal();
            if (cached) {
                setVariations(cached);
                setIsFromCache(true);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshVariations = useCallback(async () => {
        setLoading(true);
        setIsFromCache(false);
        try {
            const res = await api.get(GET_BRANCH_VARIATIONS);
            const serverData = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.data || res.data?.data || []);
            setVariations(serverData);
            setIsFromCache(false);
            await cacheEntity(TABLES.VARIATIONS, serverData);
            await saveToLocal(serverData);
        } catch (error) {
            console.error("refreshVariations error:", error);
            const cached = await loadLocal();
            if (cached) {
                setVariations(cached);
                setIsFromCache(true);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVariations();
    }, [fetchVariations]);

    return { variations, loading, refreshVariations, isFromCache };
}
