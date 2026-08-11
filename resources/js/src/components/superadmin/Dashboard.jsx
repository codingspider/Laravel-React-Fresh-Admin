import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Alert, AlertIcon, AlertTitle, AlertDescription, Badge, Text, HStack, Button, Input, Flex, useColorModeValue } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { usePermission } from '../../context/PermissionContext';
import { useCurrencyFormatter } from '../../useCurrencyFormatter';
import api from '../../axios';
import PageHeader from '../ui/PageHeader';
import DashboardStatCard from '../dashboard/DashboardStatCard';
import HourlySalesTrend from '../dashboard/HourlySalesTrend';
import SalesAnalytics from '../dashboard/SalesAnalytics';
import TopSellingProducts from '../dashboard/TopSellingProducts';
import BranchSalesComparison from '../dashboard/BranchSalesComparison';
import BestPerformingBranches from '../dashboard/BestPerformingBranches';
import OrderTypeDistribution from '../dashboard/OrderTypeDistribution';
import OrderStatusDistribution from '../dashboard/OrderStatusDistribution';
import LowStockAlerts from '../dashboard/LowStockAlerts';
import CashMovementsOverview from '../dashboard/CashMovementsOverview';
import PaymentsOverview from '../dashboard/PaymentsOverview';
import BranchFilter from '../ui/BranchFilter';
import useThemeColors from '../../hooks/useThemeColors';
import {
    DollarSign,
    ShoppingCart,
    ShoppingBag,
    TrendingUp,
    Users,
    LayoutList,
    Package,
    FolderOpen,
    Calendar,
    X,
} from 'lucide-react';
import { DASHBOARD_STATS } from '../../routes/apiRoutes';

const SubscriptionAlert = () => {
    const { hasRole } = usePermission();
    const { t } = useTranslation();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const res = await api.get('/user');
                setUserData(res.data.data || res.data);
                setLoading(false);
            } catch {
                setLoading(false);
            }
        };
        fetchSubscription();
    }, []);

    if (loading || !hasRole('restaurant_owner')) {
        return null;
    }

    const now = new Date();

    if (!userData) return null;

    const sub = userData.subscription;
    const subscriptionStatus = userData.subscription_status || 'none';
    const trialEndsAt = userData.trial_ends_at
        ? new Date(userData.trial_ends_at)
        : sub?.trial_ends_at
            ? new Date(sub.trial_ends_at)
            : null;

    if (subscriptionStatus === 'expired') {
        return (
            <Alert status="error" borderRadius="lg" mb={6} py={4} px={6} variant="subtle">
                <AlertIcon boxSize={5} />
                <Box flex="1">
                    <AlertTitle fontSize="md" fontWeight="600" mb={1}>
                        {t('Subscription')} {t('status')}
                    </AlertTitle>
                    <AlertDescription fontSize="sm">
                        {t('Your subscription has expired. Please renew to continue using all features.')}
                    </AlertDescription>
                </Box>
            </Alert>
        );
    }

    if (subscriptionStatus === 'none') {
        return (
            <Alert status="warning" borderRadius="lg" mb={6} py={4} px={6} variant="subtle">
                <AlertIcon boxSize={5} />
                <Box flex="1">
                    <AlertTitle fontSize="md" fontWeight="600" mb={1}>
                        {t('Subscription')} {t('status')}
                    </AlertTitle>
                    <AlertDescription fontSize="sm">
                        {t('You do not have a subscription yet. Please subscribe to start using the system.')}
                    </AlertDescription>
                </Box>
            </Alert>
        );
    }

    const isTrial = sub?.is_trial || subscriptionStatus === 'trial';
    const endsAt = sub?.ends_at ? new Date(sub.ends_at) : null;

    let daysLeft = 0;
    let expiryDate = null;

    if (isTrial && trialEndsAt) {
        daysLeft = Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24));
        expiryDate = trialEndsAt;
    } else if (endsAt) {
        daysLeft = Math.ceil((endsAt - now) / (1000 * 60 * 60 * 24));
        expiryDate = endsAt;
    }

    if (daysLeft < 0) {
        return (
            <Alert status="error" borderRadius="lg" mb={6} py={4} px={6} variant="subtle">
                <AlertIcon boxSize={5} />
                <Box flex="1">
                    <AlertTitle fontSize="md" fontWeight="600" mb={1}>
                        {t('Subscription')} {t('status')}
                    </AlertTitle>
                    <AlertDescription fontSize="sm">
                        {t('Your subscription has expired. Please renew to continue using all features.')}
                    </AlertDescription>
                </Box>
            </Alert>
        );
    }

    if (!expiryDate) return null;

    const alertStatus = daysLeft <= 7 ? 'error' : daysLeft <= 30 ? 'warning' : 'success';
    const badgeColor = daysLeft <= 7 ? 'orange' : daysLeft <= 30 ? 'yellow' : 'green';

    return (
        <Alert
            status={alertStatus}
            borderRadius="lg"
            mb={6}
            py={4}
            px={6}
            variant="subtle"
        >
            <AlertIcon boxSize={5} />
            <Box flex="1">
                <AlertTitle fontSize="md" fontWeight="600" mb={1}>
                    {isTrial ? t('Trial') : t('Subscription')} {t('status')}
                </AlertTitle>
                <AlertDescription fontSize="sm">
                    {isTrial
                        ? t('Your trial period will expire in {{days}} days on {{date}}.', {
                            days: daysLeft,
                            date: expiryDate?.toLocaleDateString(),
                        })
                        : t('Your subscription will expire in {{days}} days on {{date}}.', {
                            days: daysLeft,
                            date: expiryDate?.toLocaleDateString(),
                        })}
                </AlertDescription>
            </Box>
            <Badge colorScheme={badgeColor} variant="subtle" borderRadius="full" px={3} py={1}>
                {daysLeft} {t('days remaining')}
            </Badge>
        </Alert>
    );
};

