import React, { useState } from 'react';
import { Box, Heading, Text, Flex, Select, HStack } from '@chakra-ui/react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import useThemeColors from '../../hooks/useThemeColors';
import { useCurrencyFormatter } from '../../useCurrencyFormatter';
import EmptyState from '../ui/EmptyState';

const COLORS = ['#14B8A6', '#0F766E', '#2DD4BF'];

const CustomTooltip = ({ active, payload }) => {
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
            <Text fontSize="sm" fontWeight="600">{payload[0]?.name}</Text>
            <Text fontSize="xs" color={colors.textSecondary}>{formatAmount(payload[0]?.value)}</Text>
        </Box>
    );
};

const CustomLegend = ({ payload }) => {
    const colors = useThemeColors();
    return (
        <Flex wrap="wrap" justify="center" gap={2} mt={2}>
            {payload.map((entry, index) => (
                <HStack key={index} spacing={1.5}>
                    <Box w={2.5} h={2.5} borderRadius="full" bg={entry.color} />
                    <Text fontSize="xs" color={colors.textSecondary}>{entry.value}</Text>
                </HStack>
            ))}
        </Flex>
    );
};

export default function CashMovementsOverview({ data = {} }) {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const [period, setPeriod] = useState('all');

    const chartData = [
        { name: t('In'), value: Number(data.in) || 0 },
        { name: t('Out'), value: Number(data.out) || 0 },
        { name: t('Adjust'), value: Number(data.adjust) || 0 },
    ].filter(item => item.value > 0);

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
                    {t('Cash Movements Overview')}
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
            <Box h={{ base: '250px', md: '280px' }}>
                {!chartData || chartData.length === 0 ? (
                    <EmptyState compact title={t('No cash movement data available')} />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={{ base: 50, md: 65 }}
                                outerRadius={{ base: 80, md: 100 }}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend content={<CustomLegend />} />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </Box>
        </Box>
    );
}
