import { useState, useEffect, useCallback } from "react";
import { db } from "../db";

const CART_KEY = "pos_cart";
const CART_EXPIRY_MS = 24 * 60 * 60 * 1000;

export function usePersistentCart(initialCart = []) {
    const [cart, setCart] = useState(initialCart);
    const [hydrated, setHydrated] = useState(false);

    const loadCart = useCallback(async () => {
        try {
            const record = await db.sync_status
                .where("key")
                .equals(CART_KEY)
                .first();

            if (record) {
                const now = Date.now();
                const savedAt = new Date(record.createdAt).getTime();

                if (now - savedAt < CART_EXPIRY_MS) {
                    const parsed = JSON.parse(record.value || "[]");
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setCart(parsed);
                    }
                } else {
                    await db.sync_status.delete(record.id);
                }
            }
        } catch (err) {
            console.error("loadCart error:", err);
        } finally {
            setHydrated(true);
        }
    }, []);

    const saveCart = useCallback(async (cartItems) => {
        try {
            const value = JSON.stringify(cartItems);
            const now = new Date().toISOString();
            const existing = await db.sync_status
                .where("key")
                .equals(CART_KEY)
                .first();
            await db.sync_status.put({
                id: CART_KEY,
                key: CART_KEY,
                value,
                createdAt: existing?.createdAt || now,
                updatedAt: now,
            });
        } catch (err) {
            console.error("saveCart error:", err);
        }
    }, []);

    const clearCart = useCallback(async () => {
        setCart([]);
        try {
            await db.sync_status.where("key").equals(CART_KEY).delete();
        } catch (err) {
            console.error("clearCart error:", err);
        }
    }, []);

    const updateCart = useCallback(
        (updater) => {
            setCart((prev) => {
                const next = typeof updater === "function" ? updater(prev) : updater;
                saveCart(next);
                return next;
            });
        },
        [saveCart]
    );

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    useEffect(() => {
        if (hydrated) {
            saveCart(cart);
        }
    }, [cart, hydrated, saveCart]);

    return { cart, setCart, updateCart, clearCart, isHydrated: hydrated };
}

export default usePersistentCart;
