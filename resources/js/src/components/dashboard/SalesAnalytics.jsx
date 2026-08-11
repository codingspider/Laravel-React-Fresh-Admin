import React from 'react';
import { Box, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import useThemeColors from '../../hooks/useThemeColors';
import { useCurrencyFormatter } from '../../useCurrencyFormatter';
import EmptyState from '../ui/EmptyState';

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
            <Text fontSize="xs" color="orange.500">
                {formatAmount(payload[0]?.value || 0)}
            </Text>
        </Box>
    );
};

export default function SalesAnalytics({ data = [] }) {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const gridColor = useColorModeValue('#f0f0f0', '#2D3748');

    return (
        <Box
            bg={colors.bgCard}
            p={{ base: 4, md: 6 }}
            borderRadius="xl"
            border="1px solid"
            borderColor={colors.borderDefault}
        >
            <Box mb={6}>
                <Heading size="md" fontWeight="bold" color={colors.textHeading}>
                    {t('Sales Analytics')}
                </Heading>
                <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                    {t('Daily breakdown for the selected period')}
                </Text>
            </Box>
            <Box h={{ base: '250px', md: '300px' }}>
                {!data || data.length === 0 ? (
                    <EmptyState compact title={t('No sales data available')} />
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.map(d => ({ ...d, total: Number(d.total) || 0 }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis
                                dataKey="day"
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
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke="#0d9488"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: '#0d9488', stroke: 'white', strokeWidth: 2 }}
                                activeDot={{ r: 6, fill: '#0d9488', stroke: 'white', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </Box>
        </Box>
    );
}
