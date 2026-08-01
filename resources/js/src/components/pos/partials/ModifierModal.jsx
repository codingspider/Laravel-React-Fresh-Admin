import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Text, HStack, VStack, Button, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, Checkbox, Divider, Badge,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';
import useThemeColors from '../../../hooks/useThemeColors';

export default function ModifierModal({
  isOpen, onClose, item, onConfirm,
}) {
  const { t } = useTranslation();
  const { formatAmount } = useCurrencyFormatter();
  const colors = useThemeColors();

  const groups = useMemo(
    () => (item?.modifier_groups || []).filter(g => g.status === 'active' && (g.modifiers || []).some(m => m.status === 'active')),
    [item],
  );

  const [selections, setSelections] = useState({});

  useEffect(() => {
    if (isOpen) {
      const initial = {};
      groups.forEach(g => {
        if (g.is_required && g.min_selections > 0) {
          const defaults = (g.modifiers || [])
            .filter(m => m.status === 'active' && m.is_default)
            .slice(0, g.min_selections);
          initial[g.id] = defaults.map(m => m.id);
        } else {
          initial[g.id] = [];
        }
      });
      setSelections(initial);
    }
  }, [isOpen, groups]);

  const modifierPrice = useMemo(() => {
    return groups.reduce((sum, g) => {
      const sel = selections[g.id] || [];
      return sum + sel.reduce((s, id) => {
        const m = (g.modifiers || []).find(mod => mod.id === id);
        return s + (m ? parseFloat(m.price) || 0 : 0);
      }, 0);
    }, 0);
  }, [groups, selections]);

  const basePrice = item ? parseFloat(item.price) || 0 : 0;
  const itemTotal = basePrice + modifierPrice;

  const toggleModifier = (groupId, modifierId, maxSelections) => {
    setSelections(prev => {
      const current = prev[groupId] || [];
      if (current.includes(modifierId)) {
        return { ...prev, [groupId]: current.filter(id => id !== modifierId) };
      }
      if (maxSelections && current.length >= maxSelections) {
        return { ...prev, [groupId]: [...current.slice(1), modifierId] };
      }
      return { ...prev, [groupId]: [...current, modifierId] };
    });
  };

  const isValid = groups.every(g => {
    const count = (selections[g.id] || []).length;
    if (g.is_required && count === 0) return false;
    if (count < g.min_selections) return false;
    if (g.max_selections && count > g.max_selections) return false;
    return true;
  });

  const handleConfirm = () => {
    const selectedModifiers = [];
    groups.forEach(g => {
      (selections[g.id] || []).forEach(id => {
        const m = (g.modifiers || []).find(mod => mod.id === id);
        if (m) {
          selectedModifiers.push({
            id: m.id,
            name: m.name,
            price: parseFloat(m.price) || 0,
            group_id: g.id,
            group_name: g.name,
          });
        }
      });
    });
    onConfirm(selectedModifiers);
    onClose();
  };

  const hasGroups = groups.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg={colors.bgCard} maxW="md">
        <ModalHeader pb={2}>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="800" color={colors.textPrimary}>{item?.name}</Text>
            <Badge colorScheme="green" borderRadius="full" px={2} py={0.5}>
              {t('Base')} {formatAmount(basePrice)}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!hasGroups ? (
            <Text color={colors.textMuted}>{t('No modifiers available for this item.')}</Text>
          ) : (
            <VStack spacing={4} align="stretch">
              {groups.map(g => {
                const count = (selections[g.id] || []).length;
                const activeModifiers = (g.modifiers || []).filter(m => m.status === 'active');
                return (
                  <Box key={g.id}>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="700" color={colors.textPrimary}>{g.name}</Text>
                      <Badge colorScheme={g.is_required ? 'red' : 'gray'} fontSize="xs" borderRadius="full">
                        {g.is_required ? t('Required') : t('Optional')}
                        {g.max_selections ? ` · ${count}/${g.max_selections}` : ''}
                      </Badge>
                    </HStack>
                    <VStack spacing={1} align="stretch">
                      {activeModifiers.map(m => {
                        const isSelected = (selections[g.id] || []).includes(m.id);
                        const price = parseFloat(m.price) || 0;
                        return (
                          <Box
                            key={m.id}
                            onClick={() => toggleModifier(g.id, m.id, g.max_selections)}
                            cursor="pointer"
                            bg={isSelected ? colors.brandSubtle : colors.bgInput}
                            border="1px solid"
                            borderColor={isSelected ? colors.brandSolid : colors.borderInput}
                            borderRadius="lg"
                            px={3}
                            py={2}
                            transition="all 0.15s"
                            _hover={{ borderColor: 'brand.400' }}
                          >
                            <HStack justify="space-between">
                              <HStack spacing={3}>
                                <Checkbox
                                  isChecked={isSelected}
                                  onChange={() => toggleModifier(g.id, m.id, g.max_selections)}
                                  colorScheme="brand"
                                  size="md"
                                  pointerEvents="none"
                                />
                                <Text fontSize="sm" fontWeight={isSelected ? '700' : '500'} color={colors.textPrimary}>
                                  {m.name}
                                </Text>
                              </HStack>
                              {price > 0 && (
                                <Text fontSize="sm" fontWeight="600" color={colors.textSecondary}>
                                  +{formatAmount(price)}
                                </Text>
                              )}
                            </HStack>
                          </Box>
                        );
                      })}
                    </VStack>
                  </Box>
                );
              })}
            </VStack>
          )}
        </ModalBody>
        <Divider borderColor={colors.borderDefault} />
        <ModalFooter>
          <HStack justify="space-between" w="100%">
            <VStack spacing={0} align="start">
              <Text fontSize="xs" color={colors.textMuted}>{t('Item Total')}</Text>
              <Text fontSize="xl" fontWeight="800" color="brand.500">{formatAmount(itemTotal)}</Text>
            </VStack>
            <HStack>
              <Button variant="ghost" onClick={onClose} borderRadius="lg">{t('Cancel')}</Button>
              <Button
                colorScheme="brand"
                borderRadius="lg"
                fontWeight="700"
                isDisabled={!isValid}
                onClick={handleConfirm}
              >
                {t('Add to Order')}
              </Button>
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
