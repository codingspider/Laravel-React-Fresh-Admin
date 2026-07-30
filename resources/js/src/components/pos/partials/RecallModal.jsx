import React, { useState, useCallback } from 'react';
import {
  Box, Text, VStack, HStack, Card, Center, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalCloseButton, ModalFooter,
  Button, Checkbox, Badge, useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { RepeatClockIcon } from '@chakra-ui/icons';
import { Pause, ClipboardList, Merge } from 'lucide-react';
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';
import useThemeColors from '../../../hooks/useThemeColors';

export default function RecallModal({ isOpen, onClose, heldOrders, recallOrder, mergeBills }) {
  const { t } = useTranslation();
  const { formatAmount } = useCurrencyFormatter();
  const toast = useToast();
  const colors = useThemeColors();

  const [mergeMode, setMergeMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [merging, setMerging] = useState(false);

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleMerge = useCallback(async () => {
    if (selectedIds.length < 2) {
      toast({ title: t('Select at least 2 orders to merge'), status: 'warning', duration: 2000, isClosable: true });
      return;
    }
    setMerging(true);
    try {
      await mergeBills(selectedIds);
      setMergeMode(false);
      setSelectedIds([]);
      onClose();
    } catch {
      toast({ title: t('Failed to merge orders'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setMerging(false);
    }
  }, [selectedIds, mergeBills, onClose, toast, t]);

  const handleClose = () => {
    setMergeMode(false);
    setSelectedIds([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent bg={colors.bgCard}>
        <ModalHeader borderBottom="1px solid" borderColor={colors.borderDefault}>
          <HStack justify="space-between">
            <HStack>
              <RepeatClockIcon color="blue.500" />
              <Text>{t('Held Orders')}</Text>
            </HStack>
            {heldOrders.length >= 2 && (
              <Button
                size="xs"
                variant={mergeMode ? 'solid' : 'outline'}
                colorScheme={mergeMode ? 'orange' : 'gray'}
                leftIcon={<Merge size={12} />}
                onClick={() => {
                  setMergeMode(!mergeMode);
                  setSelectedIds([]);
                }}
                borderRadius="lg"
              >
                {mergeMode ? t('Cancel') : t('Merge')}
              </Button>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {heldOrders.length === 0 ? (
            <Center py={8}>
              <VStack>
                <ClipboardList size={40} color={colors.textMuted} strokeWidth={1} />
                <Text color={colors.textMuted}>{t('No held orders')}</Text>
              </VStack>
            </Center>
          ) : (
            <VStack spacing={2} align="stretch" pt={2}>
              {heldOrders.map(held => (
                <Card
                  key={held.id}
                  p={3}
                  cursor="pointer"
                  onClick={() => mergeMode ? toggleSelect(held.id) : recallOrder(held)}
                  borderColor={selectedIds.includes(held.id) ? 'orange.400' : undefined}
                  borderWidth={selectedIds.includes(held.id) ? '2px' : '1px'}
                  _hover={{ borderColor: mergeMode ? 'orange.300' : 'brand.400', transform: 'translateY(-1px)' }}
                  transition="all 0.15s"
                  borderRadius="xl"
                >
                  <HStack justify="space-between">
                    <HStack>
                      {mergeMode && (
                        <Checkbox
                          isChecked={selectedIds.includes(held.id)}
                          onChange={() => toggleSelect(held.id)}
                          colorScheme="orange"
                          onClick={e => e.stopPropagation()}
                        />
                      )}
                      <Box p={2} bg={colors.recallIconBg} borderRadius="lg">
                        <Pause size={14} color={colors.recallIconColor} />
                      </Box>
                      <VStack spacing={0} align="start">
                        <Text fontWeight="700" fontSize="sm" color={colors.textPrimary}>
                          #{held.invoice_number || t('New Order')}
                        </Text>
                        <Text fontSize="xs" color={colors.textSecondary}>
                          {held.items?.length || 0} {t('items')}
                        </Text>
                        {held.table && (
                          <Text fontSize="xs" color={colors.textMuted}>
                            {t('Table')}: {held.table.name}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                    <VStack spacing={0} align="end">
                      <Text fontSize="md" fontWeight="700" color="brand.500">
                        {formatAmount(held.total || 0)}
                      </Text>
                      <Text fontSize="xs" color={colors.textMuted}>
                        {held.created_at ? new Date(held.created_at).toLocaleTimeString() : ''}
                      </Text>
                    </VStack>
                  </HStack>
                </Card>
              ))}
            </VStack>
          )}
        </ModalBody>
        {mergeMode && selectedIds.length >= 2 && (
          <ModalFooter borderTop="1px solid" borderColor={colors.borderDefault} pt={4}>
            <HStack spacing={3} w="100%" justify="space-between">
              <Badge colorScheme="orange" fontSize="sm">
                {selectedIds.length} {t('selected')}
              </Badge>
              <Button
                leftIcon={<Merge size={14} />}
                colorScheme="orange"
                onClick={handleMerge}
                isLoading={merging}
                borderRadius="lg"
                fontWeight="700"
              >
                {t('Merge Orders')}
              </Button>
            </HStack>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}
