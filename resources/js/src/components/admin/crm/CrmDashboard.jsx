import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Text,
    Heading,
    Flex,
    Badge,
    VStack,
    HStack,
    Avatar,
    Button,
    Spinner,
    Icon,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Users, UserPlus, UserCheck, CalendarClock, Wallet, Cake, Heart, Tags } from 'lucide-react';
import api from '../../../axios';
import { CRM_DASHBOARD } from '../../../routes/apiRoutes';
import { DASHBOARD_PATH, CRM_CUSTOMER_LIST_PATH, CRM_CUSTOMER_VIEW_PATH } from '../../../routes/superAdminRoutes';
import PageHeader from '../../ui/PageHeader';
import StatCard from '../../ui/StatCard';
import useThemeColors from '../../../hooks/useThemeColors';
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';
import { usePermission } from '../../../context/PermissionContext';

export default function CrmDashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const colors = useThemeColors();
    const { can } = usePermission();
    const { formatAmount } = useCurrencyFormatter();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(CRM_DASHBOARD);
            setData(res.data?.data || res.data || null);
        } catch (err) {
            console.error('CrmDashboard fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const app_name = localStorage.getItem('app_name');
        document.title = `${app_name} | CRM Dashboard`;
        fetchData();
    }, [fetchData]);

    const statCards = [
        {
            title: t('Total Customers'),
            value: data?.total_customers ?? '---',
            change: '',
            trend: 'up',
            icon: Users,
            iconColor: 'brand.600',
            iconBg: 'brand.50',
        },
        {
            title: t('New This Month'),
            value: data?.new_customers_this_month ?? '---',
            change: '',
            trend: 'up',
            icon: UserPlus,
            iconColor: 'green.600',
            iconBg: 'green.50',
        },
        {
            title: t('Active Customers'),
            value: data?.active_customers ?? '---',
            change: '',
            trend: 'up',
            icon: UserCheck,
            iconColor: 'blue.600',
            iconBg: 'blue.50',
        },
        {
            title: t('Total Spent'),
            value: data ? formatAmount(parseFloat(data.total_spent || 0)) : '---',
            change: '',
            trend: 'up',
            icon: Wallet,
            iconColor: 'purple.600',
            iconBg: 'purple.50',
        },
        {
            title: t('Pending Follow-ups'),
            value: data?.pending_follow_ups ?? '---',
            change: '',
            trend: 'up',
            icon: CalendarClock,
            iconColor: 'orange.600',
            iconBg: 'orange.50',
        },
    ];

    const upcoming = [
        {
            key: 'upcoming_birthdays',
            title: t('Upcoming Birthdays'),
            icon: Cake,
            iconColor: 'pink.600',
            iconBg: 'pink.50',
        },
        {
            key: 'upcoming_anniversaries',
            title: t('Upcoming Anniversaries'),
            icon: Heart,
            iconColor: 'red.600',
            iconBg: 'red.50',
        },
    ];

    return (
        <Box>
            <PageHeader
                title={t('CRM Dashboard')}
                subtitle={t('Customer relationships at a glance')}
                breadcrumbs={[
                    { label: t('Dashboard'), path: DASHBOARD_PATH },
                    { label: t('CRM Dashboard'), isCurrent: true },
                ]}
            />

            {isLoading ? (
                <Flex justify="center" py={20}>
                    <VStack spacing={3}>
                        <Spinner size="lg" color="brand.500" />
                        <Text fontSize="sm" color="gray.500">{t('Loading...')}</Text>
                    </VStack>
                </Flex>
            ) : (
                <>
                    <Grid
                        templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(5, 1fr)' }}
                        gap={{ base: 4, md: 5 }}
                        mb={{ base: 6, md: 8 }}
                    >
                        {statCards.map((stat, i) => (
                            <StatCard key={i} {...stat} />
                        ))}
                    </Grid>

                    <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={{ base: 4, md: 5 }} mb={{ base: 6, md: 8 }}>
                        {upcoming.map((section) => (
                            <Box key={section.key} bg={colors.bgCard} p={{ base: 4, md: 5 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                                <Flex align="center" gap={2.5} mb={4}>
                                    <Flex bg={section.iconBg} p={2} borderRadius="lg">
                                        <Icon as={section.icon} boxSize={4} color={section.iconColor} />
                                    </Flex>
                                    <Heading size="sm" fontWeight="bold" color={colors.textHeading}>{section.title}</Heading>
                                </Flex>
                                {(data?.[section.key] || []).length === 0 ? (
                                    <Text fontSize="sm" color="gray.500">{t('Nothing upcoming')}</Text>
                                ) : (
                                    <VStack spacing={2.5} align="stretch">
                                        {(data?.[section.key] || []).map((item) => (
                                            <Flex
                                                key={item.id}
                                                justify="space-between"
                                                align="center"
                                                p={2.5}
                                                bg={colors.bgSubtle}
                                                borderRadius="lg"
                                                cursor="pointer"
                                                _hover={{ bg: colors.bgHover }}
                                                onClick={() => can('view_customers') && navigate(CRM_CUSTOMER_VIEW_PATH(item.id))}
                                            >
                                                <HStack spacing={2.5}>
                                                    <Avatar size="sm" name={item.name} bg="brand.500" color="white" />
                                                    <Box>
                                                        <Text fontSize="sm" fontWeight="600">{item.name}</Text>
                                                        <Text fontSize="xs" color="gray.500">{item.phone || item.email || '-'}</Text>
                                                    </Box>
                                                </HStack>
                                                <Badge colorScheme="pink" variant="subtle" borderRadius="full" px={2.5} py={0.5}>
                                                    {item.event_date || item.date || ''}
                                                </Badge>
                                            </Flex>
                                        ))}
                                    </VStack>
                                )}
                            </Box>
                        ))}
                    </Grid>

                    <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={{ base: 4, md: 5 }}>
                        <Box bg={colors.bgCard} p={{ base: 4, md: 5 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                            <Flex align="center" gap={2.5} mb={4}>
                                <Flex bg="teal.50" p={2} borderRadius="lg">
                                    <Icon as={Tags} boxSize={4} color="teal.600" />
                                </Flex>
                                <Heading size="sm" fontWeight="bold" color={colors.textHeading}>{t('Segment Breakdown')}</Heading>
                            </Flex>
                            {(data?.segment_breakdown || []).length === 0 ? (
                                <Text fontSize="sm" color="gray.500">{t('No segments yet')}</Text>
                            ) : (
                                <VStack spacing={3} align="stretch">
                                    {(data?.segment_breakdown || []).map((segment) => (
                                        <Flex key={segment.id} justify="space-between" align="center" p={3} bg={colors.bgSubtle} borderRadius="lg">
                                            <HStack spacing={2.5}>
                                                <Box w={3} h={3} borderRadius="full" bg={segment.color || 'brand.500'} />
                                                <Text fontSize="sm" fontWeight="500">{segment.name}</Text>
                                            </HStack>
                                            <Badge colorScheme="brand" variant="subtle" borderRadius="full" px={2.5} py={0.5}>
                                                {segment.customers_count ?? 0}
                                            </Badge>
                                        </Flex>
                                    ))}
                                </VStack>
                            )}
                        </Box>

                        <Box bg={colors.bgCard} p={{ base: 4, md: 5 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                            <Flex justify="space-between" align="center" mb={4}>
                                <Box>
                                    <Heading size="sm" fontWeight="bold" color={colors.textHeading}>{t('Recent Customers')}</Heading>
                                    <Text fontSize="xs" color="gray.500" mt={0.5}>{t('Latest additions to your customer base')}</Text>
                                </Box>
                                {can('view_customers') && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        colorScheme="brand"
                                        onClick={() => navigate(CRM_CUSTOMER_LIST_PATH)}
                                    >
                                        {t('View All')}
                                    </Button>
                                )}
                            </Flex>
                            {(data?.recent_customers || []).length === 0 ? (
                                <Text fontSize="sm" color="gray.500">{t('No customers yet')}</Text>
                            ) : (
                                <VStack spacing={2.5} align="stretch">
                                    {(data?.recent_customers || []).map((customer) => (
                                        <Flex
                                            key={customer.id}
                                            justify="space-between"
                                            align="center"
                                            p={2.5}
                                            bg={colors.bgSubtle}
                                            borderRadius="lg"
                                            cursor="pointer"
                                            _hover={{ bg: colors.bgHover }}
                                            onClick={() => can('view_customers') && navigate(CRM_CUSTOMER_VIEW_PATH(customer.id))}
                                        >
                                            <HStack spacing={2.5} minW={0}>
                                                <Avatar size="sm" name={customer.name} bg="brand.500" color="white" />
                                                <Box minW={0}>
                                                    <Text fontSize="sm" fontWeight="600" noOfLines={1}>{customer.name}</Text>
                                                    <Text fontSize="xs" color="gray.500" noOfLines={1}>{customer.phone || customer.email || '-'}</Text>
                                                </Box>
                                            </HStack>
                                            <HStack spacing={2}>
                                                {customer.total_orders > 0 && (
                                                    <Text fontSize="xs" color="gray.500">{customer.total_orders} {t('orders')}</Text>
                                                )}
                                                <Text fontSize="sm" fontWeight="700" color={colors.textLabel}>
                                                    {formatAmount(parseFloat(customer.total_spent || 0))}
                                                </Text>
                                            </HStack>
                                        </Flex>
                                    ))}
                                </VStack>
                            )}
                        </Box>
                    </Grid>
                </>
            )}
        </Box>
    );
}
