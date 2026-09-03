import React, { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    Grid,
    Text,
    Heading,
    Icon,
    Avatar,
    Badge,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    HStack,
    VStack,
    Divider,
    Select,
    Card,
    CardBody,
    IconButton,
    Tooltip,
    useColorModeValue,
} from '@chakra-ui/react';
import {
    TrendingUp,
    Users,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Eye,
    Download,
    Calendar,
    DollarSign,
    Package,
    UserPlus,
    CreditCard,
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import PageHeader from '../ui/PageHeader';
import StatCard from '../ui/StatCard';
import useThemeColors from '../../hooks/useThemeColors';

const statsData = (t) => [
    { title: t('total_revenue'), value: '$45,231.89', change: '+20.1%', trend: 'up', icon: DollarSign, iconColor: 'green.600', iconBg: 'green.50' },
    { title: t('total_orders'), value: '+2,350', change: '+15.5%', trend: 'up', icon: ShoppingCart, iconColor: 'blue.600', iconBg: 'blue.50' },
    { title: t('total_products'), value: '+12,234', change: '-4.5%', trend: 'down', icon: Package, iconColor: 'purple.600', iconBg: 'purple.50' },
    { title: t('active_users'), value: '573', change: '+2.1%', trend: 'up', icon: Users, iconColor: 'orange.600', iconBg: 'orange.50' },
];

const lineChartData = [
    { name: 'Jan', revenue: 4000, profit: 2400 },
    { name: 'Feb', revenue: 3000, profit: 1398 },
    { name: 'Mar', revenue: 5000, profit: 3800 },
    { name: 'Apr', revenue: 4500, profit: 3908 },
    { name: 'May', revenue: 6000, profit: 4800 },
    { name: 'Jun', revenue: 5500, profit: 3800 },
];

const barChartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 5000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
];

const pieChartData = (t) => [
    { name: t('dine_in'), value: 400 },
    { name: t('takeaway'), value: 300 },
    { name: t('delivery'), value: 200 },
];
const COLORS = ['#0D9488', '#14B8A6', '#5EEAD4'];

const tableData = [
    { id: '#3210', customer: 'Olivia Martin', email: 'olivia@email.com', status: 'Completed', date: '2023-10-01', amount: '$1,999.00' },
    { id: '#3211', customer: 'Jackson Lee', email: 'jackson@email.com', status: 'Pending', date: '2023-10-02', amount: '$39.00' },
    { id: '#3212', customer: 'Isabella Nguyen', email: 'isabella@email.com', status: 'Completed', date: '2023-10-03', amount: '$299.00' },
    { id: '#3213', customer: 'William Kim', email: 'will@email.com', status: 'Failed', date: '2023-10-04', amount: '$99.00' },
    { id: '#3214', customer: 'Sofia Davis', email: 'sofia@email.com', status: 'Completed', date: '2023-10-05', amount: '$39.00' },
];

const recentActivity = [
    { icon: UserPlus, text: 'New user registered', time: '2 mins ago', color: 'blue.500' },
    { icon: CreditCard, text: 'Payment received from John', time: '1 hour ago', color: 'green.500' },
    { icon: Package, text: 'Order #1234 shipped successfully', time: '3 hours ago', color: 'purple.500' },
    { icon: Users, text: 'Team member updated project', time: 'Yesterday', color: 'orange.500' },
];

const CustomTooltip = ({ active, payload, label }) => {
    const tooltipColors = useThemeColors();
    const bg = tooltipColors.bgCard;
    if (!active || !payload?.length) return null;
    return (
        <Box
            bg={bg}
            p={3}
            borderRadius="lg"
            boxShadow="lg"
            border="1px solid"
            borderColor={tooltipColors.borderDefault}
        >
            <Text fontSize="sm" fontWeight="600" mb={1}>{label}</Text>
            {payload.map((entry, i) => (
                <Text key={i} fontSize="xs" color={entry.color}>
                    {entry.name}: ${entry.value.toLocaleString()}
                </Text>
            ))}
        </Box>
    );
};

