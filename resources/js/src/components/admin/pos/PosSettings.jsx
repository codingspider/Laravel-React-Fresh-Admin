import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, VStack, HStack, Text, Button, Card, CardBody, Switch, Input, Badge,
  SimpleGrid, Heading, Divider, useToast, Spinner, Center, Flex, IconButton,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { AddIcon, DeleteIcon, SettingsIcon } from '@chakra-ui/icons';
import { Save } from 'lucide-react';
import api from '../../../axios';
import { POS_SETTINGS } from '../../../routes/apiRoutes';
import useThemeColors from '../../../hooks/useThemeColors';

const DEFAULT_ORDER_TYPES = [
  { value: 'dine_in', label: 'Dine In', icon: 'Utensils', enabled: true },
  { value: 'takeaway', label: 'Takeaway', icon: 'Coffee', enabled: true },
  { value: 'delivery', label: 'Delivery', icon: 'Bike', enabled: true },
];

const DEFAULT_PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: 'Banknote', enabled: true },
  { value: 'card', label: 'Card', icon: 'CreditCard', enabled: true },
  { value: 'upi', label: 'UPI', icon: 'Smartphone', enabled: true },
  { value: 'online', label: 'Online', icon: 'ExternalLink', enabled: true },
  { value: 'credit', label: 'Credit', icon: 'ClipboardList', enabled: true },
  { value: 'loyalty', label: 'Loyalty', icon: 'Star', enabled: true },
  { value: 'gift_card', label: 'Gift Card', icon: 'Gift', enabled: true },
  { value: 'other', label: 'Other', icon: 'FileText', enabled: true },
];

const ALL_PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'online', label: 'Online' },
  { value: 'credit', label: 'Credit' },
  { value: 'loyalty', label: 'Loyalty' },
  { value: 'gift_card', label: 'Gift Card' },
  { value: 'other', label: 'Other' },
];

const ALL_ORDER_TYPES = [
  { value: 'dine_in', label: 'Dine In' },
  { value: 'takeaway', label: 'Takeaway' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'drive_through', label: 'Drive Through' },
  { value: 'curbside', label: 'Curbside' },
];

