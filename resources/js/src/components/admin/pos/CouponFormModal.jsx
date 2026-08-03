import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Button, Switch, Input, Badge, useToast,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, Select, FormControl, FormLabel, NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Save, Tag } from 'lucide-react';
import api from '../../../axios';
import { POS_COUPONS, POS_COUPON } from '../../../routes/apiRoutes';
import useThemeColors from '../../../hooks/useThemeColors';
import { usePermission } from '../../../context/PermissionContext';

const defaultForm = {
  code: '',
  type: 'fixed',
  value: '',
  min_order_amount: '',
  max_discount_amount: '',
  usage_limit: '',
  per_customer_limit: '',
  is_active: true,
  starts_at: '',
  expires_at: '',
};

export default function CouponFormModal({ isOpen, onClose, coupon, onSaved }) {
  const { t } = useTranslation();
  const toast = useToast();
  const colors = useThemeColors();
  const { user } = usePermission();
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const editingId = coupon?.id || null;

  useEffect(() => {
    if (isOpen) {
      if (coupon) {
        setForm({
          code: coupon.code,
          type: coupon.type,
          value: coupon.value?.toString() || '',
          min_order_amount: coupon.min_order_amount?.toString() || '',
          max_discount_amount: coupon.max_discount_amount?.toString() || '',
          usage_limit: coupon.usage_limit?.toString() || '',
          per_customer_limit: coupon.per_customer_limit?.toString() || '',
          is_active: coupon.is_active,
          starts_at: coupon.starts_at ? coupon.starts_at.slice(0, 16) : '',
          expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 16) : '',
        });
      } else {
        setForm(defaultForm);
      }
    }
  }, [isOpen, coupon]);

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        value: parseFloat(form.value) || 0,
        min_order_amount: parseFloat(form.min_order_amount) || 0,
        max_discount_amount: form.max_discount_amount ? parseFloat(form.max_discount_amount) : null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        per_customer_limit: form.per_customer_limit ? parseInt(form.per_customer_limit) : null,
        starts_at: form.starts_at || null,
        expires_at: form.expires_at || null,
        restaurant_id: user?.restaurant_id || null,
      };

      if (editingId) {
        await api.put(POS_COUPON(editingId), payload);
        onSaved(t('coupon_updated'));
      } else {
        await api.post(POS_COUPONS, payload);
        onSaved(t('coupon_created'));
      }
    } catch {
      toast({
        title: editingId ? t('failed_to_update_coupon') : t('failed_to_create_coupon'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent bg={colors.bgCard} borderRadius="xl">
        <ModalHeader>
          <HStack>
            <Tag size={16} />
            <Text>{editingId ? t('edit_coupon') : t('create_coupon')}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">{t('coupon_code')}</FormLabel>
                <Input
                  value={form.code}
                  onChange={e => updateField('code', e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER20"
                  borderRadius="lg"
                  bg={colors.bgInput}
                  border="1px solid"
                  borderColor={colors.borderInput}
                  textTransform="uppercase"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">{t('type')}</FormLabel>
                <Select
                  value={form.type}
                  onChange={e => updateField('type', e.target.value)}
                  borderRadius="lg"
                  bg={colors.bgInput}
                  border="1px solid"
                  borderColor={colors.borderInput}
                >
                  <option value="fixed">{t('fixed_amount')}</option>
                  <option value="percent">{t('percent_off')}</option>
                </Select>
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">{t('discount_value')}</FormLabel>
                <NumberInput value={form.value} onChange={v => updateField('value', v)} min={0}>
                  <NumberInputField borderRadius="lg" bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">{t('min_order_amount')}</FormLabel>
                <NumberInput value={form.min_order_amount} onChange={v => updateField('min_order_amount', v)} min={0}>
                  <NumberInputField borderRadius="lg" bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} />
                </NumberInput>
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">{t('max_discount_amount')}</FormLabel>
                <NumberInput value={form.max_discount_amount} onChange={v => updateField('max_discount_amount', v)} min={0}>
                  <NumberInputField borderRadius="lg" bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">{t('usage_limit')}</FormLabel>
                <NumberInput value={form.usage_limit} onChange={v => updateField('usage_limit', v)} min={0}>
                  <NumberInputField borderRadius="lg" bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} />
                </NumberInput>
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">{t('per_customer_limit')}</FormLabel>
                <NumberInput value={form.per_customer_limit} onChange={v => updateField('per_customer_limit', v)} min={0}>
                  <NumberInputField borderRadius="lg" bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} />
                </NumberInput>
              </FormControl>
              <FormControl display="flex" alignItems="flex-end" pb={1}>
                <HStack spacing={3}>
                  <Switch
                    isChecked={form.is_active}
                    onChange={e => updateField('is_active', e.target.checked)}
                    colorScheme="green"
                  />
                  <Text fontSize="sm" fontWeight="600">{form.is_active ? t('active') : t('inactive')}</Text>
                </HStack>
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">{t('start_date')}</FormLabel>
                <Input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={e => updateField('starts_at', e.target.value)}
                  borderRadius="lg"
                  bg={colors.bgInput}
                  border="1px solid"
                  borderColor={colors.borderInput}
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">{t('expiry_date')}</FormLabel>
                <Input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={e => updateField('expires_at', e.target.value)}
                  borderRadius="lg"
                  bg={colors.bgInput}
                  border="1px solid"
                  borderColor={colors.borderInput}
                  size="sm"
                />
              </FormControl>
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} borderRadius="lg" mr={3}>
            {t('cancel')}
          </Button>
          <Button leftIcon={<Save size={16} />} colorScheme="teal" onClick={handleSave} borderRadius="lg" isLoading={saving}>
            {editingId ? t('update') : t('create')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
