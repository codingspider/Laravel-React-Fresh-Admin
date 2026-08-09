import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    SimpleGrid,
    Text,
    Heading,
    Badge,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    HStack,
    Progress,
    Skeleton,
    Alert,
    AlertIcon,
    Avatar,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { usePermission } from '../../context/PermissionContext';
import { useCurrencyFormatter } from '../../useCurrencyFormatter.jsx';
import api from '../../axios';
import PageHeader from '../ui/PageHeader';
import DashboardStatCard from '../dashboard/DashboardStatCard';
import Dashboard from './Dashboard';
import { DASHBOARD_PATH } from '../../routes/superAdminRoutes';
import { PLATFORM_STATS } from '../../routes/apiRoutes';
import {
    Building2,
    CheckCircle2,
    Layers,
    CreditCard,
    Activity,
    FlaskConical,
    AlertTriangle,
    Wallet,
    Users,
    FileText,
} from 'lucide-react';
import useThemeColors from '../../hooks/useThemeColors';

const statusColorMap = (status) => {
    switch (status) {
        case 'active':
            return 'green';
        case 'trial':
            return 'blue';
        case 'expired':
        case 'cancelled':
            return 'red';
        case 'pending':
            return 'yellow';
        default:
            return 'gray';
    }
};

const formatDate = (dateStr, t) => {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return '—';
    }
};

