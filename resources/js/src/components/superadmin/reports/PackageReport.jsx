import React, { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Grid,
    GridItem,
    Text,
    Button,
    Select,
    Badge,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    useToast,
    Spinner,
    SimpleGrid,
    HStack,
    Heading,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import api from '../../../axios';
import PageHeader from '../../ui/PageHeader';
import ReportSummaryCard from '../../admin/reports/ReportSummaryCard';
import ReportExport from '../../ui/ReportExport';
import useThemeColors from '../../../hooks/useThemeColors';
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';
import { REPORT_OVERVIEW, REPORT_PACKAGES } from '../../../routes/apiRoutes';

export default function PackageReport() {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const toast = useToast();
    const { formatAmount } = useCurrencyFormatter();

    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [overviewData, setOverviewData] = useState(null);
    const [packageData, setPackageData] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    const fetchOverview = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(REPORT_OVERVIEW);
            setOverviewData(res.data?.data || null);
        } catch {
            toast({ title: t('Failed to load overview'), status: 'error', duration: 3000, isClosable: true });
        } finally {
            setLoading(false);
        }
    }, [t, toast]);

    const fetchPackages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(REPORT_PACKAGES, {
                params: statusFilter ? { status: statusFilter } : {},
            });
            setPackageData(res.data?.data || null);
        } catch {
            toast({ title: t('Failed to load package report'), status: 'error', duration: 3000, isClosable: true });
        } finally {
            setLoading(false);
        }
    }, [t, toast, statusFilter]);

    useEffect(() => {
        if (activeTab === 'overview') {
            fetchOverview();
        } else {
            fetchPackages();
        }
    }, [activeTab, fetchOverview, fetchPackages]);

    const overviewStats = [
        { label: t('Total Restaurants'), value: overviewData?.platform_stats?.total_restaurants ?? 0 },
        { label: t('Active Restaurants'), value: overviewData?.platform_stats?.active_restaurants ?? 0, color: 'green.500' },
        { label: t('Total Plans'), value: overviewData?.platform_stats?.total_plans ?? 0 },
        { label: t('Active Plans'), value: overviewData?.platform_stats?.active_plans ?? 0, color: 'green.500' },
        { label: t('Total Subscriptions'), value: overviewData?.platform_stats?.total_subscriptions ?? 0 },
        { label: t('Active Subscriptions'), value: overviewData?.platform_stats?.active_subscriptions ?? 0, color: 'green.500' },
        { label: t('Total Revenue'), value: formatAmount(overviewData?.platform_stats?.total_revenue ?? 0), color: 'purple.500' },
    ];

    const packageStats = [
        { label: t('Total Packages'), value: packageData?.summary?.total_packages ?? 0 },
        { label: t('Active Packages'), value: packageData?.summary?.active_packages ?? 0, color: 'green.500' },
        { label: t('Inactive Packages'), value: packageData?.summary?.inactive_packages ?? 0, color: 'red.500' },
        { label: t('Total Plans Associated'), value: packageData?.summary?.total_plans_associated ?? 0 },
    ];

    const packageColumns = [
        { header: t('Name'), accessorKey: 'name' },
        { header: t('Slug'), accessorKey: 'slug' },
        { header: t('Status'), accessorKey: 'status' },
        { header: t('Plans Count'), accessorKey: 'plans_count' },
        { header: t('Created'), accessorKey: 'created_at' },
    ];

    return (
        <Box minH="calc(100vh - 64px)" bg={colors.bgMain} p={6}>
            <PageHeader
                title={t('Platform Reports')}
                subtitle={t('Overview of packages, plans, subscriptions and restaurants')}
                breadcrumbs={[
                    { label: t('Dashboard'), path: '/dashboard' },
                    { label: t('Platform Reports'), isCurrent: true },
                ]}
            >
                {activeTab === 'packages' && packageData && (
                    <ReportExport
                        title={t('Package Report')}
                        columns={packageColumns}
                        rows={(packageData.rows || []).map((pkg) => ({ ...pkg, created_at: pkg.created_at ? new Date(pkg.created_at).toLocaleDateString() : '-' }))}
                        filename="package-report"
                    />
                )}
            </PageHeader>

            <HStack spacing={4} mb={6} border="1px solid" borderColor={colors.borderDefault} borderRadius="lg" p={1.5} bg={colors.bgCard}>
                <Button
                    size="sm"
                    variant={activeTab === 'overview' ? 'solid' : 'ghost'}
                    colorScheme={activeTab === 'overview' ? 'teal' : 'gray'}
                    onClick={() => setActiveTab('overview')}
                >
                    {t('Platform Overview')}
                </Button>
                <Button
                    size="sm"
                    variant={activeTab === 'packages' ? 'solid' : 'ghost'}
                    colorScheme={activeTab === 'packages' ? 'teal' : 'gray'}
                    onClick={() => setActiveTab('packages')}
                >
                    {t('Package Report')}
                </Button>
            </HStack>

            {loading && (
                <Box textAlign="center" py={16}>
                    <Spinner color="teal.500" size="xl" />
                </Box>
            )}

            {!loading && activeTab === 'overview' && overviewData && (
                <>
                    <ReportSummaryCard stats={overviewStats} />

                    {overviewData.revenue_trend && overviewData.revenue_trend.length > 0 && (
                        <Box bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} p={6} mt={6}>
                            <Heading size="md" mb={4}>{t('Monthly Revenue Trend')}</Heading>
                            <SimpleGrid columns={{ base: 2, md: 6 }} spacing={3}>
                                {overviewData.revenue_trend.map((item) => (
                                    <Box key={item.month} bg={colors.bgMain} borderRadius="lg" p={3} textAlign="center">
                                        <Text fontSize="xs" color={colors.textSecondary}>{item.month}</Text>
                                        <Text fontWeight="600" color="green.400">{formatAmount(item.total)}</Text>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </Box>
                    )}

                    {overviewData.plan_distribution && (
                        <Box bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} p={6} mt={6}>
                            <Heading size="md" mb={4}>{t('Plan Distribution')}</Heading>
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                {overviewData.plan_distribution.map((item) => (
                                    <Box key={item.plan_name} bg={colors.bgMain} borderRadius="lg" p={4} textAlign="center">
                                        <Text fontWeight="600" mb={2}>{item.plan_name}</Text>
                                        <Text fontSize="3xl" color="brand.500">{item.total}</Text>
                                        <Text fontSize="xs" color={colors.textSecondary}>{t('subscriptions')}</Text>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </Box>
                    )}

                    {overviewData.status_distribution && (
                        <Box bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} p={6} mt={6}>
                            <Heading size="md" mb={4}>{t('Subscription Status Distribution')}</Heading>
                            <SimpleGrid columns={{ base: 2, md: 5 }} spacing={3}>
                                {Object.entries(overviewData.status_distribution).map(([status, count]) => (
                                    <Box key={status} bg={colors.bgMain} borderRadius="lg" p={3} textAlign="center">
                                        <Badge colorScheme={status === 'active' ? 'green' : status === 'cancelled' ? 'red' : status === 'expired' ? 'orange' : 'gray'} variant="subtle" mb={1}>
                                            {status}
                                        </Badge>
                                        <Text fontWeight="600" mt={1}>{count}</Text>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </Box>
                    )}
                </>
            )}

            {!loading && activeTab === 'packages' && packageData && (
                <>
                    <ReportSummaryCard stats={packageStats} />

                    <Box mt={6} bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} p={4}>
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(6, 1fr)' }} gap={4} alignItems="flex-end">
                            <GridItem>
                                <Text fontSize="xs" fontWeight="500" color={colors.textSecondary} mb={1}>{t('Status')}</Text>
                                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} size="md" placeholder={t('All Statuses')}>
                                    <option value="">{t('All Statuses')}</option>
                                    <option value="active">{t('Active')}</option>
                                    <option value="inactive">{t('Inactive')}</option>
                                </Select>
                            </GridItem>
                        </Grid>
                    </Box>

                    <Box bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mt={6} overflow="hidden">
                        <Box px={{ base: 4, md: 6 }} py={4} borderBottom="1px solid" borderColor={colors.borderDefault}>
                            <Text fontSize="md" fontWeight="600">{t('Package Details')}</Text>
                        </Box>
                        {(packageData.rows || []).length === 0 ? (
                            <Box p={10} textAlign="center">
                                <Text fontSize="sm" color={colors.textSecondary}>{t('No packages found')}</Text>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table variant="striped" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th fontSize="xs" textTransform="uppercase">{t('Name')}</Th>
                                            <Th fontSize="xs" textTransform="uppercase">{t('Slug')}</Th>
                                            <Th fontSize="xs" textTransform="uppercase">{t('Status')}</Th>
                                            <Th fontSize="xs" textTransform="uppercase">{t('Plans Count')}</Th>
                                            <Th fontSize="xs" textTransform="uppercase">{t('Created')}</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {(packageData.rows || []).map((pkg) => (
                                            <Tr key={pkg.id}>
                                                <Td fontWeight="500">{pkg.name}</Td>
                                                <Td>{pkg.slug}</Td>
                                                <Td>
                                                    <Badge colorScheme={pkg.status === 'active' ? 'green' : 'gray'} variant="subtle">{pkg.status}</Badge>
                                                </Td>
                                                <Td>{pkg.plans_count}</Td>
                                                <Td fontSize="xs" color={colors.textSecondary}>
                                                    {pkg.created_at ? new Date(pkg.created_at).toLocaleDateString() : '-'}
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                </>
            )}
        </Box>
    );
}
