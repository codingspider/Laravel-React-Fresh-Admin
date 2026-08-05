import React from 'react';
import { Box, Heading, Text, Flex, HStack, VStack, Badge } from '@chakra-ui/react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useThemeColors from '../../hooks/useThemeColors';

export default function LowStockAlerts({ data = [] }) {
    const { t } = useTranslation();
    const colors = useThemeColors();

    const getInitial = (name) => name?.charAt(0)?.toUpperCase() || '?';
    const getStockColor = (current, reorder) => {
        if (current <= 0) return 'red';
        if (current <= reorder) return 'orange';
        return 'green';
    };

    return (
        <Box
            bg={colors.bgCard}
            p={{ base: 4, md: 6 }}
            borderRadius="xl"
            border="1px solid"
            borderColor={colors.borderDefault}
        >
            <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
                <HStack spacing={2}>
                    <Box
                        bg="red.50"
                        p={2}
                        borderRadius="lg"
                    >
                        <AlertTriangle size={18} color="#ef4444" />
                    </Box>
                    <Heading size="md" fontWeight="bold" color={colors.textHeading}>
                        {t('Low Stock Alerts')}
                    </Heading>
                </HStack>
            </Flex>
            <VStack spacing={0} align="stretch">
                {data.map((item, index) => (
                    <Flex
                        key={item.id || index}
                        align="center"
                        p={3}
                        borderRadius="lg"
                        _hover={{ bg: colors.bgHover }}
                        transition="background 0.15s ease"
                        gap={3}
                    >
                        <Flex
                            bg={`${getStockColor(item.current_stock, item.reorder_level)}.50`}
                            p={2}
                            borderRadius="lg"
                            flexShrink={0}
                            align="center"
                            justify="center"
                            minW="36px"
                            minH="36px"
                        >
                            <Text
                                fontSize="sm"
                                fontWeight="700"
                                color={`${getStockColor(item.current_stock, item.reorder_level)}.600`}
                            >
                                {getInitial(item.name)}
                            </Text>
                        </Flex>
                        <Box flex="1" minW={0}>
                            <Text fontSize="sm" fontWeight="600" noOfLines={1} color={colors.textPrimary}>
                                {item.name}
                            </Text>
                            <Text fontSize="xs" color={colors.textSecondary}>
                                {t('Alert Quantity')}: {item.reorder_level} {item.unit}
                            </Text>
                        </Box>
                        <Badge
                            colorScheme={getStockColor(item.current_stock, item.reorder_level)}
                            variant="subtle"
                            borderRadius="full"
                            px={2.5}
                            py={1}
                            fontSize="xs"
                            fontWeight="600"
                        >
                            {item.current_stock} {item.unit}
                        </Badge>
                    </Flex>
                ))}
                {data.length === 0 && (
                    <Text fontSize="sm" color={colors.textSecondary} textAlign="center" py={4}>
                        {t('No low stock alerts')}
                    </Text>
                )}
            </VStack>
        </Box>
    );
}
