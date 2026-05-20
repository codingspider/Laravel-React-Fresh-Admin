import React, { useState } from 'react';
import {
    Box, Flex, Text, Heading, Icon, Button, VStack, HStack,
    useColorModeValue, Tooltip
} from '@chakra-ui/react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Link as ChakraLink } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, ShoppingCart, TrendingUp, Settings,
    ChevronsLeft, ChevronRight,
    Package
} from 'lucide-react';
import { CATEGORY_LIST_PATH, ROLE_LIST_PATH, DASHBOARD_PATH, UNIT_LIST_PATH, USER_LIST_PATH } from '../../routes/superAdminRoutes';
import { usePermission } from '../../context/PermissionContext';

const navItems = [
    { 
        path: DASHBOARD_PATH, 
        icon: LayoutDashboard,
        label: 'Admin Dashboard',
        permission: 'view_dashboard_data' 
    },
    {
        icon: Users, 
        label: 'User Management',
        children: [
            { path: USER_LIST_PATH, label: 'All Users', permission: 'view_user' },
            { path: ROLE_LIST_PATH, label: 'Roles', permission: 'roles.view' },
            { path: '/teams', label: 'Teams', permission: 'manage teams' }
        ]
    },
    {
        icon: Package, 
        label: 'Product Management',
        children: [
            { path: '/products', label: 'Products', permission: 'view_product' },
            { path: CATEGORY_LIST_PATH, label: 'Category', permission: 'view_category' },
            { path: UNIT_LIST_PATH, label: 'Unit', permission: 'view_unit' }
        ]
    },
    { path: '/analytics', icon: TrendingUp, label: 'Analytics', permission: 'view analytics' },
    { path: '/settings', icon: Settings, label: 'Settings', permission: 'manage settings' },
];

