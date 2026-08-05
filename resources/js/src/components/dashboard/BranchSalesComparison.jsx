import React, { useState } from 'react';
import { Box, Heading, Text, Select, Flex, useColorModeValue } from '@chakra-ui/react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import useThemeColors from '../../hooks/useThemeColors';
import { useCurrencyFormatter } from '../../useCurrencyFormatter';

const CustomTooltip = ({ active, payload, label }) => {
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();
    if (!active || !payload?.length) return null;
    return (
        <Box
            bg={colors.bgCard}
            p={3}
            borderRadius="lg"
            boxShadow="lg"
            border="1px solid"
            borderColor={colors.borderDefault}
        >
            <Text fontSize="sm" fontWeight="600" mb={1}>{label}</Text>
            <Text fontSize="xs" color="blue.500">
                {formatAmount(payload[0]?.value || 0)}
            </Text>
        </Box>
    );
};

export default function BranchSalesComparison({ data = [] }) {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const [period, setPeriod] = useState('all');
    const gridColor = useColorModeValue('#f0f0f0', '#2D3748');

    const chartData = data.map(item => ({
        name: item.branch_name,
        sales: item.total_sales,
    }));

    return (
        <Box
            bg={colors.bgCard}
            p={{ base: 4, md: 6 }}
            borderRadius="xl"
            border="1px solid"
            borderColor={colors.borderDefault}
        >
            <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
                <Heading size="md" fontWeight="bold" color={colors.textHeading}>
                    {t('Branch Wise Sales Comparison')}
                </Heading>
                <Select
                    size="sm"
                    maxW="140px"
                    borderRadius="lg"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    focusBorderColor="brand.500"
                >
                    <option value="all">{t('All The Time')}</option>
                    <option value="today">{t('Today')}</option>
                    <option value="week">{t('This Week')}</option>
                    <option value="month">{t('This Month')}</option>
                </Select>
            </Flex>
            <Box h={{ base: '250px', md: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={{ base: 24, md: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            fontSize={12}
                            tick={{ fill: '#9ca3af' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            fontSize={12}
                            tick={{ fill: '#9ca3af' }}
                        />
                        <RechartsTooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: useColorModeValue('#f5f5f5', '#2a2a2a') }}
                        />
                        <Bar dataKey="sales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
}
