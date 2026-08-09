import { useState, useEffect, useCallback } from "react";

const OFFLINE_CHECK_URL = "/api/user";
const OFFLINE_CHECK_INTERVAL = 30000;

export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [lastOnlineAt, setLastOnlineAt] = useState(() => {
        const saved = localStorage.getItem("lastOnlineAt");
        return saved ? new Date(saved) : new Date();
    });
    const [lastOfflineAt, setLastOfflineAt] = useState(() => {
        const saved = localStorage.getItem("lastOfflineAt");
        return saved ? new Date(saved) : null;
    });
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        const now = new Date();
        localStorage.setItem("lastOnlineAt", now.toISOString());
    }, [isOnline]);

    useEffect(() => {
        const now = new Date();
        localStorage.setItem("lastOfflineAt", now.toISOString());
    }, [isOffline]);

    const updateOnline = useCallback(async () => {
        setIsOnline(navigator.onLine);
        setIsOffline(!navigator.onLine);
        if (navigator.onLine) {
            setLastOnlineAt(new Date());
            window.dispatchEvent(new Event("online:confirmed"));
        } else {
            setLastOfflineAt(new Date());
        }
    }, []);

    const checkConnectivity = useCallback(async () => {
        setIsChecking(true);
        const wasOnline = navigator.onLine;
        setIsOnline(wasOnline);
        setIsOffline(!wasOnline);

        if (wasOnline) {
            try {
                const response = await fetch(OFFLINE_CHECK_URL, {
                    method: "HEAD",
                    cache: "no-cache",
                    signal: AbortSignal.timeout(5000),
                });
                if (response.ok) {
                    setLastOnlineAt(new Date());
                    window.dispatchEvent(new Event("online:confirmed"));
                } else {
                    setIsOnline(false);
                    setIsOffline(true);
                    setLastOfflineAt(new Date());
                }
            } catch {
                setIsOnline(false);
                setIsOffline(true);
                setLastOfflineAt(new Date());
            }
        } else {
            setLastOfflineAt(new Date());
        }
        setIsChecking(false);
    }, []);

    useEffect(() => {
        updateOnline();
        const interval = setInterval(checkConnectivity, OFFLINE_CHECK_INTERVAL);
        window.addEventListener("online", updateOnline);
        window.addEventListener("offline", updateOnline);
        return () => {
            clearInterval(interval);
            window.removeEventListener("online", updateOnline);
            window.removeEventListener("offline", updateOnline);
        };
    }, [updateOnline, checkConnectivity]);

    return {
        isOnline,
        isOffline,
        isChecking,
        lastOnlineAt,
        lastOfflineAt,
        checkConnectivity,
    };
}

export default useNetworkStatus;
