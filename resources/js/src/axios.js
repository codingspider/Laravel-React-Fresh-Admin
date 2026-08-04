import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

let csrfRefreshPromise = null;

async function refreshCsrf() {
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
    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;
      await refreshCsrf();
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;
