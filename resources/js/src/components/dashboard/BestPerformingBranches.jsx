import React from 'react';
import { Box, Heading, Text, Flex, VStack, Avatar } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useThemeColors from '../../hooks/useThemeColors';
import { useCurrencyFormatter } from '../../useCurrencyFormatter';

export default function BestPerformingBranches({ data = [] }) {
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
                    {t('Best Performing Branches')}
                </Heading>
            </Box>
            <VStack spacing={0} align="stretch">
                {data.map((branch, index) => (
                    <Flex
                        key={branch.branch_id || index}
                        align="center"
                        p={3}
                        borderRadius="lg"
                        _hover={{ bg: colors.bgHover }}
                        transition="background 0.15s ease"
                        gap={3}
                    >
                        <Avatar
                            size="sm"
                            name={branch.branch_name}
                            bg="brand.500"
                            color="white"
                            fontWeight="600"
                        />
                        <Box flex="1" minW={0}>
                            <Text fontSize="sm" fontWeight="600" noOfLines={1} color={colors.textPrimary}>
                                {branch.branch_name}
                            </Text>
                            <Text fontSize="xs" color={colors.textSecondary}>
                                {t('Total Orders')}: {branch.total_orders}
                            </Text>
                        </Box>
                        <Text fontSize="sm" fontWeight="700" color={colors.textPrimary} whiteSpace="nowrap">
                            {formatAmount(branch.total_sales)}
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