const QUICK_FILTERS = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'this_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'This Year', value: 'this_year' },
];

function getQuickDateRange(value) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (value) {
        case 'today':
            return { from: today.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
        case 'yesterday': {
            const y = new Date(today);
            y.setDate(y.getDate() - 1);
            return { from: y.toISOString().split('T')[0], to: y.toISOString().split('T')[0] };
        }
        case 'this_week': {
            const start = new Date(today);
            start.setDate(start.getDate() - start.getDay());
            return { from: start.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
        }
        case 'this_month': {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            return { from: start.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
        }
        case 'this_year': {
            const start = new Date(today.getFullYear(), 0, 1);
            return { from: start.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
        }
        default:
            return { from: '', to: '' };
    }
}

const ADMIN_ROLES = ['super_admin', 'admin', 'restaurant_owner'];

export default function Dashboard() {
    const { t } = useTranslation();
    const { can, user } = usePermission();
    const { formatAmount } = useCurrencyFormatter();
    const colors = useThemeColors();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [branchFilter, setBranchFilter] = useState(null);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [quickFilter, setQuickFilter] = useState('');

    const isAdmin = user?.roles?.some((role) => ADMIN_ROLES.includes(role));
    const userBranchId = user?.branch_id || null;

    useEffect(() => {
        const app_name = localStorage.getItem('app_name');
        document.title = `${app_name} | ${t('Dashboard')}`;
    }, [t]);

    const fetchStats = useCallback(async () => {
        if (!can('view_dashboard_data')) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const params = {};
            if (isAdmin) {
                if (branchFilter) params.branch_id = branchFilter;
            } else if (userBranchId) {
                params.branch_id = userBranchId;
            }
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;
            const res = await api.get(DASHBOARD_STATS, { params });
            setStats(res.data.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch dashboard stats:', err);
            setError(t('Failed to load dashboard data'));
        } finally {
            setLoading(false);
        }
    }, [t, can, isAdmin, userBranchId, branchFilter, dateFrom, dateTo]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleQuickFilter = (value) => {
        setQuickFilter(value);
        if (value) {
            const range = getQuickDateRange(value);
            setDateFrom(range.from);
            setDateTo(range.to);
        } else {
            setDateFrom('');
            setDateTo('');
        }
    };

    const clearFilters = () => {
        setBranchFilter(null);
        setDateFrom('');
        setDateTo('');
        setQuickFilter('');
    };

    const statCards = stats ? [
        { title: t('Total Sales'), value: formatAmount(stats.stats.total_sales), icon: DollarSign, iconColor: '#22c55e', iconBg: 'rgba(34,197,94,0.1)' },
        { title: t('Total Orders'), value: stats.stats.total_orders?.toLocaleString(), icon: ShoppingCart, iconColor: '#f97316', iconBg: 'rgba(249,115,22,0.1)' },
        { title: t('Total Active Orders'), value: stats.stats.active_orders?.toLocaleString(), icon: ShoppingBag, iconColor: '#ef4444', iconBg: 'rgba(239,68,68,0.1)' },
        { title: t('Average Order Value'), value: formatAmount(stats.stats.average_order_value), icon: TrendingUp, iconColor: '#3b82f6', iconBg: 'rgba(59,130,246,0.1)' },
        { title: t('Total Users'), value: stats.stats.total_users?.toLocaleString(), icon: Users, iconColor: '#8b5cf6', iconBg: 'rgba(139,92,246,0.1)' },
        { title: t('Total Menus'), value: stats.stats.total_menus?.toLocaleString(), icon: LayoutList, iconColor: '#0d9488', iconBg: 'rgba(13,148,136,0.1)' },
        { title: t('Total Products'), value: stats.stats.total_products?.toLocaleString(), icon: Package, iconColor: '#ef4444', iconBg: 'rgba(239,68,68,0.1)' },
        { title: t('Total Categories'), value: stats.stats.total_categories?.toLocaleString(), icon: FolderOpen, iconColor: '#f97316', iconBg: 'rgba(249,115,22,0.1)' },
    ] : [];

    return (
        <Box>
            <PageHeader
                title={t('Dashboard')}
                subtitle={t("Welcome back! Here's an overview of your restaurant.")}
                breadcrumbs={[
                    { label: t('Home'), path: '/dashboard' },
                    { label: t('Dashboard'), isCurrent: true },
                ]}
            />

            <SubscriptionAlert />

            {error && (
                <Alert status="error" borderRadius="lg" mb={6} variant="subtle">
                    <AlertIcon />
                    <Text fontSize="sm">{error}</Text>
                </Alert>
            )}

            {/* Filters */}
            <Box bg={colors.bgCard} p={{ base: 4, md: 5 }} borderRadius="xl" border="1px solid" borderColor={colors.borderDefault} mb={{ base: 5, md: 6 }}>
                <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'flex-end' }} gap={3} flexWrap="wrap">
                    {isAdmin && <BranchFilter value={branchFilter} onChange={setBranchFilter} />}
                    <Box>
                        <Text fontSize="xs" color={colors.textSecondary} mb={1}>{t('Date From')}</Text>
                        <Input
                            type="date"
                            size="md"
                            value={dateFrom}
                            onChange={(e) => { setDateFrom(e.target.value); setQuickFilter(''); }}
                            borderRadius="lg"
                            bg={colors.bgSubtle}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="xs" color={colors.textSecondary} mb={1}>{t('Date To')}</Text>
                        <Input
                            type="date"
                            size="md"
                            value={dateTo}
                            onChange={(e) => { setDateTo(e.target.value); setQuickFilter(''); }}
                            borderRadius="lg"
                            bg={colors.bgSubtle}
                        />
                    </Box>
                    <HStack spacing={2} flexWrap="wrap">
                        {QUICK_FILTERS.map((f) => (
                            <Button
                                key={f.value}
                                size="sm"
                                variant={quickFilter === f.value ? 'primary' : 'outline'}
                                borderRadius="lg"
                                onClick={() => handleQuickFilter(quickFilter === f.value ? '' : f.value)}
                                fontWeight="500"
                            >
                                {t(f.label)}
                            </Button>
                        ))}
                    </HStack>
                    {(branchFilter || dateFrom || dateTo) && (
                        <Button
                            size="sm"
                            variant="ghost"
                            borderRadius="lg"
                            onClick={clearFilters}
                            leftIcon={<X size={14} />}
                        >
                            {t('Clear')}
                        </Button>
                    )}
                </Flex>
            </Box>

            {/* Stats Cards - Row 1 (4 cards) */}
            <Grid
                templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
                gap={{ base: 4, md: 5 }}
                mb={{ base: 5, md: 6 }}
            >
                {statCards.slice(0, 4).map((stat, i) => (
                    <DashboardStatCard key={i} {...stat} index={i} />
                ))}
            </Grid>

            {/* Stats Cards - Row 2 (4 cards) */}
            <Grid
                templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
                gap={{ base: 4, md: 5 }}
                mb={{ base: 5, md: 6 }}
            >
                {statCards.slice(4, 8).map((stat, i) => (
                    <DashboardStatCard key={i} {...stat} index={i + 4} />
                ))}
            </Grid>

            {/* Hourly Sales Trend - Full Width */}
            <Box mb={{ base: 5, md: 6 }}>
                <HourlySalesTrend data={stats?.hourly_sales_trend || []} />
            </Box>

            {/* Sales Analytics + Top Selling Products */}
            <Grid
                templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
                gap={{ base: 4, md: 6 }}
                mb={{ base: 5, md: 6 }}
            >
                <SalesAnalytics data={stats?.sales_analytics || []} />
                <TopSellingProducts data={stats?.top_selling_products || []} />
            </Grid>

            {/* Branch Sales + Best Performing Branches */}
            <Grid
                templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
                gap={{ base: 4, md: 6 }}
                mb={{ base: 5, md: 6 }}
            >
                <BranchSalesComparison data={stats?.branch_sales_comparison || []} />
                <BestPerformingBranches data={stats?.best_performing_branches || []} />
            </Grid>

            {/* Order Type + Order Status + Low Stock */}
            <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
                gap={{ base: 4, md: 6 }}
                mb={{ base: 5, md: 6 }}
            >
                <OrderTypeDistribution data={stats?.order_type_distribution || []} />
                <OrderStatusDistribution data={stats?.order_status_distribution || []} />
                <LowStockAlerts data={stats?.low_stock_alerts || []} />
            </Grid>

            {/* Cash Movements + Payments Overview */}
            <Grid
                templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
                gap={{ base: 4, md: 6 }}
                mb={{ base: 5, md: 6 }}
            >
                <CashMovementsOverview data={stats?.cash_movements || {}} />
                <PaymentsOverview data={stats?.payments_overview || {}} />
            </Grid>
        </Box>
    );
}
