import React from 'react';
import { Box, Heading, Text, Flex, HStack } from '@chakra-ui/react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import useThemeColors from '../../hooks/useThemeColors';
import { useCurrencyFormatter } from '../../useCurrencyFormatter';

const COLORS = ['#6b7280', '#22c55e', '#06b6d4', '#3b82f6'];

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

export default function PaymentsOverview({ data = {} }) {
    const { t } = useTranslation();
    const colors = useThemeColors();

    const methodLabels = {
        cash: t('Cash'),
        card: t('Card'),
        mobile_wallet: t('Mobile Wallet'),
        bkash: t('Mobile Wallet'),
        nagad: t('Mobile Wallet'),
        rocket: t('Mobile Wallet'),
        bank_transfer: t('Bank Transfer'),
        online: t('Online'),
    };

    const methodColors = {
        cash: '#6b7280',
        card: '#22c55e',
        mobile_wallet: '#06b6d4',
        bkash: '#06b6d4',
        nagad: '#06b6d4',
        rocket: '#06b6d4',
        bank_transfer: '#3b82f6',
        online: '#8b5cf6',
    };

    const aggregated = {};
    Object.entries(data).forEach(([method, total]) => {
        const label = methodLabels[method] || method;
        aggregated[label] = (aggregated[label] || 0) + Number(total);
    });

    const chartData = Object.entries(aggregated).map(([name, value]) => ({
        name,
        value,
    }));

    const chartColors = chartData.map((_, index) => COLORS[index % COLORS.length]);

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
                    {t('Payments Overview')}
                </Heading>
            </Flex>
            {chartData.length === 0 ? (
                <Flex justify="center" align="center" h={{ base: '250px', md: '280px' }}>
                    <Text color={colors.textSecondary}>{t('No payment data available')}</Text>
                </Flex>
            ) : (
                <Box h={{ base: '250px', md: '280px' }}>
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
                                    <Cell key={`cell-${index}`} fill={chartColors[index]} />
                                ))}
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend content={<CustomLegend />} />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            )}
        </Box>
    );
}
