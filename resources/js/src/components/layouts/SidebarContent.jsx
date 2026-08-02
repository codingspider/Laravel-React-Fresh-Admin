import React, { useState } from 'react';
import {
    Box,
    Flex,
    Text,
    Icon,
    Button,
    VStack,
    HStack,
    Tooltip,
    Divider,
    Avatar,
} from '@chakra-ui/react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Link as ChakraLink } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import useThemeColors from '../../hooks/useThemeColors';
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
    Crown,
    CreditCard,
    CalendarCheck,
    Boxes,
    ChefHat,
    MonitorPlay,
} from 'lucide-react';
import {
    DASHBOARD_PATH,
    ROLE_LIST_PATH,
    USER_LIST_PATH,
    INVENTORY_ITEM_LIST_PATH,
    INVENTORY_CATEGORY_LIST_PATH,
    SUPPLIER_LIST_PATH,
    CUSTOMER_LIST_PATH,
    UNIT_LIST_PATH,
    CATEGORY_LIST_PATH,
    CURRENCY_LIST_PATH,
    PACKAGE_LIST_PATH,
    PLAN_LIST_PATH,
    SUBSCRIPTION_LIST_PATH,
    RECIPE_LIST_PATH,
    RECIPE_CATEGORY_LIST_PATH,
    PURCHASE_LIST_PATH,
    STOCK_OVERVIEW_PATH,
    STOCK_TRANSACTIONS_PATH,
    STOCK_BATCHES_PATH,
    STOCK_TRANSFERS_PATH,
    STOCK_ADJUSTMENTS_PATH,
    STOCK_WASTE_PATH,
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
        icon: Crown,
        label: 'Super Admin',
        role: 'super_admin',
        children: [
            { path: '/restaurant/list', label: 'Restaurants', permission: 'view_restaurants' },
            { path: PACKAGE_LIST_PATH, label: 'Packages', permission: 'view_packages' },
            { path: PLAN_LIST_PATH, label: 'Plans', permission: 'view_plans' },
            { path: SUBSCRIPTION_LIST_PATH, label: 'Subscriptions', permission: 'view_subscriptions' },
        ],
    },
    {
        icon: GitBranch,
        label: 'Branches',
        permission: 'view_branches',
        excludeRole: 'super_admin',
        children: [
            { path: '/branch/list', label: 'All Branches', permission: 'view_branches' },
        ],
    },
    {
        icon: Utensils,
        label: 'Menu',
        permission: 'view_menu_items',
        excludeRole: 'super_admin',
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
        excludeRole: 'super_admin',
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
        excludeRole: 'super_admin',
        children: [
            { path: '/pos/terminal', label: 'POS Terminal', permission: 'view_pos' },
            { path: '/pos/sales', label: 'Sales History', permission: 'view_pos' },
            { path: '/pos/coupons', label: 'Coupons', permission: 'view_pos' },
            { path: '/pos/settings', label: 'POS Settings', permission: 'view_pos' },
        ],
    },
    {
        icon: ChefHat,
        label: 'Kitchen',
        permission: 'view_kitchen_display',
        excludeRole: 'super_admin',
        children: [
            { path: '/kitchen/display', label: 'Kitchen Display', permission: 'view_kitchen_display' },
        ],
    },
    {
        icon: MonitorPlay,
        label: 'Customer Display',
        permission: 'view_customer_display',
        excludeRole: 'super_admin',
        children: [
            { path: '/customer-display/settings', label: 'Settings', permission: 'manage_customer_display' },
        ],
    },
    {
        icon: Package,
        label: 'Inventory',
        permission: 'view_inventory',
        excludeRole: 'super_admin',
        children: [
            { path: INVENTORY_ITEM_LIST_PATH, label: 'All Items', permission: 'view_inventory' },
            { path: INVENTORY_CATEGORY_LIST_PATH, label: 'Categories', permission: 'view_inventory' },
            { path: CUSTOMER_LIST_PATH, label: 'Customers', permission: 'view_inventory' },
            { path: SUPPLIER_LIST_PATH, label: 'Suppliers', permission: 'view_inventory' },
            { path: UNIT_LIST_PATH, label: 'Units', permission: 'view_units' },
        ],
    },

    {
        icon: ChefHat,
        label: 'Recipes',
        permission: 'view_recipes',
        excludeRole: 'super_admin',
        children: [
            { path: RECIPE_LIST_PATH, label: 'All Recipes', permission: 'view_recipes' },
            { path: RECIPE_CATEGORY_LIST_PATH, label: 'Categories', permission: 'view_recipes' },
        ],
    },

    {
        icon: ShoppingCart,
        label: 'Purchases',
        permission: 'view_purchases',
        excludeRole: 'super_admin',
        children: [
            { path: PURCHASE_LIST_PATH, label: 'All Purchases', permission: 'view_purchases' },
        ],
    },

    {
        icon: Boxes,
        label: 'Stock Movements',
        permission: 'view_stock_movements',
        excludeRole: 'super_admin',
        children: [
            { path: STOCK_OVERVIEW_PATH, label: 'Overview', permission: 'view_stock_movements' },
            { path: STOCK_TRANSACTIONS_PATH, label: 'Transactions', permission: 'view_stock_movements' },
            { path: STOCK_BATCHES_PATH, label: 'Batches', permission: 'view_stock_movements' },
            { path: STOCK_TRANSFERS_PATH, label: 'Transfers', permission: 'view_stock_movements' },
            { path: STOCK_ADJUSTMENTS_PATH, label: 'Adjustments', permission: 'view_stock_movements' },
            { path: STOCK_WASTE_PATH, label: 'Waste', permission: 'view_stock_movements' },
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
        icon: Settings,
        label: 'Currencies',
        permission: 'view_currencies',
        role: 'super_admin',
        children: [
            { path: CURRENCY_LIST_PATH, label: 'All Currencies', permission: 'view_currencies' },
        ],
    },

    {
        path: '/settings',
        icon: Settings,
        label: 'Settings',
        role: 'super_admin',
    },
    {
        path: '/settings/general',
        icon: Settings,
        label: 'General Settings',
        permission: 'access_business_settings',
        excludeRole: 'super_admin',
    },
];

