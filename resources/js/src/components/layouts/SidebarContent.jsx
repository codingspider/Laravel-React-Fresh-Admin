import React, { useState } from 'react';
import {
    Box,
    Flex,
    Text,
    Icon,
    Button,
    VStack,
    HStack,
    useColorModeValue,
    Tooltip,
    Divider,
    Avatar,
} from '@chakra-ui/react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Link as ChakraLink } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Settings,
    ChevronsLeft,
    ChevronRight,
    ShoppingCart,
    Package,
    Building2,
    UtensilsCrossed,
    Store,
    GitBranch,
    Utensils,
    Grid3x3,
    Monitor,
} from 'lucide-react';
import {
    DASHBOARD_PATH,
    ROLE_LIST_PATH,
    USER_LIST_PATH,
    PRODUCT_LIST_PATH,
    UNIT_LIST_PATH,
    CATEGORY_LIST_PATH,
} from '../../routes/superAdminRoutes';
import { usePermission } from '../../context/PermissionContext';

const navItems = [
    {
        path: DASHBOARD_PATH,
        icon: LayoutDashboard,
        label: 'Dashboard',
        permission: 'view_dashboard_data',
    },
    {
        icon: Store,
        label: 'Restaurants',
        permission: 'view_restaurants',
        children: [
            { path: '/restaurant/list', label: 'All Restaurants', permission: 'view_restaurants' },
        ],
    },
    {
        icon: GitBranch,
        label: 'Branches',
        permission: 'view_branches',
        children: [
            { path: '/branch/list', label: 'All Branches', permission: 'view_branches' },
        ],
    },
    {
        icon: Utensils,
        label: 'Menu',
        permission: 'view_menu_items',
        children: [
            { path: '/menu/categories', label: 'Categories', permission: 'view_menu_categories' },
            { path: '/menu/items', label: 'Items', permission: 'view_menu_items' },
            { path: '/menu/modifier-groups', label: 'Modifier Groups', permission: 'view_modifier_groups' },
        ],
    },
    {
        icon: Grid3x3,
        label: 'Table Management',
        permission: 'view_tables',
        children: [
            { path: '/table-management/floors', label: 'Floors', permission: 'view_floors' },
            { path: '/table-management/tables', label: 'Tables', permission: 'view_tables' },
            { path: '/table-management/reservations', label: 'Reservations', permission: 'view_reservations' },
        ],
    },
    {
        icon: Monitor,
        label: 'POS',
        permission: 'view_pos',
        children: [
            { path: '/pos/terminal', label: 'POS Terminal', permission: 'view_pos' },
            { path: '/pos/sales', label: 'Sales History', permission: 'view_pos' },
        ],
    },
    {
        icon: UtensilsCrossed,
        label: 'Products',
        permission: 'view_products',
        children: [
            { path: PRODUCT_LIST_PATH, label: 'All Products', permission: 'view_products' },
            { path: CATEGORY_LIST_PATH, label: 'Categories', permission: 'view_categories' },
            { path: UNIT_LIST_PATH, label: 'Units', permission: 'view_units' },
        ],
    },

    {
        icon: Users,
        label: 'User Management',
        permission: 'view_user',
        children: [
            { path: USER_LIST_PATH, label: 'All Users', permission: 'view_user' },
            { path: ROLE_LIST_PATH, label: 'Roles & Permissions', permission: 'role_list' },
        ],
    },

    {
        path: '/settings',
        icon: Settings,
        label: 'Settings',
        permission: 'access_business_settings',
    },
];

