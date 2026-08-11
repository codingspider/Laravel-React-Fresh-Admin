import React from 'react';
import { Box, Heading, Text, Flex, Image, HStack, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useThemeColors from '../../hooks/useThemeColors';
import { useCurrencyFormatter } from '../../useCurrencyFormatter';

export default function TopSellingProducts({ data = [] }) {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();

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
                    {t('Top Selling Products')}
                </Heading>
            </Box>
            <VStack spacing={0} align="stretch">
                {data.map((product, index) => (
                    <Flex
                        key={product.id || index}
                        align="center"
                        p={3}
                        borderRadius="lg"
                        _hover={{ bg: colors.bgHover }}
                        transition="background 0.15s ease"
                        gap={3}
                    >
                        <Image
                            src={product.image || '/placeholder.png'}
                            alt={product.name}
                            boxSize="40px"
                            borderRadius="md"
                            objectFit="cover"
                            bg={colors.bgSubtle}
                        />
                        <Box flex="1" minW={0}>
                            <Text fontSize="sm" fontWeight="600" noOfLines={1} color={colors.textPrimary}>
                                {product.name}
                            </Text>
                            <Text fontSize="xs" color={colors.textSecondary}>
                                {t('Quantity Sold')}: {product.quantity_sold}
                            </Text>
                        </Box>
                        <Text fontSize="sm" fontWeight="700" color={colors.textPrimary} whiteSpace="nowrap">
                            {formatAmount(product.total_amount)}
                        </Text>
                    </Flex>
                ))}
                {data.length === 0 && (
                    <Text fontSize="sm" color={colors.textSecondary} textAlign="center" py={4}>
                        {t('No data available')}
                    </Text>
                )}
            </VStack>
        </Box>
    );
}