export default function Dashboard() {
    const [filterStatus, setFilterStatus] = useState('All');
    const { t } = useTranslation();
    const colors = useThemeColors();

    const bg = colors.bgCard;
    const borderColor = colors.borderDefault;
    const hoverBg = colors.bgHover;

    useEffect(() => {
        const app_name = localStorage.getItem('app_name');
        document.title = `${app_name} | Dashboard`;
    }, []);

    const filteredTableData = tableData.filter(
        (row) => filterStatus === 'All' || row.status === filterStatus
    );

    const statusColorScheme = (status) => {
        switch (status) {
            case 'Completed': return 'green';
            case 'Pending': return 'yellow';
            case 'Failed': return 'red';
            default: return 'gray';
        }
    };

    return (
        <Box>
            <PageHeader
                title={t('dashboard')}
                subtitle={t('welcome_back_here') + " " + t('overview_of_restaurant')}
                breadcrumbs={[
                    { label: t('home'), path: '/dashboard' },
                    { label: t('dashboard'), isCurrent: true },
                ]}
            />

            {/* Stats Grid */}
            <Grid
                templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }}
                gap={{ base: 4, md: 6 }}
                mb={{ base: 6, md: 8 }}
            >
                {statsData(t).map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </Grid>

            {/* Charts Row 1 */}
            <Grid
                templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
                gap={{ base: 4, md: 6 }}
                mb={{ base: 6, md: 8 }}
            >
                <Box
                    bg={bg}
                    p={{ base: 4, md: 6 }}
                    borderRadius="xl"
                    boxShadow="card"
                    border="1px solid"
                    borderColor={borderColor}
                >
                    <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
                        <Box>
                            <Heading size="md" fontWeight="bold" color={colors.textHeading}>
                                {t('revenue_overview')}
                            </Heading>
                            <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                                {t('monthly_revenue_and_profit')}
                            </Text>
                        </Box>
                        <HStack spacing={2}>
                            <Box display={{ base: 'none', md: 'flex' }} align="center" gap={1.5}>
                                <Box w={2.5} h={2.5} borderRadius="full" bg="brand.500" />
                                <Text fontSize="xs" color={colors.textSecondary}>{t('revenue')}</Text>
                            </Box>
                            <Box display={{ base: 'none', md: 'flex' }} align="center" gap={1.5}>
                                <Box w={2.5} h={2.5} borderRadius="full" bg="purple.500" />
                                <Text fontSize="xs" color={colors.textSecondary}>{t('profit')}</Text>
                            </Box>
                        </HStack>
                    </Flex>
                    <Box h={{ base: '250px', md: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={lineChartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={useColorModeValue('#f0f0f0', '#2D3748')} vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#9ca3af' }} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#9ca3af' }} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2.5} fill="url(#colorRevenue)" dot={false} activeDot={{ r: 6, fill: '#0d9488', stroke: 'white', strokeWidth: 2 }} />
                                <Area type="monotone" dataKey="profit" stroke="#14B8A6" strokeWidth={2.5} fill="url(#colorProfit)" dot={false} activeDot={{ r: 6, fill: '#14B8A6', stroke: 'white', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </Box>

                <Box
                    bg={bg}
                    p={{ base: 4, md: 6 }}
                    borderRadius="xl"
                    boxShadow="card"
                    border="1px solid"
                    borderColor={borderColor}
                >
                    <Heading size="md" fontWeight="bold" mb={1} color={colors.textHeading}>
                        {t('order_types')}
                    </Heading>
                    <Text fontSize="sm" color={colors.textSecondary} mb={6}>
                        {t('distribution_by_order_type')}
                    </Text>
                    <Box h={{ base: '180px', md: '200px' }} mb={6}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieChartData(t)}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={{ base: 50, md: 60 }}
                                    outerRadius={{ base: 70, md: 80 }}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieChartData(t).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                    <VStack spacing={3} align="stretch">
                        {pieChartData(t).map((entry, index) => (
                            <Flex key={entry.name} justify="space-between" align="center">
                                <HStack spacing={2.5}>
                                    <Box w={3} h={3} borderRadius="full" bg={COLORS[index]} />
                                    <Text fontSize="sm" fontWeight="500">{entry.name}</Text>
                                </HStack>
                                <Text fontSize="sm" fontWeight="bold" color={colors.textLabel}>
                                    {entry.value}
                                </Text>
                            </Flex>
                        ))}
                    </VStack>
                </Box>
            </Grid>

            {/* Charts Row 2 + Activity */}
            <Grid
                templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
                gap={{ base: 4, md: 6 }}
                mb={{ base: 6, md: 8 }}
            >
                <Box
                    bg={bg}
                    p={{ base: 4, md: 6 }}
                    borderRadius="xl"
                    boxShadow="card"
                    border="1px solid"
                    borderColor={borderColor}
                >
                    <Flex justify="space-between" align="center" mb={6}>
                        <Box>
                            <Heading size="md" fontWeight="bold" color={colors.textHeading}>
                                {t('sales_this_week')}
                            </Heading>
                            <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                                {t('daily_breakdown')}
                            </Text>
                        </Box>
                        <IconButton
                            variant="ghost"
                            p={2}
                            borderRadius="lg"
                            icon={<Icon as={MoreHorizontal} boxSize={5} />}
                            aria-label="More options"
                        />
                    </Flex>
                    <Box h={{ base: '220px', md: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barChartData} barSize={{ base: 24, md: 32 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={useColorModeValue('#f0f0f0', '#2D3748')} vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#9ca3af' }} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#9ca3af' }} />
                                <RechartsTooltip
                                    content={<CustomTooltip />}
                                    cursor={{ fill: useColorModeValue('#f5f5f5', '#2a2a2a') }}
                                />
                                <Bar dataKey="sales" fill="#0d9488" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Box>

                <Box
                    bg={bg}
                    p={{ base: 4, md: 6 }}
                    borderRadius="xl"
                    boxShadow="card"
                    border="1px solid"
                    borderColor={borderColor}
                >
                    <Flex justify="space-between" align="center" mb={6}>
                        <Heading size="md" fontWeight="bold" color={colors.textHeading}>
                            {t('recent_activity')}
                        </Heading>
                        <Button variant="secondary" size="sm">
                            {t('view_all')}
                        </Button>
                    </Flex>
                    <VStack spacing={0} align="stretch" divider={<Divider borderColor={borderColor} />}>
                        {recentActivity.map((item, index) => (
                            <Flex
                                key={index}
                                gap={3}
                                p={3}
                                borderRadius="lg"
                                _hover={{ bg: hoverBg }}
                                transition="background 0.15s ease"
                            >
                                <Flex
                                    bg={useColorModeValue(`${item.color}.50`, `${item.color}.200`)}
                                    p={2}
                                    borderRadius="lg"
                                    flexShrink={0}
                                >
                                    <Icon as={item.icon} boxSize={4} color={item.color} />
                                </Flex>
                                <Box flex="1" minW={0}>
                                    <Text fontSize="sm" fontWeight="500" noOfLines={1}>
                                        {item.text}
                                    </Text>
                                    <Text fontSize="xs" color={colors.textSecondary} mt={0.5}>
                                        {item.time}
                                    </Text>
                                </Box>
                            </Flex>
                        ))}
                    </VStack>
                </Box>
            </Grid>

            {/* Data Table */}
            <Box
                bg={bg}
                p={{ base: 4, md: 6 }}
                borderRadius="xl"
                boxShadow="card"
                border="1px solid"
                borderColor={borderColor}
            >
                <Flex
                    justify="space-between"
                    align="center"
                    mb={6}
                    wrap="wrap"
                    gap={3}
                >
                    <Box>
                        <Heading size="md" fontWeight="bold" color={colors.textHeading}>
                            {t('recent_orders')}
                        </Heading>
                        <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                            {t('latest_transactions')}
                        </Text>
                    </Box>
                    <HStack spacing={2}>
                        <Select
                            maxW={{ base: '100px', md: '140px' }}
                            size="sm"
                            borderRadius="lg"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            focusBorderColor="brand.500"
                        >
                            <option>{t('all')}</option>
                            <option>{t('completed')}</option>
                            <option>{t('pending')}</option>
                            <option>{t('failed')}</option>
                        </Select>
                        <Tooltip label={t('export')} hasArrow>
                            <IconButton
                                size="sm"
                                variant="ghost"
                                icon={<Icon as={Download} boxSize={4} />}
                                aria-label="Export"
                                borderRadius="lg"
                                display={{ base: 'none', md: 'flex' }}
                            />
                        </Tooltip>
                    </HStack>
                </Flex>

                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                {                                [t('order'), t('customer'), t('status'), t('date'), t('amount')].map((key) => (
                                    <Th
                                        key={key}
                                        fontSize="xs"
                                        fontWeight="600"
                                        color={colors.textSecondary}
                                        borderColor={borderColor}
                                        py={3}
                                    >
                                        {key}
                                    </Th>
                                ))}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredTableData.map((row) => (
                                <Tr
                                    key={row.id}
                                    _hover={{ bg: hoverBg }}
                                    transition="background 0.15s ease"
                                    cursor="pointer"
                                    borderColor={borderColor}
                                >
                                    <Td fontWeight="600" fontSize="sm" borderColor={borderColor} py={3}>
                                        {row.id}
                                    </Td>
                                    <Td borderColor={borderColor} py={3}>
                                        <HStack spacing={2}>
                                            <Avatar size="xs" name={row.customer} bg="brand.500" color="white" />
                                            <Box minW={0}>
                                                <Text fontSize="sm" fontWeight="500" noOfLines={1}>
                                                    {row.customer}
                                                </Text>
                                                <Text fontSize="xs" color={colors.textSecondary} noOfLines={1}>
                                                    {row.email}
                                                </Text>
                                            </Box>
                                        </HStack>
                                    </Td>
                                    <Td borderColor={borderColor} py={3}>
                                        <Badge
                                            colorScheme={statusColorScheme(row.status)}
                                            borderRadius="full"
                                            px={2.5}
                                            py={0.5}
                                            fontSize="xs"
                                            fontWeight="600"
                                        >
                                            {row.status}
                                        </Badge>
                                    </Td>
                                    <Td fontSize="sm" color={colors.textSecondary} borderColor={borderColor} py={3}>
                                        {row.date}
                                    </Td>
                                    <Td fontWeight="600" fontSize="sm" borderColor={borderColor} py={3}>
                                        {row.amount}
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>

                <Flex
                    justify="space-between"
                    align="center"
                    mt={4}
                    pt={4}
                    borderTop="1px solid"
                    borderColor={borderColor}
                    direction={{ base: 'column', md: 'row' }}
                    gap={3}
                >
                    <Text fontSize="sm" color={colors.textSecondary}>
                        {t('showing_1_to_5_of_124_results')}
                    </Text>
                    <HStack spacing={1}>
                        <Button variant="ghost" size="sm" isDisabled>
                            <Icon as={ChevronLeft} boxSize={4} />
                        </Button>
                        <Button variant="primary" size="sm" minW="32px">
                            1
                        </Button>
                        <Button variant="ghost" size="sm" minW="32px">
                            2
                        </Button>
                        <Button variant="ghost" size="sm" minW="32px">
                            3
                        </Button>
                        <Button variant="ghost" size="sm">
                            <Icon as={ChevronRight} boxSize={4} />
                        </Button>
                    </HStack>
                </Flex>
            </Box>
        </Box>
    );
}
