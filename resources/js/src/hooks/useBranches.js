// src/hooks/useBranches.js
import { useEffect, useState } from "react";
import { db } from "../db";
import api from "../axios";
import { GET_ALL_LOCATIONS } from "../routes/apiRoutes";

export function useBranches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch branches from Dexie first, otherwise from API
  const fetchBranches = async () => {
    setLoading(true);
    try {
      const localBranches = await db.branches.toArray();
      if (localBranches.length > 0) {
        setBranches(localBranches);
      } else {
        const res = await api.get(GET_ALL_LOCATIONS);
        const branchData = res.data.data;
        setBranches(branchData);
        await db.branches.bulkPut(branchData);
      }
    } catch (err) {
      console.error("fetchBranches error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Clear and refresh branches (force fetch from API)
  const refreshBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get(GET_ALL_LOCATIONS);
      const branchData = res.data.data;
      setBranches(branchData);
      await db.branches.clear();
      await db.branches.bulkPut(branchData);
    } catch (err) {
      console.error("refreshBranches error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return { branches, loading, refreshBranches };
}
