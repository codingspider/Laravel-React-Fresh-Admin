import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    UserCheck,
    FileText,
    Star,
    Bell,
    BarChart3,
    History,
    Database,
    HeartHandshake,
} from 'lucide-react';
import {
    DASHBOARD_PATH,
    FAQ_LIST_PATH,
    PLATFORM_REPORTS_PATH,
    PACKAGE_REPORT_PATH,
    PLAN_REPORT_PATH,
    SUBSCRIPTION_REPORT_PATH,
    RESTAURANT_REPORT_PATH,
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
    HRM_DEPARTMENT_LIST_PATH,
    HRM_DESIGNATION_LIST_PATH,
    HRM_EMPLOYEE_LIST_PATH,
    HRM_ATTENDANCE_LIST_PATH,
    HRM_LEAVE_LIST_PATH,
    HRM_HOLIDAY_LIST_PATH,
    HRM_PAYROLL_LIST_PATH,
    ACCOUNTING_LIST_PATH,
    INCOME_LIST_PATH,
    EXPENSE_LIST_PATH,
    EXPENSE_CATEGORY_LIST_PATH,
    CASH_BANK_LIST_PATH,
    JOURNAL_LIST_PATH,
    LEDGER_LIST_PATH,
    TRIAL_BALANCE_PATH,
    PROFIT_LOSS_PATH,
    BALANCE_SHEET_PATH,
    CASH_FLOW_PATH,
    ACCOUNTING_DASHBOARD_PATH,
    SALE_REPORT_PATH,
    PURCHASE_REPORT_PATH,
    TAX_REPORT_PATH,
    EXPENSE_REPORT_PATH,
    LOYALTY_SETTINGS_PATH,
    LOYALTY_CUSTOMERS_PATH,
    LOYALTY_TRANSACTIONS_PATH,
    CRM_DASHBOARD_PATH,
    CRM_CUSTOMER_LIST_PATH,
    CRM_SEGMENT_LIST_PATH,
    CRM_FOLLOW_UP_LIST_PATH,
    NOTIFICATIONS_PATH,
    ACTIVITY_LOG_PATH,
    BACKUP_LIST_PATH,
    RESTAURANT_LIST_PATH,
    BRANCH_LIST_PATH,
    MENU_CATEGORY_LIST_PATH,
    MENU_ITEM_LIST_PATH,
    MODIFIER_GROUP_LIST_PATH,
    FLOOR_LIST_PATH,
    TABLE_LIST_PATH,
    RESERVATION_LIST_PATH,
    POS_TERMINAL_PATH,
    POS_SALES_PATH,
    POS_COUPONS_PATH,
    POS_SETTINGS_PATH,
    KITCHEN_DISPLAY_PATH,
    CUSTOMER_DISPLAY_SETTINGS_PATH,
    SETTINGS_PATH,
    GENERAL_SETTINGS_PATH,
} from '../../routes/superAdminRoutes';
import { usePermission } from '../../context/PermissionContext';

