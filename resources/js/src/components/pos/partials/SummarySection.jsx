import React from 'react';
import { Box, Text, HStack, VStack, Divider } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';
import useThemeColors from '../../../hooks/useThemeColors';

export default function SummarySection({ cartItemCount, cartSubtotal, discountAmount, taxRate, taxAmount, shippingAmount, cartTotal }) {
  const { t } = useTranslation();
  const { formatAmount } = useCurrencyFormatter();
  const colors = useThemeColors();

  return (
    <Box px={4} py={3} borderTop="1px solid" borderColor={colors.borderDefault}>
      <VStack spacing={2} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="sm" color={colors.textSecondary}>{t('Total Qty')}</Text>
          <Text fontSize="sm" fontWeight="700" color={colors.textPrimary}>{cartItemCount}</Text>
        </HStack>
        <HStack justify="space-between">
          <Text fontSize="sm" color={colors.textSecondary}>{t('Items')}</Text>
          <Text fontSize="sm" fontWeight="600" color={colors.textPrimary}>{formatAmount(cartSubtotal)}</Text>
        </HStack>
        {discountAmount > 0 && (
          <HStack justify="space-between">
            <Text fontSize="sm" color={colors.discountText}>{t('Discount')}</Text>
            <Text fontSize="sm" fontWeight="600" color={colors.discountText}>
              -{formatAmount(discountAmount)}
            </Text>
          </HStack>
        )}
        {taxAmount > 0 && (
          <HStack justify="space-between">
            <Text fontSize="sm" color={colors.textSecondary}>{t('Tax')} ({taxRate}%)</Text>
            <Text fontSize="sm" fontWeight="600" color={colors.textPrimary}>{formatAmount(taxAmount)}</Text>
          </HStack>
        )}
        {shippingAmount > 0 && (
          <HStack justify="space-between">
            <Text fontSize="sm" color={colors.textSecondary}>{t('Shipping')}</Text>
            <Text fontSize="sm" fontWeight="600" color={colors.textPrimary}>{formatAmount(shippingAmount)}</Text>
          </HStack>
        )}
        <Divider borderColor={colors.borderDefault} />
        <HStack justify="space-between" pt={1}>
          <Text fontSize="lg" fontWeight="800" color={colors.textPrimary}>{t('Total')}</Text>
          <Text fontSize="xl" fontWeight="800" color="brand.500">{formatAmount(cartTotal)}</Text>
        </HStack>
      </VStack>
    </Box>
  );
}
