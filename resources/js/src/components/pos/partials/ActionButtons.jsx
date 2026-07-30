import React from 'react';
import { Box, Button, Grid } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Pause, RotateCcw, CreditCard } from 'lucide-react';
import useThemeColors from '../../../hooks/useThemeColors';

export default function ActionButtons({ cartLength, holdOrder, resetCart, submitOrder, submitting }) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <Box px={4} py={3} borderTop="1px solid" borderColor={colors.borderDefault}>
      <Grid templateColumns="1fr 1fr 1.5fr" gap={2}>
        <Button
          size="lg"
          bg={colors.actionHold}
          color="white"
          _hover={{ bg: colors.actionHoldHover }}
          onClick={holdOrder}
          isDisabled={cartLength === 0}
          borderRadius="xl"
          fontWeight="700"
          leftIcon={<Pause size={16} />}
        >
          {t('Hold')}
        </Button>
        <Button
          size="lg"
          bg={colors.actionReset}
          color="white"
          _hover={{ bg: colors.actionResetHover }}
          onClick={resetCart}
          isDisabled={cartLength === 0}
          borderRadius="xl"
          fontWeight="700"
          leftIcon={<RotateCcw size={16} />}
        >
          {t('Reset')}
        </Button>
        <Button
          size="lg"
          bg={colors.actionPay}
          color="white"
          _hover={{ bg: colors.actionPayHover }}
          onClick={submitOrder}
          isLoading={submitting}
          isDisabled={cartLength === 0}
          borderRadius="xl"
          fontWeight="700"
          leftIcon={<CreditCard size={16} />}
        >
          {t('Pay Now')}
        </Button>
      </Grid>
    </Box>
  );
}
