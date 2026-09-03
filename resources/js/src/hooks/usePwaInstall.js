import { useState, useEffect, useCallback } from 'react';

export default function usePwaInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Already running as installed PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if already installed via earlier session
        if (localStorage.getItem('pwa_installed') === 'true') {
            setIsInstalled(true);
            return;
        }

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        const installedHandler = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            localStorage.setItem('pwa_installed', 'true');
        };

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', installedHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', installedHandler);
        };
    }, []);

    const install = useCallback(async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstalled(true);
            setIsInstallable(false);
            localStorage.setItem('pwa_installed', 'true');
        }

        setDeferredPrompt(null);
    }, [deferredPrompt]);

    const dismiss = useCallback(() => {
        setIsInstallable(false);
        setDeferredPrompt(null);
        // Re-show after 7 days
        localStorage.setItem('pwa_install_dismissed', Date.now().toString());
    }, []);

    // Don't show if dismissed recently (7 days)
    const wasRecentlyDismissed = useCallback(() => {
        const dismissed = localStorage.getItem('pwa_install_dismissed');
        if (!dismissed) return false;
        const elapsed = Date.now() - parseInt(dismissed, 10);
        return elapsed < 7 * 24 * 60 * 60 * 1000;
    }, []);

    return {
        isInstallable: isInstallable && !isInstalled && !wasRecentlyDismissed(),
        isInstalled,
        install,
        dismiss,
    };
}