export default function PosSettings() {
  const { t } = useTranslation();
  const toast = useToast();
  const colors = useThemeColors();

  const pageBg = colors.bgPage;
  const panelBg = colors.bgCard;
  const panelBorder = colors.borderDefault;
  const textPrimary = colors.textPrimary;
  const textSecondary = colors.textSecondary;
  const subtleBg = colors.bgSubtle;
  const inputBg = colors.bgInput;
  const inputBorder = colors.borderInput;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderTypes, setOrderTypes] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [taxRate, setTaxRate] = useState(0);
  const [taxName, setTaxName] = useState('');
  const [features, setFeatures] = useState({
    enable_discount: true,
    enable_coupon: true,
    enable_shipping: true,
    enable_tip: false,
    enable_notes: true,
    enable_kitchen_notes: true,
    enable_table_management: true,
    enable_customer: true,
  });

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get(POS_SETTINGS);
      const data = res.data.data;
      setOrderTypes(data.order_types || DEFAULT_ORDER_TYPES);
      setPaymentMethods(data.payment_methods || DEFAULT_PAYMENT_METHODS);
      setTaxRate(data.default_tax_rate || 0);
      setTaxName(data.default_tax_name || '');
      setFeatures({
        enable_discount: data.enable_discount ?? true,
        enable_coupon: data.enable_coupon ?? true,
        enable_shipping: data.enable_shipping ?? true,
        enable_tip: data.enable_tip ?? false,
        enable_notes: data.enable_notes ?? true,
        enable_kitchen_notes: data.enable_kitchen_notes ?? true,
        enable_table_management: data.enable_table_management ?? true,
        enable_customer: data.enable_customer ?? true,
      });
    } catch {
      setOrderTypes(DEFAULT_ORDER_TYPES);
      setPaymentMethods(DEFAULT_PAYMENT_METHODS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(POS_SETTINGS, {
        order_types: orderTypes,
        payment_methods: paymentMethods,
        default_tax_rate: parseFloat(taxRate) || 0,
        default_tax_name: taxName || null,
        ...features,
      });
      toast({ title: t('Settings saved successfully'), status: 'success', duration: 2000, isClosable: true });
    } catch {
      toast({ title: t('Failed to save settings'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const toggleOrderType = (index) => {
    setOrderTypes(prev => prev.map((ot, i) => i === index ? { ...ot, enabled: !ot.enabled } : ot));
  };

  const togglePaymentMethod = (index) => {
    setPaymentMethods(prev => prev.map((pm, i) => i === index ? { ...pm, enabled: !pm.enabled } : pm));
  };

  const addPaymentMethod = () => {
    const available = ALL_PAYMENT_METHODS.filter(
      pm => !paymentMethods.find(p => p.value === pm.value)
    );
    if (available.length > 0) {
      setPaymentMethods(prev => [...prev, { ...available[0], enabled: true }]);
    }
  };

  const removePaymentMethod = (index) => {
    setPaymentMethods(prev => prev.filter((_, i) => i !== index));
  };

  const addOrderType = () => {
    const available = ALL_ORDER_TYPES.filter(
      ot => !orderTypes.find(o => o.value === ot.value)
    );
    if (available.length > 0) {
      setOrderTypes(prev => [...prev, { ...available[0], enabled: true }]);
    }
  };

  const removeOrderType = (index) => {
    setOrderTypes(prev => prev.filter((_, i) => i !== index));
  };

  const updatePaymentMethodValue = (index, value) => {
    const method = ALL_PAYMENT_METHODS.find(m => m.value === value);
    if (method) {
      setPaymentMethods(prev => prev.map((pm, i) => i === index ? { ...pm, value: method.value, label: method.label } : pm));
    }
  };

  const updateOrderTypeValue = (index, value) => {
    const type = ALL_ORDER_TYPES.find(ot => ot.value === value);
    if (type) {
      setOrderTypes(prev => prev.map((ot, i) => i === index ? { ...ot, value: type.value, label: type.label } : ot));
    }
  };

  if (loading) {
    return (
      <Center h="calc(100vh - 60px)" bg={pageBg}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="3px" />
          <Text color={textSecondary}>{t('Loading POS settings...')}</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <>
      <Card mb={5}>
        <CardBody>
          <Flex justify="space-between" align="center">
            <HStack>
              <Box p={2} bg="brand.500" color="white" borderRadius="lg">
                <SettingsIcon size={20} />
              </Box>
              <VStack spacing={0} align="start">
                <Heading size="lg" color={textPrimary}>{t('POS Settings')}</Heading>
                <Text fontSize="sm" color={textSecondary}>{t('Configure order types, payment methods, and features')}</Text>
              </VStack>
            </HStack>
            <Button
              leftIcon={<Save size={16} />}
              colorScheme="brand"
              onClick={handleSave}
              isLoading={saving}
              borderRadius="lg"
            >
              {t('Save Settings')}
            </Button>
          </Flex>
        </CardBody>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>

        <Card bg={panelBg} border="1px solid" borderColor={panelBorder} borderRadius="xl">
          <CardBody p={6}>
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="md" color={textPrimary} mb={1}>{t('Order Types')}</Heading>
                <Text fontSize="sm" color={textSecondary}>{t('Enable or disable order types available in POS')}</Text>
              </Box>
              <Divider borderColor={panelBorder} />
              <VStack spacing={3} align="stretch">
                {orderTypes.map((ot, idx) => (
                  <HStack key={idx} justify="space-between" p={3} bg={subtleBg} borderRadius="lg">
                    <HStack spacing={3}>
                      <Text fontWeight="600" color={textPrimary}>{ot.label}</Text>
                      <Badge colorScheme={ot.enabled ? 'green' : 'gray'} fontSize="xs">
                        {ot.enabled ? t('Enabled') : t('Disabled')}
                      </Badge>
                    </HStack>
                    <HStack spacing={2}>
                      <Switch
                        isChecked={ot.enabled}
                        onChange={() => toggleOrderType(idx)}
                        colorScheme="brand"
                      />
                      <IconButton
                        size="xs"
                        icon={<DeleteIcon />}
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => removeOrderType(idx)}
                      />
                    </HStack>
                  </HStack>
                ))}
                {orderTypes.length < ALL_ORDER_TYPES.length && (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<AddIcon />}
                    onClick={addOrderType}
                    borderRadius="lg"
                  >
                    {t('Add Order Type')}
                  </Button>
                )}
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={panelBg} border="1px solid" borderColor={panelBorder} borderRadius="xl">
          <CardBody p={6}>
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="md" color={textPrimary} mb={1}>{t('Payment Methods')}</Heading>
                <Text fontSize="sm" color={textSecondary}>{t('Enable or disable payment methods available in POS')}</Text>
              </Box>
              <Divider borderColor={panelBorder} />
              <VStack spacing={3} align="stretch">
                {paymentMethods.map((pm, idx) => (
                  <HStack key={idx} justify="space-between" p={3} bg={subtleBg} borderRadius="lg">
                    <HStack spacing={3}>
                      <Text fontWeight="600" color={textPrimary}>{pm.label}</Text>
                      <Badge colorScheme={pm.enabled ? 'green' : 'gray'} fontSize="xs">
                        {pm.enabled ? t('Enabled') : t('Disabled')}
                      </Badge>
                    </HStack>
                    <HStack spacing={2}>
                      <Switch
                        isChecked={pm.enabled}
                        onChange={() => togglePaymentMethod(idx)}
                        colorScheme="brand"
                      />
                      <IconButton
                        size="xs"
                        icon={<DeleteIcon />}
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => removePaymentMethod(idx)}
                      />
                    </HStack>
                  </HStack>
                ))}
                {paymentMethods.length < ALL_PAYMENT_METHODS.length && (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<AddIcon />}
                    onClick={addPaymentMethod}
                    borderRadius="lg"
                  >
                    {t('Add Payment Method')}
                  </Button>
                )}
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={panelBg} border="1px solid" borderColor={panelBorder} borderRadius="xl">
          <CardBody p={6}>
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="md" color={textPrimary} mb={1}>{t('Tax Settings')}</Heading>
                <Text fontSize="sm" color={textSecondary}>{t('Default tax configuration for POS orders')}</Text>
              </Box>
              <Divider borderColor={panelBorder} />
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="600" color={textSecondary} mb={1}>{t('Default Tax Rate (%)')}</Text>
                  <Input
                    type="number"
                    value={taxRate}
                    onChange={e => setTaxRate(e.target.value)}
                    borderRadius="lg"
                    bg={inputBg}
                    border="1px solid"
                    borderColor={inputBorder}
                    min={0}
                    max={100}
                  />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="600" color={textSecondary} mb={1}>{t('Tax Name')}</Text>
                  <Input
                    value={taxName}
                    onChange={e => setTaxName(e.target.value)}
                    placeholder={t('e.g. VAT, GST')}
                    borderRadius="lg"
                    bg={inputBg}
                    border="1px solid"
                    borderColor={inputBorder}
                  />
                </Box>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={panelBg} border="1px solid" borderColor={panelBorder} borderRadius="xl">
          <CardBody p={6}>
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="md" color={textPrimary} mb={1}>{t('POS Features')}</Heading>
                <Text fontSize="sm" color={textSecondary}>{t('Toggle POS features on or off')}</Text>
              </Box>
              <Divider borderColor={panelBorder} />
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {[
                  { key: 'enable_discount', label: t('Discount'), desc: t('Allow applying discounts to orders') },
                  { key: 'enable_coupon', label: t('Coupon'), desc: t('Allow coupon codes at checkout') },
                  { key: 'enable_shipping', label: t('Shipping'), desc: t('Allow adding delivery/shipping charges') },
                  { key: 'enable_tip', label: t('Tip'), desc: t('Allow adding tips to orders') },
                  { key: 'enable_notes', label: t('Order Notes'), desc: t('Allow adding notes to orders') },
                  { key: 'enable_kitchen_notes', label: t('Kitchen Notes'), desc: t('Allow special instructions for kitchen') },
                  { key: 'enable_table_management', label: t('Table Management'), desc: t('Allow selecting tables for dine-in') },
                  { key: 'enable_customer', label: t('Customer Selection'), desc: t('Allow selecting customers at checkout') },
                ].map(item => (
                  <HStack key={item.key} justify="space-between" p={3} bg={subtleBg} borderRadius="lg">
                    <VStack spacing={0} align="start">
                      <Text fontSize="sm" fontWeight="600" color={textPrimary}>{item.label}</Text>
                      <Text fontSize="xs" color={textSecondary}>{item.desc}</Text>
                    </VStack>
                    <Switch
                      isChecked={features[item.key]}
                      onChange={() => setFeatures(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      colorScheme="brand"
                    />
                  </HStack>
                ))}
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </>
  );
}
