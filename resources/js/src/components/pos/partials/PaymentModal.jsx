import React from 'react';
import {
  Box, Text, HStack, VStack, Grid, Input, Select, Button, IconButton, Card,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { CheckIcon, DeleteIcon } from '@chakra-ui/icons';
import { CreditCard, GitMerge } from 'lucide-react';
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';
import useThemeColors from '../../../hooks/useThemeColors';

export default function PaymentModal({
  isOpen, onClose, isSplitPayment, setIsSplitPayment,
  paymentMethod, setPaymentMethod, paymentAmount, setPaymentAmount,
  splitPayments, setSplitPayments, saleTotal, currentSale,
  processPayment, submitting, onCancelOpen,
  paymentMethods,
}) {
  const { t } = useTranslation();
  const { formatAmount } = useCurrencyFormatter();
  const colors = useThemeColors();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent bg={colors.bgCard}>
        <ModalHeader borderBottom="1px solid" borderColor={colors.borderDefault}>
          <HStack justify="space-between">
            <HStack>
              <CreditCard size={20} color="brand.500" />
              <Text>{t('Process Payment')}</Text>
            </HStack>
            <HStack spacing={2}>
              <Button
                size="xs"
                variant={isSplitPayment ? 'solid' : 'outline'}
                colorScheme={isSplitPayment ? 'purple' : 'gray'}
                onClick={() => setIsSplitPayment(!isSplitPayment)}
                borderRadius="lg"
              >
                <GitMerge size={12} style={{ marginRight: 4 }} />
                {t('Split')}
              </Button>
              {currentSale && (
                <Button
                  size="xs"
                  variant="outline"
                  colorScheme="orange"
                  onClick={() => { onClose(); onCancelOpen(); }}
                  borderRadius="lg"
                >
                  {t('Cancel Order')}
                </Button>
              )}
            </HStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={5} align="stretch" pt={2}>
            <Box textAlign="center" p={4} bg={colors.bgSubtle} borderRadius="xl">
              <Text fontSize="sm" color={colors.textSecondary} mb={1}>{t('Total Amount')}</Text>
              <Text fontSize="3xl" fontWeight="800" color="brand.500">
                {formatAmount(saleTotal)}
              </Text>
              {currentSale && currentSale.amount_paid > 0 && (
                <HStack justify="center" spacing={4} mt={2}>
                  <Text fontSize="sm" color={colors.textSecondary}>
                    {t('Paid')}: {formatAmount(currentSale.amount_paid)}
                  </Text>
                  <Text fontSize="sm" color="red.500" fontWeight="600">
                    {t('Due')}: {formatAmount(Math.max(0, saleTotal - currentSale.amount_paid))}
                  </Text>
                </HStack>
              )}
            </Box>

            {!isSplitPayment ? (
              <>
                <Box>
                  <Text fontSize="sm" fontWeight="600" color={colors.textSecondary} mb={2}>{t('Payment Method')}</Text>
                  <Grid templateColumns="repeat(4, 1fr)" gap={2}>
                    {(paymentMethods || []).map(pm => (
                      <Button
                        key={pm.value}
                        size="sm"
                        variant={paymentMethod === pm.value ? 'solid' : 'outline'}
                        colorScheme={paymentMethod === pm.value ? 'brand' : 'gray'}
                        onClick={() => setPaymentMethod(pm.value)}
                        borderRadius="lg"
                        fontWeight="600"
                        leftIcon={React.cloneElement(pm.icon, { size: 14 })}
                      >
                        {t(pm.label)}
                      </Button>
                    ))}
                  </Grid>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="600" color={colors.textSecondary} mb={2}>{t('Amount')}</Text>
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    fontSize="xl"
                    fontWeight="700"
                    textAlign="center"
                    borderRadius="xl"
                    bg={colors.bgInput}
                    border="1px solid"
                    borderColor={colors.borderInput}
                    size="lg"
                  />
                </Box>

                <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                  {[saleTotal, saleTotal / 2, saleTotal / 3].map((val, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant="outline"
                      borderRadius="lg"
                      onClick={() => setPaymentAmount(val.toFixed(2))}
                    >
                      {i === 0 ? t('Full') : i === 1 ? '1/2' : '1/3'}
                    </Button>
                  ))}
                </Grid>

                {currentSale && currentSale.amount_paid > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="lg"
                    colorScheme="orange"
                    w="100%"
                    onClick={() => setPaymentAmount(Math.max(0, saleTotal - currentSale.amount_paid).toFixed(2))}
                  >
                    {t('Pay Due Amount')} ({formatAmount(Math.max(0, saleTotal - currentSale.amount_paid))})
                  </Button>
                )}
              </>
            ) : (
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="600" color={colors.textSecondary}>{t('Split Payment')}</Text>
                {splitPayments.map((sp, idx) => (
                  <Card key={idx} p={3} borderRadius="lg" border="1px solid" borderColor={colors.borderDefault}>
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="xs" fontWeight="600" color={colors.textSecondary}>{t('Payment')} #{idx + 1}</Text>
                        {splitPayments.length > 1 && (
                          <IconButton
                            size="xs"
                            icon={<DeleteIcon />}
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => setSplitPayments(prev => prev.filter((_, i) => i !== idx))}
                          />
                        )}
                      </HStack>
                      <Grid templateColumns="1fr 1fr" gap={2}>
                        <Select
                          size="sm"
                          value={sp.method}
                          onChange={e => {
                            const updated = [...splitPayments];
                            updated[idx].method = e.target.value;
                            setSplitPayments(updated);
                          }}
                          borderRadius="lg"
                        >
                          {(paymentMethods || []).map(pm => (
                            <option key={pm.value} value={pm.value}>{pm.label}</option>
                          ))}
                        </Select>
                        <Input
                          size="sm"
                          type="number"
                          placeholder={t('Amount')}
                          value={sp.amount}
                          onChange={e => {
                            const updated = [...splitPayments];
                            updated[idx].amount = e.target.value;
                            setSplitPayments(updated);
                          }}
                          borderRadius="lg"
                        />
                      </Grid>
                      <Input
                        size="sm"
                        placeholder={t('Reference number (optional)')}
                        value={sp.reference}
                        onChange={e => {
                          const updated = [...splitPayments];
                          updated[idx].reference = e.target.value;
                          setSplitPayments(updated);
                        }}
                        borderRadius="lg"
                      />
                    </VStack>
                  </Card>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<CheckIcon />}
                  borderRadius="lg"
                  onClick={() => setSplitPayments(prev => [...prev, { method: 'cash', amount: '', reference: '' }])}
                >
                  {t('Add Payment')}
                </Button>
                <HStack justify="space-between" p={2} bg={colors.bgSubtle} borderRadius="lg">
                  <Text fontSize="sm" fontWeight="600">{t('Total Entered')}</Text>
                  <Text fontSize="sm" fontWeight="700" color={
                    splitPayments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0) >= saleTotal
                      ? 'green.500' : 'red.500'
                  }>
                    {formatAmount(splitPayments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0))}
                  </Text>
                </HStack>
              </VStack>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter borderTop="1px solid" borderColor={colors.borderDefault}>
          <Button variant="ghost" mr={3} onClick={onClose} borderRadius="lg">
            {t('Cancel')}
          </Button>
          <Button
            colorScheme="green"
            onClick={processPayment}
            isLoading={submitting}
            borderRadius="lg"
            fontWeight="700"
            leftIcon={<CheckIcon />}
            size="lg"
          >
            {t('Confirm Payment')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