export default function SuperAdminDashboard() {
    const { t } = useTranslation();
    const { hasRole } = usePermission();
    const { formatAmount } = useCurrencyFormatter();
    const colors = useThemeColors();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const isSuperAdmin = hasRole('super_admin') || hasRole('super-admin');

    useEffect(() => {
        if (!isSuperAdmin) {
            setLoading(false);
            return;
        }
        let active = true;
        const fetchStats = async () => {
            try {
                const res = await api.get(PLATFORM_STATS);
                if (active) {
                    setData(res.data?.data || {});
                    setError(false);
                }
            } catch {
                if (active) setError(true);
            } finally {
                if (active) setLoading(false);
            }
        };
        fetchStats();
        return () => {
            active = false;
        };
    }, [isSuperAdmin]);

    if (!isSuperAdmin) {
        return <Dashboard />;
    }

    const stats = data?.stats || {};

    const renderCards = () => {
        if (loading) {
            return Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} height="110px" borderRadius="xl" />
            ));
        }
        return (
            <>
                <DashboardStatCard
                    title={t('total_restaurants')}
                    value={stats.total_restaurants ?? 0}
                    icon={Building2}
                    iconColor="green.600"
                    iconBg="green.50"
                />
                <DashboardStatCard
                    title={t('active_restaurants')}
                    value={stats.active_restaurants ?? 0}
                    icon={CheckCircle2}
                    iconColor="teal.600"
                    iconBg="teal.50"
                />
                <DashboardStatCard
                    title={t('total_plans')}
                    value={stats.total_plans ?? 0}
                    icon={Layers}
                    iconColor="purple.600"
                    iconBg="purple.50"
                />
                <DashboardStatCard
                    title={t('active_plans')}
                    value={stats.active_plans ?? 0}
                    icon={FileText}
                    iconColor="cyan.600"
                    iconBg="cyan.50"
                />
                <DashboardStatCard
                    title={t('total_subscriptions')}
                    value={stats.total_subscriptions ?? 0}
                    icon={CreditCard}
                    iconColor="blue.600"
                    iconBg="blue.50"
                />
                <DashboardStatCard
                    title={t('active_subscriptions')}
                    value={stats.active_subscriptions ?? 0}
                    icon={Activity}
                    iconColor="green.600"
                    iconBg="green.50"
                />
                <DashboardStatCard
                    title={t('trial_subscriptions')}
                    value={stats.trial_subscriptions ?? 0}
                    icon={FlaskConical}
                    iconColor="orange.600"
                    iconBg="orange.50"
                />
                <DashboardStatCard
                    title={t('expired_subscriptions')}
                    value={stats.expired_subscriptions ?? 0}
                    icon={AlertTriangle}
                    iconColor="red.600"
                    iconBg="red.50"
                />
                <DashboardStatCard
                    title={t('subscription_revenue')}
                    value={formatAmount(stats.subscription_revenue ?? 0)}
                    icon={Wallet}
                    iconColor="pink.600"
                    iconBg="pink.50"
                />
            </>
        );
    };

    const recentRestaurants = data?.recent_restaurants || [];
    const recentSubscriptions = data?.recent_subscriptions || [];
    const planDistribution = data?.plan_distribution || [];
    const statusDistribution = data?.status_distribution || [];

    const maxPlanTotal = Math.max(1, ...planDistribution.map((p) => p.total));

    return (
        <Box>
            <PageHeader
                title="Platform Dashboard"
                subtitle="Overview of all restaurants, plans and subscriptions"
                breadcrumbs={[
                    { label: t('Dashboard'), path: DASHBOARD_PATH, isCurrent: true },
                ]}
            />

            {error && (
                <Alert status="error" borderRadius="lg" mb={6} py={4} px={6} variant="subtle">
                    <AlertIcon boxSize={5} />
                    <Box flex="1">
                        <Heading size="sm" mb={1}>
                            {t('Failed to load dashboard data')}
                        </Heading>
                        <Text fontSize="sm">{t('Please try again later.')}</Text>
                    </Box>
                </Alert>
            )}

            {!error && (
                <>
                    <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} spacing={{ base: 3, md: 4 }} mb={6}>
                        {renderCards()}
                    </SimpleGrid>

                    <Grid
                        templateColumns={{ base: '1fr', lg: '3fr 2fr' }}
                        gap={{ base: 4, md: 6 }}
                        mb={6}
                    >
                        <Box
                            bg={colors.bgCard}
                            borderRadius="xl"
                            border="1px solid"
                            borderColor={colors.borderDefault}
                            p={5}
                        >
                            <Heading size="sm" mb={4}>
                                {t('Recent Restaurants')}
                            </Heading>
                            {loading ? (
                                <Skeleton height="160px" />
                            ) : recentRestaurants.length === 0 ? (
                                <Text color={colors.textMuted} fontSize="sm">
                                    {t('No restaurants found')}
                                </Text>
                            ) : (
                                <Box overflowX="auto">
                                    <Table size="sm" variant="unstyled">
                                        <Thead>
                                            <Tr>
                                                <Th>{t('Restaurant')}</Th>
                                                <Th>{t('Owner')}</Th>
                                                <Th>{t('Status')}</Th>
                                                <Th>{t('Created')}</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {recentRestaurants.map((r) => (
                                                <Tr key={r.id}>
                                                    <Td>
                                                        <HStack spacing={3}>
                                                            <Avatar
                                                                size="sm"
                                                                name={r.name}
                                                                src={r.logo || undefined}
                                                            />
                                                            <Text fontWeight="medium" noOfLines={1}>
                                                                {r.name}
                                                            </Text>
                                                        </HStack>
                                                    </Td>
                                                    <Td noOfLines={1}>{r.owner_name || '—'}</Td>
                                                    <Td>
                                                        <Badge colorScheme={statusColorMap(r.status)}>
                                                            {t(r.status)}
                                                        </Badge>
                                                    </Td>
                                                    <Td whiteSpace="nowrap">
                                                        {formatDate(r.created_at, t)}
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            )}
                        </Box>

                        <Box
                            bg={colors.bgCard}
                            borderRadius="xl"
                            border="1px solid"
                            borderColor={colors.borderDefault}
                            p={5}
                        >
                            <Heading size="sm" mb={4}>
                                {t('Subscription Status')}
                            </Heading>
                            {loading ? (
                                <Skeleton height="160px" />
                            ) : statusDistribution.length === 0 ? (
                                <Text color={colors.textMuted} fontSize="sm">
                                    {t('No data available')}
                                </Text>
                            ) : (
                                <Box>
                                    {statusDistribution.map((s) => (
                                        <HStack key={s.status} justify="space-between" py={2}>
                                            <HStack spacing={2}>
                                                <Badge colorScheme={statusColorMap(s.status)}>
                                                    {t(s.status)}
                                                </Badge>
                                                <Text fontSize="sm" color={colors.textSecondary}>
                                                    {s.total}
                                                </Text>
                                            </HStack>
                                            <Progress
                                                size="sm"
                                                width="40%"
                                                colorScheme={statusColorMap(s.status)}
                                                value={(s.total / Math.max(1, statusDistribution.reduce((a, b) => a + b.total, 0))) * 100}
                                                borderRadius="full"
                                            />
                                        </HStack>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Grid>

                    <Grid
                        templateColumns={{ base: '1fr', lg: '3fr 2fr' }}
                        gap={{ base: 4, md: 6 }}
                        mb={6}
                    >
                        <Box
                            bg={colors.bgCard}
                            borderRadius="xl"
                            border="1px solid"
                            borderColor={colors.borderDefault}
                            p={5}
                        >
                            <Heading size="sm" mb={4}>
                                {t('Recent Subscriptions')}
                            </Heading>
                            {loading ? (
                                <Skeleton height="160px" />
                            ) : recentSubscriptions.length === 0 ? (
                                <Text color={colors.textMuted} fontSize="sm">
                                    {t('No subscriptions found')}
                                </Text>
                            ) : (
                                <Box overflowX="auto">
                                    <Table size="sm" variant="unstyled">
                                        <Thead>
                                            <Tr>
                                                <Th>{t('Restaurant')}</Th>
                                                <Th>{t('Plan')}</Th>
                                                <Th>{t('Status')}</Th>
                                                <Th>{t('Started')}</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {recentSubscriptions.map((s) => (
                                                <Tr key={s.id}>
                                                    <Td>
                                                        <HStack spacing={3}>
                                                            <Users size={16} color={colors.textMuted} />
                                                            <Text fontWeight="medium" noOfLines={1}>
                                                                {s.restaurant_name || '—'}
                                                            </Text>
                                                        </HStack>
                                                    </Td>
                                                    <Td noOfLines={1}>{s.plan_name || '—'}</Td>
                                                    <Td>
                                                        <Badge colorScheme={statusColorMap(s.status)}>
                                                            {t(s.status)}
                                                        </Badge>
                                                    </Td>
                                                    <Td whiteSpace="nowrap">
                                                        {formatDate(s.starts_at, t)}
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            )}
                        </Box>

                        <Box
                            bg={colors.bgCard}
                            borderRadius="xl"
                            border="1px solid"
                            borderColor={colors.borderDefault}
                            p={5}
                        >
                            <Heading size="sm" mb={4}>
                                {t('Plan Distribution')}
                            </Heading>
                            {loading ? (
                                <Skeleton height="160px" />
                            ) : planDistribution.length === 0 ? (
                                <Text color={colors.textMuted} fontSize="sm">
                                    {t('No data available')}
                                </Text>
                            ) : (
                                <Box>
                                    {planDistribution.map((p) => (
                                        <Box key={p.plan_name} py={2}>
                                            <HStack justify="space-between" mb={1}>
                                                <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                                    {p.plan_name}
                                                </Text>
                                                <Text fontSize="sm" color={colors.textSecondary}>
                                                    {p.total}
                                                </Text>
                                            </HStack>
                                            <Progress
                                                size="sm"
                                                colorScheme="blue"
                                                value={(p.total / maxPlanTotal) * 100}
                                                borderRadius="full"
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Grid>
                </>
            )}
        </Box>
    );
}