export default function SidebarContent({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
    const { can, hasRole, restaurant } = usePermission();
    const [openMenus, setOpenMenus] = useState({});
    const location = useLocation();
    const colors = useThemeColors();

    const bg = colors.bgCard;
    const borderColor = colors.borderDefault;
    const hoverBg = colors.bgHover;
    const activeBg = colors.brandActive;
    const activeColor = 'brand.600';
    const textColor = colors.textSecondary;
    const textHover = colors.textPrimary;

    const checkActive = (path) => location.pathname === path;
    const checkActiveParent = (children) => children?.some(child => location.pathname === child.path);

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const NavItem = ({ item, isMobile = false, isCollapsedView = false }) => {
        if (item.permission && !can(item.permission)) return null;
        if (item.role && !hasRole(item.role)) return null;
        if (item.excludeRole && hasRole(item.excludeRole)) return null;

        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openMenus[item.label];
        const isActive = item.path ? checkActive(item.path) : hasChildren && checkActiveParent(item.children);

        if (hasChildren) {
            const visibleChildren = item.children.filter(child => {
                if (child.permission && !can(child.permission)) return false;
                if (child.excludeRole && hasRole(child.excludeRole)) return false;
                return true;
            });
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
                                    {restaurant?.name || localStorage.getItem('app_name') || 'Restaurant'}
                                </Text>
                                <Text fontSize="xs" color={colors.textMuted} noOfLines={1}>
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
                                {restaurant?.name || localStorage.getItem('app_name') || 'Restaurant'}
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
