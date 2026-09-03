import React, { useState, useEffect } from 'react';
import { Flex, Box, useMediaQuery } from '@chakra-ui/react';
import { Outlet, useLocation } from 'react-router-dom';
import SidebarContent from './SidebarContent';
import TopNav from './TopNav';
import PwaInstallButton from '../ui/PwaInstallButton';
import useThemeColors from '../../hooks/useThemeColors';
import { usePermission } from '../../context/PermissionContext';
import api from '../../axios';
import { WEBSITE_SETTINGS } from '../../routes/apiRoutes';

export default function MainLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isLargerThanLG] = useMediaQuery('(min-width: 992px)');
    const location = useLocation();
    const colors = useThemeColors();
    const { restaurant, hasRole } = usePermission();
    const isSuperAdmin = hasRole('super_admin');

    const sidebarW = isCollapsed ? '72px' : '260px';

    useEffect(() => {
        if (isSuperAdmin) {
            api.get(WEBSITE_SETTINGS)
                .then((res) => {
                    const logo = res.data?.data?.site_logo;
                    if (logo) {
                        let link = document.querySelector("link[rel~='icon']");
                        if (!link) {
                            link = document.createElement('link');
                            link.rel = 'icon';
                            document.head.appendChild(link);
                        }
                        link.href = logo.startsWith('http') ? logo : `/${logo}`;
                    }
                })
                .catch(() => {});
        } else if (restaurant?.logo) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = `/${restaurant.logo}`;
        }
    }, [isSuperAdmin, restaurant?.logo]);

    useEffect(() => {
        if (isLargerThanLG) {
            setIsMobileOpen(false);
        }
    }, [isLargerThanLG]);

    useEffect(() => {
        if (!isLargerThanLG) {
            setIsMobileOpen(false);
        }
    }, [location.pathname, isLargerThanLG]);

    return (
        <Flex h="100vh" overflow="hidden" bg={colors.bgPage}>
            <SidebarContent
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            <Box
                flex="1"
                ml={{ base: 0, lg: sidebarW }}
                transition="margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                overflowY="auto"
                overflowX="hidden"
            >
                <TopNav onMobileMenuOpen={() => setIsMobileOpen(true)} />

                <Box
                    p={{ base: 4, md: 5, lg: 6 }}
                    minH="calc(100vh - 64px)"
                >
                    <Outlet />
                </Box>
            </Box>

            <PwaInstallButton />
        </Flex>
    );
}
