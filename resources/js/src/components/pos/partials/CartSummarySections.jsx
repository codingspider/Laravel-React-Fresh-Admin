import React, { useState } from 'react';
import {
  Box, Text, HStack, VStack, Input, IconButton, Badge, Button, Radio, RadioGroup,
  Textarea,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { CheckIcon } from '@chakra-ui/icons';
import { StickyNote } from 'lucide-react';
import useThemeColors from '../../../hooks/useThemeColors';

export default function CartSummarySections({
  discountType, setDiscountType, discountValue, setDiscountValue,
  couponCode, setCouponCode, shipping, setShipping,
  taxRate, taxName, notes, setNotes, kitchenNotes, setKitchenNotes,
  enableDiscount, enableCoupon, enableShipping, enableNotes, enableKitchenNotes,
  validateCoupon,
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [showNotes, setShowNotes] = useState(false);

  return (
    <Box px={4} py={2} borderTop="1px solid" borderColor={colors.borderDefault} bg={colors.bgSubtle}>
      <VStack spacing={2} align="stretch">
        <HStack justify="space-between" align="center">
          <Text fontSize="xs" fontWeight="600" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider">
            {t('Tax')}
          </Text>
          <Text fontSize="sm" fontWeight="600" color={colors.textPrimary}>
            {taxRate > 0 ? `${taxName || 'Tax'} (${taxRate}%)` : t('None')}
          </Text>
        </HStack>

        {enableDiscount && (
          <Box>
            <Text fontSize="xs" fontWeight="600" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
              {t('Discount')}
            </Text>
            <HStack spacing={2}>
              <RadioGroup value={discountType} onChange={setDiscountType} size="sm">
                <HStack spacing={3}>
                  <Radio value="fixed" colorScheme="brand">{t('Fixed')}</Radio>
                  <Radio value="percent" colorScheme="brand">%</Radio>
                </HStack>
              </RadioGroup>
              <Input
                size="sm"
                type="number"
                placeholder="0"
                value={discountValue}
                onChange={e => setDiscountValue(e.target.value)}
                borderRadius="lg"
                bg={colors.bgInput}
                border="1px solid"
                borderColor={colors.borderInput}
                min={0}
              />
            </HStack>
          </Box>
        )}

        {enableCoupon && (
          <Box>
            <Text fontSize="xs" fontWeight="600" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
              {t('Coupon')}
            </Text>
            <HStack spacing={2}>
              <Input
                size="sm"
                placeholder={t('Enter code')}
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                borderRadius="lg"
                bg={colors.bgInput}
                border="1px solid"
                borderColor={colors.borderInput}
              />
              <IconButton
                size="sm"
                icon={<CheckIcon />}
                colorScheme="green"
                variant="outline"
                borderRadius="lg"
                isDisabled={!couponCode}
                onClick={validateCoupon}
              />
            </HStack>
          </Box>
        )}

        {enableShipping && (
          <Box>
            <Text fontSize="xs" fontWeight="600" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
              {t('Shipping')}
            </Text>
            <Input
              size="sm"
              type="number"
              placeholder="0"
              value={shipping}
              onChange={e => setShipping(e.target.value)}
              borderRadius="lg"
              bg={colors.bgInput}
              border="1px solid"
              borderColor={colors.borderInput}
              min={0}
            />
          </Box>
        )}

        {(enableNotes || enableKitchenNotes) && (
          <HStack justify="space-between" align="center">
            <Button
              size="xs"
              variant="ghost"
              leftIcon={<StickyNote size={12} />}
              onClick={() => setShowNotes(!showNotes)}
              color={colors.textSecondary}
            >
              {t('Notes')}
            </Button>
            {(notes || kitchenNotes) && (
              <Badge colorScheme="blue" fontSize="xs" borderRadius="full">
                {t('Added')}
              </Badge>
            )}
          </HStack>
        )}

        {showNotes && (
          <VStack spacing={2} align="stretch">
            {enableNotes && (
              <Box>
                <Text fontSize="xs" fontWeight="600" color={colors.textSecondary} mb={1}>
                  {t('Order Notes')}
                </Text>
                <Textarea
                  size="sm"
                  placeholder={t('Notes for this order...')}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  borderRadius="lg"
                  bg={colors.bgInput}
                  border="1px solid"
                  borderColor={colors.borderInput}
                  rows={2}
                  resize="none"
                />
              </Box>
            )}
            {enableKitchenNotes && (
              <Box>
                <Text fontSize="xs" fontWeight="600" color={colors.textSecondary} mb={1}>
                  {t('Kitchen Notes')}
                </Text>
                <Textarea
                  size="sm"
                  placeholder={t('Special instructions for kitchen...')}
                  value={kitchenNotes}
                  onChange={e => setKitchenNotes(e.target.value)}
                  borderRadius="lg"
                  bg={colors.bgInput}
                  border="1px solid"
                  borderColor={colors.borderInput}
                  rows={2}
                  resize="none"
                />
              </Box>
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
