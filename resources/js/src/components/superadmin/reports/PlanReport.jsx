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
    HStack,
    Heading,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import api from '../../../axios';
import PageHeader from '../../ui/PageHeader';
import ReportSummaryCard from '../../admin/reports/ReportSummaryCard';
import useThemeColors from '../../../hooks/useThemeColors';
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';
import { REPORT_PLANS } from '../../../routes/apiRoutes';

export default function PlanReport() {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const toast = useToast();
    const { formatAmount } = useCurrencyFormatter();

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [activeFilter, setActiveFilter] = useState('');

    const filterProps = {
        bg: colors.bgInput,
        border: '1px solid',
        borderColor: colors.borderInput,
        borderRadius: 'md',
        size: 'md',
        focusBorderColor: 'teal.500',
        _hover: { borderColor: colors.borderDefault },
        transition: 'all 0.2s',
    };

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(REPORT_PLANS, {
                params: {
                    ...(statusFilter ? { status: statusFilter } : {}),
                    ...(activeFilter !== '' ? { is_active: activeFilter } : {}),
                },
            });
            setData(res.data?.data || null);
        } catch {
            toast({ title: t('error_fetching_data'), status: 'error', duration: 3000, isClosable: true });
        } finally {
            setLoading(false);
        }
    }, [t, toast, statusFilter, activeFilter]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const summary = data?.summary || {};
    const stats = [
        { label: t('Total Plans'), value: summary.total_plans ?? 0 },
        { label: t('Active Plans'), value: summary.active_plans ?? 0, color: 'green.500' },
        { label: t('Inactive Plans'), value: summary.inactive_plans ?? 0, color: 'red.500' },
        { label: t('Total Subscriptions'), value: summary.total_subscriptions ?? 0 },
        { label: t('Estimated Revenue'), value: formatAmount(summary.estimated_revenue ?? 0), color: 'purple.500' },
    ];

    const columns = [
        { header: t('Name'), accessorKey: 'name' },
        { header: t('Slug'), accessorKey: 'slug' },
        { header: t('Price'), accessorKey: 'price' },
        { header: t('Billing Cycle'), accessorKey: 'billing_cycle' },
        { header: t('Branch Limit'), accessorKey: 'branch_limit' },
        { header: t('User Limit'), accessorKey: 'user_limit' },
        { header: t('Invoice Limit'), accessorKey: 'invoice_limit' },
        { header: t('Status'), accessorKey: 'status' },
        { header: t('Packages'), accessorKey: 'packages_count' },
        { header: t('Subscriptions'), accessorKey: 'subscriptions_count' },
        { header: t('Created'), accessorKey: 'created_at' },
    ];

    const rows = (data?.rows || []).map((plan) => ({
        ...plan,
        price: formatAmount(plan.price || 0),
        created_at: plan.created_at ? new Date(plan.created_at).toLocaleDateString() : '-',
    }));

    return (
        <Box minH="calc(100vh - 64px)" bg={colors.bgMain} p={6}>
            <PageHeader
                title={t('Plan Report')}
                subtitle={t('Subscription plans and their usage across the platform')}
                breadcrumbs={[
                    { label: t('Dashboard'), path: '/dashboard' },
                    { label: t('Platform Reports'), isCurrent: true },
                ]}
            />

            <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mb={6}>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(6, 1fr)' }} gap={4} alignItems="flex-end">
                    <GridItem>
                        <Text fontSize="xs" fontWeight="500" color={colors.textSecondary} mb={1}>{t('Status')}</Text>
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder={t('All Statuses')} {...filterProps}>
                            <option value="">{t('All Statuses')}</option>
                            <option value="active">{t('Active')}</option>
                            <option value="inactive">{t('Inactive')}</option>
                        </Select>
                    </GridItem>
                    <GridItem>
                        <Text fontSize="xs" fontWeight="500" color={colors.textSecondary} mb={1}>{t('Active')}</Text>
                        <Select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} placeholder={t('All')} {...filterProps}>
                            <option value="">{t('All')}</option>
                            <option value="1">{t('Enabled')}</option>
                            <option value="0">{t('Disabled')}</option>
                        </Select>
                    </GridItem>
                    <GridItem alignSelf="flex-end">
                        <Button colorScheme="teal" bg="teal.500" color="white" fontWeight="semibold" px={6} h={10} onClick={fetchPlans} isLoading={loading}>
                            {t('Generate')}
                        </Button>
                    </GridItem>
                </Grid>
            </Box>

            {loading && (
                <Box textAlign="center" py={16}>
                    <Spinner color="teal.500" size="xl" />
                </Box>
            )}

            {!loading && data && (
                <>
                    <ReportSummaryCard stats={stats} />

                    {data.by_billing_cycle && (
                        <Box bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} p={6} mt={6}>
                            <Heading size="md" mb={4}>{t('By Billing Cycle')}</Heading>
                            <HStack spacing={4} wrap="wrap">
                                {data.by_billing_cycle.map((item) => (
                                    <Box key={item.billing_cycle} bg={colors.bgMain} borderRadius="lg" px={4} py={2} textAlign="center">
                                        <Text fontWeight="500">{t(item.billing_cycle)}</Text>
                                        <Text fontSize="2xl" color="brand.500">{item.count}</Text>
                                    </Box>
                                ))}
                            </HStack>
                        </Box>
                    )}

                    <Box bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mt={6} overflow="hidden">
                        <Box px={{ base: 4, md: 6 }} py={4} borderBottom="1px solid" borderColor={colors.borderDefault}>
                            <Text fontSize="md" fontWeight="600">{t('Plan Details')}</Text>
                        </Box>
                        {rows.length === 0 ? (
                            <Box p={10} textAlign="center">
                                <Text fontSize="sm" color={colors.textSecondary}>{t('No plans found')}</Text>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table variant="striped" size="sm">
                                    <Thead>
                                        <Tr>
                                            {columns.map((col, i) => (
                                                <Th key={i} fontSize="xs" textTransform="uppercase" whiteSpace="nowrap">{col.header}</Th>
                                            ))}
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {rows.map((row, i) => (
                                            <Tr key={i}>
                                                {columns.map((col, j) => (
                                                    <Td key={j} fontSize="sm">
                                                        {col.accessorKey === 'status' && (
                                                            <Badge colorScheme={row[col.accessorKey] === 'active' ? 'green' : 'gray'} variant="subtle">
                                                                {row[col.accessorKey]}
                                                            </Badge>
                                                        )}
                                                        {col.accessorKey === 'is_active' && (
                                                            <Badge colorScheme={row[col.accessorKey] ? 'blue' : 'gray'} variant="subtle" fontSize="xs">
                                                                {row[col.accessorKey] ? t('Enabled') : t('Disabled')}
                                                            </Badge>
                                                        )}
                                                        {col.accessorKey !== 'status' && col.accessorKey !== 'is_active' && row[col.accessorKey]}
                                                    </Td>
                                                ))}
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
