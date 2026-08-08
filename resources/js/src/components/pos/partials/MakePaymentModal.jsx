import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, VStack, HStack, Text, Input, Select, useToast, FormControl, FormLabel, Box,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';
import useThemeColors from '../../../hooks/useThemeColors';
import api from '../../../axios';
import { POS_PROCESS_PAYMENT } from '../../../routes/apiRoutes';

export default function MakePaymentModal({ isOpen, onClose, sale, onPaymentSuccess }) {
  const { t } = useTranslation();
  const toast = useToast();
  const colors = useThemeColors();
  const { formatAmount } = useCurrencyFormatter();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const due = Math.max(0, (parseFloat(sale?.total) || 0) - (parseFloat(sale?.amount_paid) || 0));
  const enteredAmount = parseFloat(paymentAmount) || 0;
  const changeAmount = Math.max(0, enteredAmount - due);

  const handlePayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast({ title: t('Please enter a valid amount'), status: 'warning', duration: 2000, isClosable: true });
      return;
    }
    if (changeAmount > 0 && paymentMethod !== 'cash') {
      toast({ title: t('Overpayment is only allowed for cash'), status: 'warning', duration: 2500, isClosable: true });
      return;
    }
    setSubmitting(true);
    try {
      await api.post(POS_PROCESS_PAYMENT(sale.id), {
        payment_method: paymentMethod,
        amount,
        reference_number: referenceNumber || null,
      });
      toast({ title: t('Payment processed successfully'), status: 'success', duration: 2000, isClosable: true });
      setPaymentAmount('');
      setReferenceNumber('');
      setPaymentMethod('cash');
      onClose();
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (error) {
      toast({
        title: t('Payment failed'),
        description: error.response?.data?.message || t('Something went wrong'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setPaymentAmount('');
    setReferenceNumber('');
    setPaymentMethod('cash');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl" bg={colors.bgCard}>
        <ModalHeader borderBottom="1px solid" borderColor={colors.borderDefault}>
          {t('Make Payment')}
        </ModalHeader>
        <ModalBody py={6}>
          <VStack spacing={4} align="stretch">
            <Box p={3} bg={colors.bgSubtle} borderRadius="lg">
              <HStack justify="space-between">
                <Text fontSize="sm" color={colors.textSecondary}>{t('Invoice')}</Text>
                <Text fontSize="sm" fontWeight="600" fontFamily="mono">{sale?.invoice_number}</Text>
              </HStack>
              <HStack justify="space-between" mt={1}>
                <Text fontSize="sm" color={colors.textSecondary}>{t('Total')}</Text>
                <Text fontSize="sm" fontWeight="600">{formatAmount(sale?.total)}</Text>
              </HStack>
              <HStack justify="space-between" mt={1}>
                <Text fontSize="sm" color={colors.textSecondary}>{t('Already Paid')}</Text>
                <Text fontSize="sm" fontWeight="600" color="green.500">{formatAmount(sale?.amount_paid)}</Text>
              </HStack>
              <HStack justify="space-between" mt={1}>
                <Text fontSize="sm" fontWeight="700">{t('Due Amount')}</Text>
                <Text fontSize="sm" fontWeight="700" color="red.500">{formatAmount(due)}</Text>
              </HStack>
              {changeAmount > 0 && (
                <HStack justify="space-between" mt={1}>
                  <Text fontSize="sm" color={colors.textSecondary}>{t('Change')}</Text>
                  <Text fontSize="sm" fontWeight="700" color="green.500">{formatAmount(changeAmount)}</Text>
                </HStack>
              )}
            </Box>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color={colors.textPrimary}>{t('Payment Method')}</FormLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                bg={colors.bgInput}
                borderColor={colors.borderInput}
                borderRadius="lg"
              >
                <option value="cash">{t('Cash')}</option>
                <option value="card">{t('Card')}</option>
                <option value="upi">{t('UPI')}</option>
                <option value="online">{t('Online')}</option>
                <option value="credit">{t('Credit')}</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color={colors.textPrimary}>{t('Amount')}</FormLabel>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={t('Enter amount')}
                bg={colors.bgInput}
                borderColor={colors.borderInput}
                borderRadius="lg"
                fontSize="lg"
                fontWeight="700"
              />
            </FormControl>
            <HStack spacing={2}>
              <Button size="sm" variant="outline" borderRadius="lg" onClick={() => setPaymentAmount(due.toFixed(2))} flex={1}>
                {t('Full')} ({formatAmount(due)})
              </Button>
              <Button size="sm" variant="outline" borderRadius="lg" onClick={() => setPaymentAmount((due / 2).toFixed(2))} flex={1}>
                1/2
              </Button>
              <Button size="sm" variant="outline" borderRadius="lg" onClick={() => setPaymentAmount((due / 3).toFixed(2))} flex={1}>
                1/3
              </Button>
            </HStack>
            {paymentMethod !== 'cash' && (
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color={colors.textPrimary}>{t('Reference Number')}</FormLabel>
                <Input
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder={t('Enter reference number')}
                  bg={colors.bgInput}
                  borderColor={colors.borderInput}
                  borderRadius="lg"
                />
              </FormControl>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter borderTop="1px solid" borderColor={colors.borderDefault}>
          <Button variant="ghost" mr={3} onClick={handleClose} borderRadius="lg">{t('Cancel')}</Button>
          <Button
            colorScheme="green"
            onClick={handlePayment}
            isLoading={submitting}
            borderRadius="lg"
            fontWeight="700"
          >
            {t('Confirm Payment')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
