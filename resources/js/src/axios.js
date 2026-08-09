import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

let csrfRefreshPromise = null;

async function refreshCsrf() {
  if (!navigator.onLine) {
    return Promise.resolve();
  }
  if (!csrfRefreshPromise) {
    csrfRefreshPromise = axios
      .get("/sanctum/csrf-cookie", { withCredentials: true })
      .finally(() => {
        csrfRefreshPromise = null;
      });
  }
  return csrfRefreshPromise;
}

api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    await refreshCsrf();
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;
      await refreshCsrf();
      return api(originalRequest);
    }

    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true;
      const retryAfter = parseInt(error.response.headers?.["retry-after"] || "1", 10) * 1000;
      await new Promise((r) => setTimeout(r, retryAfter));
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

const inFlight = new Map();

function getRequestKey(url, params) {
  const p = JSON.stringify(params || {});
  return `get:${url}:${p}`;
}

export function apiGet(url, params) {
  const key = getRequestKey(url, params);
  if (inFlight.has(key)) {
    return inFlight.get(key);
  }
  const promise = api.get(url, params ? { params } : {}).finally(() => {
    inFlight.delete(key);
  });
  inFlight.set(key, promise);
  return promise;
}

api.apiGet = apiGet;

export default api;
