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
import { REPORT_RESTAURANTS } from '../../../routes/apiRoutes';

export default function RestaurantReport() {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const toast = useToast();

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

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

    const fetchRestaurants = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(REPORT_RESTAURANTS, {
                params: statusFilter ? { status: statusFilter } : {},
            });
            setData(res.data?.data || null);
        } catch {
            toast({ title: t('error_fetching_data'), status: 'error', duration: 3000, isClosable: true });
        } finally {
            setLoading(false);
        }
    }, [t, toast, statusFilter]);

    useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants]);

    const summary = data?.summary || {};
    const stats = [
        { label: t('Total Restaurants'), value: summary.total_restaurants ?? 0 },
        { label: t('Active'), value: summary.active_restaurants ?? 0, color: 'green.500' },
        { label: t('Inactive'), value: summary.inactive_restaurants ?? 0, color: 'gray.500' },
        { label: t('Suspended'), value: summary.suspended_restaurants ?? 0, color: 'red.500' },
        { label: t('Trial Active'), value: summary.trial_active ?? 0, color: 'blue.500' },
        { label: t('Trial Expired'), value: summary.trial_expired ?? 0, color: 'orange.500' },
        { label: t('With Subscriptions'), value: summary.with_active_subscription ?? 0, color: 'green.500' },
        { label: t('Without Subscriptions'), value: summary.without_active_subscription ?? 0, color: 'red.500' },
    ];

    const columns = [
        { header: t('Name'), accessorKey: 'name' },
        { header: t('Owner'), accessorKey: 'owner_name' },
        { header: t('Plan'), accessorKey: 'plan_name' },
        { header: t('Status'), accessorKey: 'status' },
        { header: t('Currency'), accessorKey: 'currency_display' },
        { header: t('Trial Active'), accessorKey: 'is_trial_active' },
        { header: t('Subscription'), accessorKey: 'subscription_status' },
        { header: t('Created'), accessorKey: 'created_at_human' },
    ];

    const rows = (data?.rows || []).map((r) => ({
        ...r,
        owner_name: r.owner_name || r.owner_email || '-',
        currency_display: `${r.currency_symbol || '$'}${r.currency || ''}`,
        is_trial_active: r.is_trial_active ? <Badge colorScheme="blue" variant="subtle">{t('Yes')}</Badge> : <Badge variant="subtle">{t('No')}</Badge>,
        subscription_status: r.has_active_subscription
            ? <Badge colorScheme="green" variant="subtle">{t('Active')}</Badge>
            : <Badge colorScheme="red" variant="subtle">{t('None')}</Badge>,
    }));

    return (
        <Box minH="calc(100vh - 64px)" bg={colors.bgMain} p={6}>
            <PageHeader
                title={t('Restaurant Report')}
                subtitle={t('All restaurants across the platform')}
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
                            <option value="suspended">{t('Suspended')}</option>
                        </Select>
                    </GridItem>
                    <GridItem alignSelf="flex-end">
                        <Button colorScheme="teal" bg="teal.500" color="white" fontWeight="semibold" px={6} h={10} onClick={fetchRestaurants} isLoading={loading}>
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
                                        <Badge colorScheme={item.status === 'active' ? 'green' : item.status === 'suspended' ? 'red' : 'gray'} variant="subtle" mb={1}>
                                            {item.status}
                                        </Badge>
                                        <Text fontWeight="600" mt={1}>{item.count}</Text>
                                    </Box>
                                ))}
                            </HStack>
                        </Box>
                    )}

                    {data.registration_trend && (
                        <Box bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} p={6} mt={6}>
                            <Heading size="md" mb={4}>{t('Registration Trend (Monthly)')}</Heading>
                            <SimpleGrid columns={{ base: 2, md: 6 }} spacing={3}>
                                {data.registration_trend.map((item) => (
                                    <Box key={item.month} bg={colors.bgMain} borderRadius="lg" p={3} textAlign="center">
                                        <Text fontSize="xs" color={colors.textSecondary}>{item.month}</Text>
                                        <Text fontWeight="600" color="brand.500">{item.count}</Text>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </Box>
                    )}

                    <Box bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mt={6} overflow="hidden">
                        <Box px={{ base: 4, md: 6 }} py={4} borderBottom="1px solid" borderColor={colors.borderDefault}>
                            <Text fontSize="md" fontWeight="600">{t('Restaurant Details')}</Text>
                        </Box>
                        {rows.length === 0 ? (
                            <Box p={10} textAlign="center">
                                <Text fontSize="sm" color={colors.textSecondary}>{t('No restaurants found')}</Text>
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
                                                            <Badge colorScheme={row[col.accessorKey] === 'active' ? 'green' : row[col.accessorKey] === 'suspended' ? 'red' : 'gray'} variant="subtle">
                                                                {row[col.accessorKey]}
                                                            </Badge>
                                                        )}
                                                        {col.accessorKey !== 'status' && (typeof row[col.accessorKey] === 'string' || typeof row[col.accessorKey] === 'number' ? row[col.accessorKey] : row[col.accessorKey])}
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
