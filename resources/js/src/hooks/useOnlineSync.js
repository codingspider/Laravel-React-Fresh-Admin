import { useEffect, useCallback } from "react";
import { useToast } from "@chakra-ui/react";
import { db } from "../db";
import api from "../axios";
import { getQueueStatus, TABLES } from "../services/offlineApi";

const MAX_RETRIES = 3;
const SYNC_BATCH_SIZE = 5;
const SYNC_INTERVAL = 15000;
const RETRY_DELAY = 5000;

function isTempId(id) {
    return String(id || "").startsWith("temp_");
}

function extractTempIdFromUrl(url, tempId) {
    const urlStr = String(url || "");
    if (urlStr.includes(tempId)) {
        return tempId;
    }
    const match = urlStr.match(/temp_[a-f0-9-]+_\w+/);
    return match ? match[0] : null;
}

export default function useOnlineSync() {
    const toast = useToast();
    const { PENDING, SYNCING, SUCCESS, FAILED } = getQueueStatus();

    const tempIdMap = useCallback(async () => {
        const all = await db.queue
            .where("status")
            .anyOf([SUCCESS])
            .and((item) => item.response && item.temp_id)
            .toArray();

        const map = {};
        for (const item of all) {
            try {
                const response = typeof item.response === "string"
                    ? JSON.parse(item.response)
                    : item.response;
                const realId = response?.data?.data?.id;
                if (realId && isTempId(item.temp_id) && !isTempId(realId)) {
                    map[item.temp_id] = realId;
                }
            } catch { }
        }

        const syncRecords = await db.sync_status
            .where("key")
            .startsWith("temp_id_map:")
            .toArray();

        for (const rec of syncRecords) {
            try {
                const mapping = JSON.parse(rec.value);
                Object.assign(map, mapping);
            } catch { }
        }

        return map;
    }, []);

    const resolveTempIdInUrl = useCallback((url, mapping) => {
        if (!url || !mapping) return url;
        let resolved = url;
        for (const [tempId, realId] of Object.entries(mapping)) {
            resolved = resolved.replace(tempId, realId);
        }
        return resolved;
    }, []);

    const reconcileOfflineSale = useCallback(async (queuedItem, serverResponse) => {
        const tempId = queuedItem.temp_id;
        if (!tempId) return;

        const realId = serverResponse?.data?.data?.id;

        if (realId && isTempId(tempId) && !isTempId(realId)) {
            await db.sync_status.put({
                id: `temp_id_map:${tempId}`,
                key: `temp_id_map:${tempId}`,
                value: JSON.stringify({ [tempId]: realId }),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }

        const saleData = serverResponse?.data?.data;
        if (saleData && realId) {
            await db.offline_sales.put({
                id: realId,
                sale_id: realId,
                ...saleData,
                status: saleData.status || "pending",
                branch_id: saleData.branch_id,
                isSynced: true,
                syncAttempts: 0,
                syncedAt: new Date().toISOString(),
                createdAt: saleData.createdAt || new Date().toISOString(),
            }).catch(() => { });

            if (isTempId(tempId)) {
                const held = await db.held_orders
                    .where("temp_id")
                    .equals(tempId)
                    .first();

                if (held) {
                    await db.held_orders.update(held.id, {
                        id: realId,
                        sale_id: realId,
                        isSynced: true,
                    });
                }

                await db.held_orders
                    .where("sale_id")
                    .equals(tempId)
                    .modify({ sale_id: realId, isSynced: true });
            }
        }
    }, []);

    const flushQueue = useCallback(async () => {
        const mapping = await tempIdMap();
        let syncedThisRun = 0;

        const queued = await db.queue
            .where("status")
            .anyOf([PENDING, FAILED])
            .limit(SYNC_BATCH_SIZE)
            .toArray();

        for (const item of queued) {
            try {
                await db.queue.update(item.id, {
                    status: SYNCING,
                    updatedAt: new Date().toISOString(),
                });

                const resolvedUrl = resolveTempIdInUrl(item.url, mapping);

                const res = await api({
                    method: item.method,
                    url: resolvedUrl,
                    data: item.payload,
                });

                await db.queue.update(item.id, {
                    status: SUCCESS,
                    response: JSON.stringify(res.data),
                    attempts: (item.attempts || 0) + 1,
                    error: null,
                    updatedAt: new Date().toISOString(),
                });

                syncedThisRun++;
                await reconcileOfflineSale(item, res);
            } catch (e) {
                const attempts = (item.attempts || 0) + 1;
                const newStatus = attempts >= MAX_RETRIES ? FAILED : PENDING;
                await db.queue.update(item.id, {
                    status: newStatus,
                    attempts,
                    error: e?.message || String(e),
                    updatedAt: new Date().toISOString(),
                });
            }
        }

        const remaining = await db.queue
            .where("status")
            .anyOf([PENDING, FAILED])
            .count();

        const failedCount = await db.queue
            .where("status")
            .anyOf([FAILED])
            .count();

        if (syncedThisRun > 0) {
            if (remaining === 0) {
                toast({
                    title: "Orders synced",
                    description: `${syncedThisRun} order(s) synchronized successfully`,
                    status: "success",
                    duration: 4000,
                    isClosable: true,
                    position: "top-right",
                });
            } else {
                toast({
                    title: "Sync in progress",
                    description: `${syncedThisRun} order(s) synchronized, ${remaining} remaining`,
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                    position: "top-right",
                });
            }
        }

        if (failedCount > 0 && remaining > 0) {
            toast({
                title: "Sync errors",
                description: `${failedCount} order(s) failed to sync after ${MAX_RETRIES} retries`,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-right",
            });
        }

        if (remaining > 0) {
            setTimeout(flushQueue, RETRY_DELAY);
        }
    }, [PENDING, SYNCING, SUCCESS, FAILED, tempIdMap, resolveTempIdInUrl, reconcileOfflineSale, toast, MAX_RETRIES]);

    const handleOnline = useCallback(() => {
        flushQueue();
        window.dispatchEvent(new Event("online:confirmed"));
    }, [flushQueue]);

    useEffect(() => {
        flushQueue();

        window.addEventListener("online", handleOnline);
        const confirmedHandler = () => flushQueue();
        window.addEventListener("online:confirmed", confirmedHandler);
        const interval = setInterval(flushQueue, SYNC_INTERVAL);

        return () => {
            clearInterval(interval);
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("online:confirmed", confirmedHandler);
        };
    }, [flushQueue, handleOnline]);

    const getQueueStats = useCallback(async () => {
        const [pending, syncing, failed] = await Promise.all([
            db.queue.where("status").anyOf([PENDING]).count(),
            db.queue.where("status").anyOf([SYNCING]).count(),
            db.queue.where("status").anyOf([FAILED]).count(),
        ]);
        return { pending, syncing, failed };
    }, [PENDING, SYNCING, FAILED]);

    return { flushQueue, getQueueStats };
}
