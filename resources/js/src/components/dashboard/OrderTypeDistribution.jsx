import React from 'react';
import { Box, Heading, Text, Flex, HStack, VStack } from '@chakra-ui/react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import useThemeColors from '../../hooks/useThemeColors';
import EmptyState from '../ui/EmptyState';

const COLORS = ['#0d9488', '#14B8A6', '#2DD4BF', '#5EEAD4', '#0F766E', '#115E59', '#134E4A'];

const CustomTooltip = ({ active, payload }) => {
    const colors = useThemeColors();
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
            <Text fontSize="xs" color={colors.textSecondary}>{payload[0]?.value}</Text>
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

export default function OrderTypeDistribution({ data = [] }) {
    const { t } = useTranslation();
    const colors = useThemeColors();

    const chartData = data.map(item => ({
        name: item.type || t('Unknown'),
        value: Number(item.count) || 0,
    }));

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
                    {t('Order Type Distribution')}
                </Heading>
            </Box>
            <Box h={{ base: '250px', md: '280px' }}>
                {!chartData || chartData.length === 0 ? (
                    <EmptyState compact title={t('No order data available')} />
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