export default function SidebarContent({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
    // 2. Destructure the 'can' function from your hook
    const { can } = usePermission(); 

    const [openMenus, setOpenMenus] = useState({});
    const location = useLocation();

    const bg = useColorModeValue('white', 'gray.800');
    const shadow = useColorModeValue('soft', 'softDark');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const hoverBg = useColorModeValue('gray.100', 'gray.700');

    const checkActive = (path) => location.pathname === path;

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const renderNavItem = (item, isMobile = false) => {

        // 🔒 3. SECURITY CHECK: Simple Item
        if (item.permission && !can(item.permission)) {
            return null;
        }

        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openMenus[item.label];
        const isActive = checkActive(item.path);

        // Collapsed Desktop View
        if (!isMobile && isCollapsed) {
            if (hasChildren) {
                // 🔒 4. SECURITY CHECK: Parent Item (Collapsed)
                const hasAccessToChildren = item.children.some(child => !child.permission || can(child.permission));
                if (!hasAccessToChildren) return null;

                return (
                    <Tooltip key={item.label} label={item.label} placement="right" hasArrow>
                        <Flex align="center" justify="center" px="0" py="3" borderRadius="lg" cursor="pointer" color="gray.500" _hover={{ bg: hoverBg, color: 'gray.700' }} transition="0.2s" _dark={{ _hover: { color: 'white' } }}>
                            <Icon as={item.icon} boxSize={5} flexShrink={0} />
                        </Flex>
                    </Tooltip>
                );
            }
            return (
                <Tooltip key={item.label} label={item.label} placement="right" hasArrow>
                    <ChakraLink as={ReactRouterLink} to={item.path} _hover={{ textDecoration: 'none' }}>
                        <Flex align="center" justify="center" px="0" py="3" borderRadius="lg" bg={isActive ? 'brand.50' : 'transparent'} color={isActive ? 'brand.600' : 'gray.500'} _hover={{ bg: isActive ? 'brand.50' : hoverBg, color: isActive ? 'brand.600' : 'gray.700' }} transition="0.2s" _dark={{ _hover: { color: 'white' } }}>
                            <Icon as={item.icon} boxSize={5} flexShrink={0} />
                        </Flex>
                    </ChakraLink>
                </Tooltip>
            );
        }

        // Expanded / Mobile View
        if (hasChildren) {
            // 🔒 5. SECURITY CHECK: Filter Children
            const visibleChildren = item.children.filter(child => !child.permission || can(child.permission));

            // If NO children are visible, hide the entire parent menu
            if (visibleChildren.length === 0) {
                return null;
            }

            return (
                <Box key={item.label} w="100%">
                    <Flex
                        align="center" px="4" py="3" w="100%" borderRadius="lg" cursor="pointer"
                        color="gray.500"
                        _hover={{ bg: hoverBg, color: 'gray.700' }}
                        transition="0.2s" fontWeight="500" fontSize="sm"
                        onClick={() => toggleMenu(item.label)}
                        justifyContent="space-between"
                        _dark={{ _hover: { color: 'white' } }}
                    >
                        <HStack spacing="3">
                            <Icon as={item.icon} boxSize={5} flexShrink={0} />
                            <Text>{item.label}</Text>
                        </HStack>
                        <Icon as={ChevronRight} boxSize={4} transition="transform 0.2s ease" transform={isOpen ? "rotate(90deg)" : "rotate(0deg)"} />
                    </Flex>

                    {isOpen && (
                        <VStack spacing="1" pl="12" pt="1" align="stretch">
                            {/* 🔒 6. Render only the visibleChildren, not all children */}
                            {visibleChildren.map((child) => {
                                const isChildActive = checkActive(child.path);
                                return (
                                    <ChakraLink key={child.path} as={ReactRouterLink} to={child.path} onClick={() => isMobile && setIsMobileOpen(false)} _hover={{ textDecoration: 'none' }}>
                                        <Flex
                                            align="center" px="4" py="2.5" borderRadius="lg" cursor="pointer"
                                            bg={isChildActive ? 'brand.50' : 'transparent'}
                                            color={isChildActive ? 'brand.600' : 'gray.500'}
                                            _hover={{ bg: isChildActive ? 'brand.50' : hoverBg, color: isChildActive ? 'brand.600' : 'gray.700' }}
                                            transition="0.2s" fontSize="sm" fontWeight="normal"
                                            _dark={{ _hover: { color: 'white' } }}
                                        >
                                            <Text>{child.label}</Text>
                                        </Flex>
                                    </ChakraLink>
                                );
                            })}
                        </VStack>
                    )}
                </Box>
            );
        }

        return (
            <Box key={item.label} w="100%">
                <ChakraLink as={ReactRouterLink} to={item.path} onClick={() => isMobile && setIsMobileOpen(false)} _hover={{ textDecoration: 'none' }}>
                    <Flex
                        align="center" px="4" py="3" w="100%" borderRadius="lg" cursor="pointer"
                        bg={isActive ? 'brand.50' : 'transparent'}
                        color={isActive ? 'brand.600' : 'gray.500'}
                        _hover={{ bg: isActive ? 'brand.50' : hoverBg, color: isActive ? 'brand.600' : 'gray.700' }}
                        transition="0.2s" fontWeight="500" fontSize="sm"
                        _dark={{ _hover: { color: 'white' } }}
                    >
                        <HStack spacing="3">
                            <Icon as={item.icon} boxSize={5} flexShrink={0} />
                            <Text>{item.label}</Text>
                        </HStack>
                    </Flex>
                </ChakraLink>
            </Box>
        );
    };

    return (
        <>
            {/* SIDEBAR - Desktop */}
            <Box
                display={{ base: 'none', lg: 'flex' }}
                flexDirection="column"
                w={isCollapsed ? '80px' : '260px'} transition="width 0.3s ease"
                position="fixed" top="0" left="0" h="full" zIndex="10"
                bg={bg} borderRight="1px" borderColor={borderColor}
                boxShadow={shadow}
            >
                <Flex p="4" justify="space-between" align="center" borderBottom="1px" borderColor={borderColor}>
                    {!isCollapsed && <Heading size="md" bgGradient="linear(to-r, brand.600, brand.400)" bgClip="text" fontWeight="800">Acme Inc</Heading>}
                    <Button variant="ghost" onClick={() => setIsCollapsed(!isCollapsed)} p="2" borderRadius="lg">
                        <Icon as={ChevronsLeft} boxSize={5} transform={isCollapsed ? 'rotate(180deg)' : 'none'} transition="0.3s" />
                    </Button>
                </Flex>
                <VStack spacing="1" p="4" flex="1" align="stretch" overflowY="auto" overflowX="hidden">
                    {navItems.map(item => renderNavItem(item, false))}
                </VStack>
            </Box>

            {/* SIDEBAR - Mobile Overlay */}
            {isMobileOpen && (
                <Box position="fixed" top="0" left="0" w="100%" h="100%" bg="blackAlpha.600" zIndex="9998" onClick={() => setIsMobileOpen(false)} transition="opacity 0.3s" />
            )}

            {/* SIDEBAR - Mobile Panel */}
            <Box
                position="fixed" top="0" left="0" w="280px" h="100%" bg={bg} zIndex="9999"
                boxShadow="2xl" display={{ base: "block", lg: "none" }}
                transform={isMobileOpen ? "translateX(0)" : "translateX(-100%)"}
                transition="transform 0.3s ease" onClick={(e) => e.stopPropagation()} overflowY="auto"
            >
                <Flex p="4" justify="space-between" align="center" borderBottom="1px" borderColor={borderColor}>
                    <Heading size="md" bgGradient="linear(to-r, brand.600, brand.400)" bgClip="text" fontWeight="800">Acme Inc</Heading>
                    <Button variant="ghost" onClick={() => setIsMobileOpen(false)} p="2" borderRadius="lg">
                        <Icon as={ChevronsLeft} boxSize={5} />
                    </Button>
                </Flex>
                <VStack spacing="1" p="4" align="stretch">
                    {navItems.map(item => renderNavItem(item, true))}
                </VStack>
            </Box>
        </>
    );
}