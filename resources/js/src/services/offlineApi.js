import api from "../axios";
import { db, TABLES } from "../db";
export { TABLES };
import {
    STORE_POS_SALE,
    POS_SETTINGS,
    POS_COUPONS,
    LIST_MODIFIER_GROUP,
    LIST_RESERVATION,
    LIST_TABLE,
    LIST_CUSTOMER,
    LIST_BRANCH,
    LIST_MENU_CATEGORY,
    LIST_MENU_ITEM,
    GET_INVOICE_SETTING,
    CUSTOMER_DISPLAY_SETTINGS,
    KDS_BOARD,
} from "../routes/apiRoutes";

function generateTempId() {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const QUEUE_STATUS = {
    PENDING: "pending",
    SYNCING: "syncing",
    SUCCESS: "success",
    FAILED: "failed",
};

function getBaseUrl(url) {
    const cleanUrl = String(url || "").split("?")[0];
    return cleanUrl.replace(/\/\d+.*$/, "").replace(/\/\w[\w-]*$/, "");
}

function isPosSaleUrl(url) {
    const base = getBaseUrl(url);
    return base === STORE_POS_SALE;
}

function isPosPaymentUrl(url) {
    return url.includes("/payments");
}

function buildSaleResponse(payload) {
    const tempId = payload.temp_id || generateTempId();
    return {
        data: {
            id: tempId,
            temp_id: tempId,
            ...payload,
            amount_paid: 0,
            status: "pending",
            isSynced: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        status: "success",
    };
}

function buildPaymentResponse(payload) {
    return {
        data: {
            id: `temp_payment_${generateTempId()}`,
            ...payload,
            amount: parseFloat(payload?.amount || 0),
            payment_method: payload?.payment_method || "cash",
            isSynced: false,
            createdAt: new Date().toISOString(),
        },
        status: "success",
    };
}

function buildGenericResponse(payload) {
    const tempId = payload?.temp_id || payload?.id || generateTempId();
    return {
        data: {
            id: tempId,
            ...payload,
            isSynced: false,
            createdAt: new Date().toISOString(),
        },
        status: "success",
    };
}

function buildOfflineResponse(url, method, payload) {
    if (method.toLowerCase() === "post" || method.toLowerCase() === "put") {
        if (isPosSaleUrl(url)) {
            return buildSaleResponse(payload);
        }
        if (isPosPaymentUrl(url)) {
            return buildPaymentResponse(payload);
        }
        return buildGenericResponse(payload);
    }

    return {
        data: [],
        meta: { total: 0, per_page: 20, current_page: 1, last_page: 1 },
    };
}

async function enqueueRequest(method, url, data, tempId) {
    const now = new Date().toISOString();
    await db.queue.add({
        method: method.toUpperCase(),
        url,
        payload: data,
        temp_id: tempId,
        status: QUEUE_STATUS.PENDING,
        response: null,
        attempts: 0,
        error: null,
        createdAt: now,
        updatedAt: now,
    });
}

async function executeRequest(method, url, data) {
    if (["post", "put", "patch", "delete"].includes(method.toLowerCase())) {
        return await api({ method, url, data });
    }
    return await api({ method, url });
}

function shouldQueueError(err) {
    const status = err?.response?.status;
    if (!status) return true;
    return status >= 500 || status === 408 || status === 429;
}

export async function offlineApi(config) {
    const { method = "get", url, data, temp_id: existingTempId } = config;

    if (navigator.onLine) {
        try {
            return await executeRequest(method, url, data);
        } catch (err) {
            if (!shouldQueueError(err)) {
                throw err;
            }
        }
    }

    const tempId = existingTempId || generateTempId();
    await enqueueRequest(method, url, data, tempId);

    return {
        data: buildOfflineResponse(url, method, { ...data, temp_id: tempId }),
        status: 200,
        statusText: "OK (offline-cached)",
        _queued: true,
        _temp_id: tempId,
    };
}

export function getQueueStatus() {
    return {
        PENDING: QUEUE_STATUS.PENDING,
        SYNCING: QUEUE_STATUS.SYNCING,
        SUCCESS: QUEUE_STATUS.SUCCESS,
        FAILED: QUEUE_STATUS.FAILED,
    };
}

export async function getPendingQueueCount() {
    const { PENDING, FAILED } = getQueueStatus();
    return await db.queue.where("status").anyOf([PENDING, FAILED]).count();
}

export async function cacheEntity(table, entityData) {
    if (!entityData) return;
    const arr = Array.isArray(entityData) ? entityData : [entityData];
    await db.table(table).clear();
    await db.table(table).bulkPut(arr);
}

export async function getCachedEntity(table) {
    return await db.table(table).toArray();
}

export const ENTITY_API_ROUTES = {
    [TABLES.CATEGORIES]: LIST_MENU_CATEGORY,
    [TABLES.MENU_ITEMS]: LIST_MENU_ITEM,
    [TABLES.MODIFIER_GROUPS]: LIST_MODIFIER_GROUP,
    [TABLES.TABLES]: LIST_TABLE,
    [TABLES.CUSTOMERS]: LIST_CUSTOMER,
    [TABLES.BRANCHES]: LIST_BRANCH,
    [TABLES.COUPONS]: POS_COUPONS,
    [TABLES.RESERVATIONS]: LIST_RESERVATION,
    [TABLES.POS_SETTINGS]: POS_SETTINGS,
    [TABLES.INVOICE_SETTINGS]: GET_INVOICE_SETTING,
    [TABLES.CUSTOMER_DISPLAY_SETTINGS]: CUSTOMER_DISPLAY_SETTINGS,
    [TABLES.KDS_BOARD]: KDS_BOARD,
};

export default offlineApi;
