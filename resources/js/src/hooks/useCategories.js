// src/hooks/useBranches.js
import { useEffect, useState } from "react";
import { db } from "../db";
import api from "../axios";
import { GET_ALL_CATEGROIES } from "../routes/apiRoutes";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch branches from Dexie first, otherwise from API
  const fetchCategories = async () => {
    setLoading(true);

    try {
      // 1. Load from IndexedDB first
      const localCategories = await db.categories.toArray();

      if (localCategories.length > 0) {
        setCategories(localCategories);
      }

      // 2. Always fetch latest data from API
      const res = await api.get(GET_ALL_CATEGROIES);

      const latestCategories = res.data.data;

      // 3. Update state
      setCategories(latestCategories);

      // 4. Update IndexedDB
      await db.categories.clear();
      await db.categories.bulkPut(latestCategories);

    } catch (err) {
      console.error("fetchCategories error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Clear and refresh branches (force fetch from API)
  const refreshCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get(GET_ALL_CATEGROIES);
      const categoryData = res.data.data;
      setCategories(categoryData);
      await db.categories.clear();
      await db.categories.bulkPut(categoryData);
    } catch (err) {
      console.error("refreshBranches error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, refreshCategories };
}