export default function SidebarContent({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
    const { can } = usePermission();
    const [openMenus, setOpenMenus] = useState({});
    const location = useLocation();

    const bg = useColorModeValue('white', 'gray.900');
    const borderColor = useColorModeValue('gray.100', 'gray.800');
    const hoverBg = useColorModeValue('gray.50', 'gray.800');
    const activeBg = useColorModeValue('brand.50', 'brand.900');
    const activeColor = 'brand.600';
    const textColor = useColorModeValue('gray.600', 'gray.400');
    const textHover = useColorModeValue('gray.900', 'white');

    const checkActive = (path) => location.pathname === path;
    const checkActiveParent = (children) => children?.some(child => location.pathname === child.path);

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const NavItem = ({ item, isMobile = false, isCollapsedView = false }) => {
        if (item.permission && !can(item.permission)) return null;

        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openMenus[item.label];
        const isActive = item.path ? checkActive(item.path) : hasChildren && checkActiveParent(item.children);

        if (hasChildren) {
            const visibleChildren = item.children.filter(child => !child.permission || can(child.permission));
            if (visibleChildren.length === 0) return null;

            if (isCollapsedView) {
                return (
                    <Tooltip key={item.label} label={item.label} placement="right" hasArrow>
                        <Flex
                            align="center"
                            justify="center"
                            py={2.5}
                            borderRadius="lg"
                            cursor="pointer"
                            color={isActive ? activeColor : textColor}
                            bg={isActive ? activeBg : 'transparent'}
                            _hover={{ bg: hoverBg, color: textHover }}
                            transition="all 0.15s ease"
                        >
                            <Icon as={item.icon} boxSize={5} />
                        </Flex>
                    </Tooltip>
                );
            }

            return (
                <Box key={item.label} w="100%">
                    <Flex
                        align="center"
                        px={3}
                        py={2}
                        w="100%"
                        borderRadius="lg"
                        cursor="pointer"
                        color={isActive ? activeColor : textColor}
                        bg={isActive ? activeBg : 'transparent'}
                        _hover={{ bg: hoverBg, color: textHover }}
                        transition="all 0.15s ease"
                        fontWeight="500"
                        fontSize="sm"
                        onClick={() => toggleMenu(item.label)}
                        justify="space-between"
                    >
                        <HStack spacing={3}>
                            <Icon as={item.icon} boxSize={5} flexShrink={0} />
                            <Text noOfLines={1}>{item.label}</Text>
                        </HStack>
                        <Icon
                            as={ChevronRight}
                            boxSize={4}
                            transition="transform 0.2s ease"
                            transform={isOpen ? 'rotate(90deg)' : 'rotate(0deg)'}
                            opacity={0.6}
                        />
                    </Flex>

                    <Box
                        overflow="hidden"
                        maxH={isOpen ? '200px' : '0'}
                        transition="max-height 0.3s ease"
                    >
                        <VStack spacing={0.5} pl={11} pt={1} align="stretch">
                            {visibleChildren.map((child) => {
                                const isChildActive = checkActive(child.path);
                                return (
                                    <ChakraLink
                                        key={child.path}
                                        as={ReactRouterLink}
                                        to={child.path}
                                        onClick={() => isMobile && setIsMobileOpen(false)}
                                        _hover={{ textDecoration: 'none' }}
                                    >
                                        <Flex
                                            align="center"
                                            px={3}
                                            py={2}
                                            borderRadius="lg"
                                            cursor="pointer"
                                            bg={isChildActive ? activeBg : 'transparent'}
                                            color={isChildActive ? activeColor : textColor}
                                            _hover={{ bg: isChildActive ? activeBg : hoverBg, color: isChildActive ? activeColor : textHover }}
                                            transition="all 0.15s ease"
                                            fontSize="sm"
                                        >
                                            <Text noOfLines={1}>{child.label}</Text>
                                        </Flex>
                                    </ChakraLink>
                                );
                            })}
                        </VStack>
                    </Box>
                </Box>
            );
        }

        if (isCollapsedView) {
            return (
                <Tooltip key={item.label} label={item.label} placement="right" hasArrow>
                    <ChakraLink as={ReactRouterLink} to={item.path} _hover={{ textDecoration: 'none' }}>
                        <Flex
                            align="center"
                            justify="center"
                            py={2.5}
                            borderRadius="lg"
                            cursor="pointer"
                            bg={isActive ? activeBg : 'transparent'}
                            color={isActive ? activeColor : textColor}
                            _hover={{ bg: isActive ? activeBg : hoverBg, color: isActive ? activeColor : textHover }}
                            transition="all 0.15s ease"
                        >
                            <Icon as={item.icon} boxSize={5} />
                        </Flex>
                    </ChakraLink>
                </Tooltip>
            );
        }

        return (
            <ChakraLink key={item.label} as={ReactRouterLink} to={item.path} onClick={() => isMobile && setIsMobileOpen(false)} _hover={{ textDecoration: 'none' }}>
                <Flex
                    align="center"
                    px={3}
                    py={2}
                    w="100%"
                    borderRadius="lg"
                    cursor="pointer"
                    bg={isActive ? activeBg : 'transparent'}
                    color={isActive ? activeColor : textColor}
                    _hover={{ bg: isActive ? activeBg : hoverBg, color: isActive ? activeColor : textHover }}
                    transition="all 0.15s ease"
                    fontWeight="500"
                    fontSize="sm"
                >
                    <HStack spacing={3}>
                        <Icon as={item.icon} boxSize={5} flexShrink={0} />
                        <Text noOfLines={1}>{item.label}</Text>
                    </HStack>
                </Flex>
            </ChakraLink>
        );
    };

    const SidebarLogo = ({ collapsed = false }) => (
        <Flex align="center" gap={3} px={collapsed ? 0 : 1}>
            <Flex
                bg="brand.600"
                color="white"
                w={9}
                h={9}
                borderRadius="lg"
                align="center"
                justify="center"
                flexShrink={0}
            >
                <Icon as={UtensilsCrossed} boxSize={5} />
            </Flex>
            {!collapsed && (
                <Text
                    fontSize="lg"
                    fontWeight="bold"
                    bgGradient="linear(to-r, brand.600, brand.400)"
                    bgClip="text"
                    noOfLines={1}
                >
                    Restaurant
                </Text>
            )}
        </Flex>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <Box
                display={{ base: 'none', lg: 'flex' }}
                flexDirection="column"
                w={isCollapsed ? '72px' : '260px'}
                transition="width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                position="fixed"
                top={0}
                left={0}
                h="full"
                zIndex="10"
                bg={bg}
                borderRight="1px solid"
                borderColor={borderColor}
            >
                <Flex
                    p={4}
                    justify={isCollapsed ? 'center' : 'space-between'}
                    align="center"
                    h="64px"
                    borderBottom="1px solid"
                    borderColor={borderColor}
                >
                    <SidebarLogo collapsed={isCollapsed} />
                    {!isCollapsed && (
                        <Button
                            variant="ghost"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            p={1.5}
                            borderRadius="lg"
                            size="sm"
                        >
                            <Icon as={ChevronsLeft} boxSize={4} />
                        </Button>
                    )}
                </Flex>

                {isCollapsed && (
                    <Flex justify="center" py={2} borderBottom="1px solid" borderColor={borderColor}>
                        <Button
                            variant="ghost"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            p={1.5}
                            borderRadius="lg"
                            size="sm"
                        >
                            <Icon
                                as={ChevronsLeft}
                                boxSize={4}
                                transform="rotate(180deg)"
                                transition="0.3s"
                            />
                        </Button>
                    </Flex>
                )}

                <VStack
                    spacing={1}
                    p={3}
                    flex="1"
                    align="stretch"
                    overflowY="auto"
                    overflowX="hidden"
                >
                    {navItems.map(item => (
                        <NavItem
                            key={item.label}
                            item={item}
                            isCollapsedView={isCollapsed}
                        />
                    ))}
                </VStack>

                <Box p={3} borderTop="1px solid" borderColor={borderColor}>
                    {!isCollapsed ? (
                        <Flex
                            align="center"
                            gap={3}
                            p={2}
                            borderRadius="lg"
                            _hover={{ bg: hoverBg }}
                            transition="all 0.15s ease"
                        >
                            <Avatar size="sm" name="User" bg="brand.500" color="white" />
                            <Box flex="1" minW={0}>
                                <Text fontSize="sm" fontWeight="600" noOfLines={1}>
                                    {localStorage.getItem('app_name') || 'Restaurant'}
                                </Text>
                                <Text fontSize="xs" color="gray.400" noOfLines={1}>
                                    Admin
                                </Text>
                            </Box>
                        </Flex>
                    ) : (
                        <Tooltip label="Restaurant" placement="right" hasArrow>
                            <Flex justify="center">
                                <Avatar size="sm" name="User" bg="brand.500" color="white" />
                            </Flex>
                        </Tooltip>
                    )}
                </Box>
            </Box>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <Box
                    position="fixed"
                    top={0}
                    left={0}
                    w="100%"
                    h="100%"
                    bg="blackAlpha.50"
                    backdropFilter="blur(4px)"
                    zIndex="9998"
                    onClick={() => setIsMobileOpen(false)}
                    transition="opacity 0.3s ease"
                />
            )}

            {/* Mobile Sidebar */}
            <Box
                position="fixed"
                top={0}
                left={0}
                w="280px"
                h="100%"
                bg={bg}
                zIndex="9999"
                boxShadow="2xl"
                display={{ base: 'flex', lg: 'none' }}
                flexDirection="column"
                transform={isMobileOpen ? 'translateX(0)' : 'translateX(-100%)'}
                transition="transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                onClick={(e) => e.stopPropagation()}
            >
                <Flex p={4} justify="space-between" align="center" h="64px" borderBottom="1px solid" borderColor={borderColor}>
                    <SidebarLogo />
                    <Button
                        variant="ghost"
                        onClick={() => setIsMobileOpen(false)}
                        p={1.5}
                        borderRadius="lg"
                        size="sm"
                    >
                        <Icon as={ChevronsLeft} boxSize={4} />
                    </Button>
                </Flex>

                <VStack spacing={1} p={3} flex="1" align="stretch" overflowY="auto">
                    {navItems.map(item => (
                        <NavItem key={item.label} item={item} isMobile={true} />
                    ))}
                </VStack>

                <Box p={3} borderTop="1px solid" borderColor={borderColor}>
                    <Flex align="center" gap={3} p={2} borderRadius="lg">
                        <Avatar size="sm" name="User" bg="brand.500" color="white" />
                        <Box flex="1" minW={0}>
                            <Text fontSize="sm" fontWeight="600" noOfLines={1}>
                                {localStorage.getItem('app_name') || 'Restaurant'}
                            </Text>
                            <Text fontSize="xs" color="gray.400" noOfLines={1}>
                                Admin
                            </Text>
                        </Box>
                    </Flex>
                </Box>
            </Box>
        </>
    );
}
