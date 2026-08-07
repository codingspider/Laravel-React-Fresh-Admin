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
import useThemeColors from '../../../hooks/useThemeColors';
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';
import { REPORT_SUBSCRIPTIONS } from '../../../routes/apiRoutes';

export default function SubscriptionReport() {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const toast = useToast();
    const { formatAmount } = useCurrencyFormatter();

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');

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

    const fetchSubscriptions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(REPORT_SUBSCRIPTIONS, {
                params: {
                    ...(statusFilter ? { status: statusFilter } : {}),
                    ...(paymentFilter ? { payment_status: paymentFilter } : {}),
                },
            });
            setData(res.data?.data || null);
        } catch {
            toast({ title: t('error_fetching_data'), status: 'error', duration: 3000, isClosable: true });
        } finally {
            setLoading(false);
        }
    }, [t, toast, statusFilter, paymentFilter]);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    const summary = data?.summary || {};
    const stats = [
        { label: t('Total Subscriptions'), value: summary.total_subscriptions ?? 0 },
        { label: t('Active'), value: summary.active_subscriptions ?? 0, color: 'green.500' },
        { label: t('Trials'), value: summary.trial_subscriptions ?? 0, color: 'blue.500' },
        { label: t('Expired'), value: summary.expired_subscriptions ?? 0, color: 'orange.500' },
        { label: t('Cancelled'), value: summary.cancelled_subscriptions ?? 0, color: 'red.500' },
        { label: t('Total Revenue'), value: formatAmount(summary.total_revenue ?? 0), color: 'purple.500' },
        { label: t('Avg. Value'), value: formatAmount(summary.average_subscription_value ?? 0), color: 'teal.500' },
    ];

    const columns = [
        { header: t('Restaurant'), accessorKey: 'restaurant_name' },
        { header: t('Plan'), accessorKey: 'plan_name' },
        { header: t('Status'), accessorKey: 'status' },
        { header: t('Payment'), accessorKey: 'payment_status' },
        { header: t('Amount'), accessorKey: 'payment_amount' },
        { header: t('Trial'), accessorKey: 'is_trial' },
        { header: t('Starts At'), accessorKey: 'starts_at' },
        { header: t('Ends At'), accessorKey: 'ends_at' },
        { header: t('Created'), accessorKey: 'created_at' },
    ];

    const rows = (data?.rows || []).map((sub) => ({
        ...sub,
        payment_amount: formatAmount(sub.payment_amount || 0),
        starts_at: sub.starts_at ? new Date(sub.starts_at).toLocaleDateString() : '-',
        ends_at: sub.ends_at ? new Date(sub.ends_at).toLocaleDateString() : '-',
        created_at: sub.created_at ? new Date(sub.created_at).toLocaleDateString() : '-',
    }));

    return (
        <Box minH="calc(100vh - 64px)" bg={colors.bgMain} p={6}>
            <PageHeader
                title={t('Subscription Report')}
                subtitle={t('All subscriptions across the platform')}
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
                            <option value="expired">{t('Expired')}</option>
                            <option value="cancelled">{t('Cancelled')}</option>
                        </Select>
                    </GridItem>
                    <GridItem>
                        <Text fontSize="xs" fontWeight="500" color={colors.textSecondary} mb={1}>{t('Payment Status')}</Text>
                        <Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} placeholder={t('All Payment Statuses')} {...filterProps}>
                            <option value="">{t('All Payment Statuses')}</option>
                            <option value="paid">{t('Paid')}</option>
                            <option value="pending">{t('Pending')}</option>
                            <option value="failed">{t('Failed')}</option>
                            <option value="refunded">{t('Refunded')}</option>
                        </Select>
                    </GridItem>
                    <GridItem alignSelf="flex-end">
                        <Button colorScheme="teal" bg="teal.500" color="white" fontWeight="semibold" px={6} h={10} onClick={fetchSubscriptions} isLoading={loading}>
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

                    {data.by_status && (
                        <Box bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} p={6} mt={6}>
                            <Heading size="md" mb={4}>{t('By Status')}</Heading>
                            <HStack spacing={4} wrap="wrap">
                                {data.by_status.map((item) => (
                                    <Box key={item.status} bg={colors.bgMain} borderRadius="lg" px={4} py={2} textAlign="center">
                                        <Badge colorScheme={item.status === 'active' ? 'green' : item.status === 'cancelled' ? 'red' : item.status === 'expired' ? 'orange' : 'gray'} variant="subtle" mb={1}>
                                            {item.status}
                                        </Badge>
                                        <Text fontWeight="600" mt={1}>{item.count}</Text>
                                    </Box>
                                ))}
                            </HStack>
                        </Box>
                    )}

                    {data.by_payment_status && (
                        <Box bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} p={6} mt={6}>
                            <Heading size="md" mb={4}>{t('By Payment Status')}</Heading>
                            <HStack spacing={4} wrap="wrap">
                                {data.by_payment_status.map((item) => (
                                    <Box key={item.payment_status} bg={colors.bgMain} borderRadius="lg" px={4} py={2} textAlign="center">
                                        <Badge colorScheme={item.payment_status === 'paid' ? 'green' : 'gray'} variant="subtle" mb={1}>
                                            {item.payment_status}
                                        </Badge>
                                        <Text fontWeight="600" mt={1}>{item.count}</Text>
                                    </Box>
                                ))}
                            </HStack>
                        </Box>
                    )}

                    {data.revenue_by_plan && (
                        <Box bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} p={6} mt={6}>
                            <Heading size="md" mb={4}>{t('Revenue By Plan')}</Heading>
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                {data.revenue_by_plan.map((item, idx) => (
                                    <Box key={idx} bg={colors.bgMain} borderRadius="lg" p={4}>
                                        <Text fontWeight="600">{item.plan_name}</Text>
                                        <Text fontSize="2xl" color="green.400">{formatAmount(item.total)}</Text>
                                        <Text fontSize="xs" color={colors.textSecondary}>{item.count} {t('subscriptions')}</Text>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </Box>
                    )}

                    <Box bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mt={6} overflow="hidden">
                        <Box px={{ base: 4, md: 6 }} py={4} borderBottom="1px solid" borderColor={colors.borderDefault}>
                            <Text fontSize="md" fontWeight="600">{t('Subscription Details')}</Text>
                        </Box>
                        {rows.length === 0 ? (
                            <Box p={10} textAlign="center">
                                <Text fontSize="sm" color={colors.textSecondary}>{t('No subscriptions found')}</Text>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table variant="striped" size="sm">
                                    <Thead>
                                        <Tr>
                                            {columns.map((col, i) => (
                                                <Th key={i} fontSize="xs" textTransform="uppercase">{col.header}</Th>
                                            ))}
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {rows.map((row, i) => (
                                            <Tr key={i}>
                                                {columns.map((col, j) => (
                                                    <Td key={j} fontSize="sm">
                                                        {col.accessorKey === 'status' && (
                                                            <Badge colorScheme={row[col.accessorKey] === 'active' ? 'green' : row[col.accessorKey] === 'cancelled' ? 'red' : row[col.accessorKey] === 'expired' ? 'orange' : 'gray'} variant="subtle">
                                                                {row[col.accessorKey]}
                                                            </Badge>
                                                        )}
                                                        {col.accessorKey === 'is_trial' && (
                                                            row[col.accessorKey] ? <Badge colorScheme="blue" variant="subtle">{t('Yes')}</Badge> : '-'
                                                        )}
                                                        {col.accessorKey !== 'status' && col.accessorKey !== 'is_trial' && row[col.accessorKey]}
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