const navItems = (t) => [
    {
        path: DASHBOARD_PATH,
        icon: LayoutDashboard,
        label: t('dashboard'),
        permission: 'view_dashboard_data',
    },
    {
        icon: Crown,
        label: t('super_admin'),
        role: 'super_admin',
        children: [
            { path: RESTAURANT_LIST_PATH, label: t('restaurants'), permission: 'view_restaurants' },
            { path: PACKAGE_LIST_PATH, label: t('packages'), permission: 'view_packages' },
            { path: PLAN_LIST_PATH, label: t('plans'), permission: 'view_plans' },
            { path: SUBSCRIPTION_LIST_PATH, label: t('subscriptions'), permission: 'view_subscriptions' },
            { path: FAQ_LIST_PATH, label: t('faqs') },
        ],
    },
    {
        icon: BarChart3,
        label: t('platform_reports'),
        role: 'super_admin',
        children: [
            { path: PLATFORM_REPORTS_PATH, label: t('platform_overview') },
            { path: PLAN_REPORT_PATH, label: t('plan_report') },
            { path: SUBSCRIPTION_REPORT_PATH, label: t('subscription_report') },
            { path: RESTAURANT_REPORT_PATH, label: t('restaurant_report') },
        ],
    },
    {
        icon: GitBranch,
        label: t('branches'),
        permission: 'view_branches',
        excludeRole: 'super_admin',
        children: [
            { path: BRANCH_LIST_PATH, label: t('all_branches'), permission: 'view_branches' },
        ],
    },
    {
        icon: Utensils,
        label: t('menu'),
        permission: 'view_menu_items',
        excludeRole: 'super_admin',
        children: [
            { path: MENU_CATEGORY_LIST_PATH, label: t('categories'), permission: 'view_menu_categories' },
            { path: MENU_ITEM_LIST_PATH, label: t('items'), permission: 'view_menu_items' },
            { path: MODIFIER_GROUP_LIST_PATH, label: t('modifier_groups'), permission: 'view_modifier_groups' },
        ],
    },
    {
        icon: Grid3x3,
        label: t('table_management'),
        permission: 'view_tables',
        excludeRole: 'super_admin',
        children: [
            { path: FLOOR_LIST_PATH, label: t('floors'), permission: 'view_floors' },
            { path: TABLE_LIST_PATH, label: t('tables'), permission: 'view_tables' },
            { path: RESERVATION_LIST_PATH, label: t('reservations'), permission: 'view_reservations' },
        ],
    },
    {
        icon: Monitor,
        label: t('pos'),
        permission: 'view_pos',
        excludeRole: 'super_admin',
        children: [
            { path: POS_TERMINAL_PATH, label: t('pos_terminal'), permission: 'view_pos' },
            { path: POS_SALES_PATH, label: t('sales_history'), permission: 'view_pos' },
            { path: POS_COUPONS_PATH, label: t('coupons'), permission: 'view_pos' },
            { path: POS_SETTINGS_PATH, label: t('pos_settings'), permission: 'view_pos' },
        ],
    },
    {
        icon: ChefHat,
        label: t('kitchen_display'),
        permission: 'view_kitchen_display',
        excludeRole: 'super_admin',
        children: [
            { path: KITCHEN_DISPLAY_PATH, label: t('kitchen_display'), permission: 'view_kitchen_display' },
        ],
    },

    {
        icon: UserCheck,
        label: t('hrm'),
        permission: 'view_employees',
        excludeRole: 'super_admin',
        children: [
            { path: HRM_DEPARTMENT_LIST_PATH, label: t('departments'), permission: 'view_departments' },
            { path: HRM_DESIGNATION_LIST_PATH, label: t('designations'), permission: 'view_designations' },
            { path: HRM_EMPLOYEE_LIST_PATH, label: t('employees'), permission: 'view_employees' },
            { path: HRM_ATTENDANCE_LIST_PATH, label: t('attendance'), permission: 'view_attendance' },
            // { path: HRM_LEAVE_LIST_PATH, label: t('leave_requests'), permission: 'view_leave_requests' },
            // { path: HRM_HOLIDAY_LIST_PATH, label: t('holidays'), permission: 'view_holidays' },
            { path: HRM_PAYROLL_LIST_PATH, label: t('payroll'), permission: 'view_payrolls' },
        ],
    },
    {
        icon: CreditCard,
        label: t('accounting'),
        permission: 'view_accounts',
        excludeRole: 'super_admin',
        children: [
            { path: ACCOUNTING_DASHBOARD_PATH, label: t('dashboard'), permission: 'view_accounting_dashboard' },
            { path: ACCOUNTING_LIST_PATH, label: t('chart_of_accounts'), permission: 'view_accounts' },
            { path: INCOME_LIST_PATH, label: t('income'), permission: 'view_income' },
            { path: EXPENSE_LIST_PATH, label: t('expenses'), permission: 'view_expenses' },
            { path: EXPENSE_CATEGORY_LIST_PATH, label: t('expense_categories'), permission: 'view_expense_categories' },
            { path: CASH_BANK_LIST_PATH, label: t('cash_bank'), permission: 'view_cash_bank' },
            { path: JOURNAL_LIST_PATH, label: t('journal_entries'), permission: 'view_journal_entries' },
            { path: LEDGER_LIST_PATH, label: t('ledger'), permission: 'view_ledger' },
            { path: TRIAL_BALANCE_PATH, label: t('trial_balance'), permission: 'view_trial_balance' },
        ],
    },
    {
        icon: FileText,
        label: t('reports'),
        permission: 'view_reports',
        excludeRole: 'super_admin',
        children: [
            { path: PROFIT_LOSS_PATH, label: t('profit_loss'), permission: 'view_profit_loss_report' },
            { path: SALE_REPORT_PATH, label: t('sales_report'), permission: 'view_sale_report' },
            { path: PURCHASE_REPORT_PATH, label: t('purchase_report'), permission: 'view_purchase_report' },
            { path: TAX_REPORT_PATH, label: t('tax_report'), permission: 'view_tax_report' },
            { path: EXPENSE_REPORT_PATH, label: t('expense_report'), permission: 'view_expense_report' },
        ],
    },
    {
        icon: Star,
        label: t('loyalty'),
        permission: 'view_loyalty_settings',
        excludeRole: 'super_admin',
        children: [
            { path: LOYALTY_SETTINGS_PATH, label: t('programme'), permission: 'view_loyalty_settings' },
            { path: LOYALTY_CUSTOMERS_PATH, label: t('customers'), permission: 'view_loyalty_customers' },
            { path: LOYALTY_TRANSACTIONS_PATH, label: t('transactions'), permission: 'view_loyalty_transactions' },
        ],
    },
    {
        icon: HeartHandshake,
        label: t('crm'),
        permission: 'view_customers',
        excludeRole: 'super_admin',
        children: [
            { path: CRM_DASHBOARD_PATH, label: t('dashboard'), permission: 'view_crm_dashboard' },
            { path: CRM_CUSTOMER_LIST_PATH, label: t('customers'), permission: 'view_customers' },
            { path: CRM_SEGMENT_LIST_PATH, label: t('segments'), permission: 'view_segments' },
            { path: CRM_FOLLOW_UP_LIST_PATH, label: t('follow_ups'), permission: 'view_follow_ups' },
        ],
    },
    {
        path: NOTIFICATIONS_PATH,
        icon: Bell,
        label: t('notifications'),
        permission: 'view_notifications',
        excludeRole: 'super_admin',
    },
    {
        path: ACTIVITY_LOG_PATH,
        icon: History,
        label: t('activity_logs'),
        permission: 'view_activity_logs',
    },
    {
        path: BACKUP_LIST_PATH,
        icon: Database,
        label: t('backups'),
        permission: 'view_backups',
    },
    {
        icon: MonitorPlay,
        label: t('customer_display'),
        permission: 'view_customer_display',
        excludeRole: 'super_admin',
        children: [
            { path: CUSTOMER_DISPLAY_SETTINGS_PATH, label: t('settings'), permission: 'manage_customer_display' },
        ],
    },
    {
        icon: Package,
        label: t('inventory'),
        permission: 'view_inventory',
        excludeRole: 'super_admin',
        children: [
            { path: INVENTORY_ITEM_LIST_PATH, label: t('all_items'), permission: 'view_inventory' },
            { path: INVENTORY_CATEGORY_LIST_PATH, label: t('categories'), permission: 'view_inventory' },
            { path: CUSTOMER_LIST_PATH, label: t('customers'), permission: 'view_inventory' },
            { path: SUPPLIER_LIST_PATH, label: t('suppliers'), permission: 'view_inventory' },
            { path: UNIT_LIST_PATH, label: t('units'), permission: 'view_units' },
        ],
    },

    {
        icon: ChefHat,
        label: t('recipes'),
        permission: 'view_recipes',
        excludeRole: 'super_admin',
        children: [
            { path: RECIPE_LIST_PATH, label: t('all_recipes'), permission: 'view_recipes' },
            { path: RECIPE_CATEGORY_LIST_PATH, label: t('categories'), permission: 'view_recipes' },
        ],
    },

    {
        icon: ShoppingCart,
        label: t('purchases'),
        permission: 'view_purchases',
        excludeRole: 'super_admin',
        children: [
            { path: PURCHASE_LIST_PATH, label: t('all_purchases'), permission: 'view_purchases' },
        ],
    },

    {
        icon: Boxes,
        label: t('stock_movements'),
        permission: 'view_stock_movements',
        excludeRole: 'super_admin',
        children: [
            { path: STOCK_OVERVIEW_PATH, label: t('overview'), permission: 'view_stock_movements' },
            { path: STOCK_TRANSACTIONS_PATH, label: t('transactions'), permission: 'view_stock_movements' },
            // { path: STOCK_BATCHES_PATH, label: t('batches'), permission: 'view_stock_movements' },
            { path: STOCK_TRANSFERS_PATH, label: t('transfers'), permission: 'view_stock_movements' },
            { path: STOCK_ADJUSTMENTS_PATH, label: t('adjustments'), permission: 'view_stock_movements' },
            { path: STOCK_WASTE_PATH, label: t('waste'), permission: 'view_stock_movements' },
        ],
    },

    {
        icon: Users,
        label: t('user_management'),
        permission: 'view_user',
        excludeRole: 'super_admin',
        children: [
            { path: USER_LIST_PATH, label: t('all_users'), permission: 'view_user' },
            { path: ROLE_LIST_PATH, label: t('roles_permissions'), permission: 'role_list', role: 'restaurant_owner' },
        ],
    },

    {
        icon: Settings,
        label: t('currencies'),
        permission: 'view_currencies',
        role: 'super_admin',
        children: [
            { path: CURRENCY_LIST_PATH, label: t('all_currencies'), permission: 'view_currencies' },
        ],
    },

    {
        path: SETTINGS_PATH,
        icon: Settings,
        label: t('settings'),
        role: 'super_admin',
    },
    {
        path: GENERAL_SETTINGS_PATH,
        icon: Settings,
        label: t('general_settings'),
        permission: 'access_business_settings',
        excludeRole: 'super_admin',
    },
];

export default function SidebarContent({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
    const { can, hasRole, restaurant } = usePermission();
    const { t } = useTranslation();
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
                if (child.role && !hasRole(child.role)) return false;
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
                        maxH={isOpen ? '500px' : '0'}
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
                    {restaurant?.name || localStorage.getItem('app_name') || 'Restaurant'}
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
                    {navItems(t).map(item => (
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
                    {navItems(t).map(item => (
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
