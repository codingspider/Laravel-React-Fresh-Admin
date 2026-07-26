import React, { useState, useEffect } from 'react';
import { Flex, Box, useColorModeValue, useMediaQuery } from '@chakra-ui/react';
import { Outlet, useLocation } from 'react-router-dom';
import SidebarContent from './SidebarContent';
import TopNav from './TopNav';

export default function MainLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isLargerThanLG] = useMediaQuery('(min-width: 992px)');
    const location = useLocation();

    const sidebarW = isCollapsed ? '72px' : '260px';

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
        <Flex h="100vh" overflow="hidden" bg={useColorModeValue('gray.50', 'gray.900')}>
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
        </Flex>
    );
}
