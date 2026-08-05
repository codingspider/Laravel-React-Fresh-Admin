import React, { useState } from 'react';
import { Box, Heading, Text, Select, Flex, useColorModeValue } from '@chakra-ui/react';
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
    const [period, setPeriod] = useState('weekly');
    const gridColor = useColorModeValue('#f0f0f0', '#2D3748');

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
                    {t('Sales Analytics')}
                </Heading>
                <Select
                    size="sm"
                    maxW="120px"
                    borderRadius="lg"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    focusBorderColor="brand.500"
                >
                    <option value="daily">{t('Daily')}</option>
                    <option value="weekly">{t('Weekly')}</option>
                    <option value="monthly">{t('Monthly')}</option>
                </Select>
            </Flex>
            <Box h={{ base: '250px', md: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
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
                            stroke="#f97316"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: '#f97316', stroke: 'white', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#f97316', stroke: 'white', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
}
