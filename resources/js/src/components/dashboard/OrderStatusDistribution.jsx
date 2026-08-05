import React, { useState } from 'react';
import { Box, Heading, Text, Flex, Select, HStack, VStack } from '@chakra-ui/react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import useThemeColors from '../../hooks/useThemeColors';

const COLORS = ['#06b6d4', '#0d9488', '#f97316', '#22c55e', '#ef4444', '#6b7280', '#8b5cf6', '#3b82f6'];

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

export default function OrderStatusDistribution({ data = [] }) {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const [period, setPeriod] = useState('all');

    const chartData = data.map(item => ({
        name: t(item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || 'Unknown'),
        value: item.count,
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
                    {t('Order Total By Status')}
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
            </Box>
        </Box>
    );
}
