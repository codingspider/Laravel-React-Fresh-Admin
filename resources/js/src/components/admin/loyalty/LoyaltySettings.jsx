import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, VStack, HStack, Text, Button, Card, CardBody, Switch, Input,
  SimpleGrid, Heading, Divider, useToast, Spinner, Center, Badge, FormControl, FormLabel,
  Icon,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Save, Star, Users, Coins, CircleArrowUp, CircleArrowDown } from 'lucide-react';
import api from '../../../axios';
import { LOYALTY_SETTINGS } from '../../../routes/apiRoutes';
import { DASHBOARD_PATH } from '../../../routes/superAdminRoutes';
import useThemeColors from '../../../hooks/useThemeColors';
import PageHeader from '../../ui/PageHeader';
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';

const EMPTY_SETTINGS = {
  name: '',
  description: '',
  status: 'active',
  points_per_order: 10,
  currency_per_point: 0.01,
  min_order_amount: '',
  min_points_required: 0,
  max_redeem_percent: '',
  points_expiry_days: '',
  enable_earning: true,
  enable_redemption: true,
};

export default function LoyaltySettings() {
  const { t } = useTranslation();
  const toast = useToast();
  const colors = useThemeColors();
  const { formatAmount } = useCurrencyFormatter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_SETTINGS);
  const [summary, setSummary] = useState({
    customers_enrolled: 0,
    points_in_circulation: 0,
    lifetime_points_earned: 0,
    lifetime_points_redeemed: 0,
  });

  const pageBg = colors.bgPage;
  const panelBg = colors.bgCard;
  const panelBorder = colors.borderDefault;
  const textPrimary = colors.textPrimary;
  const textSecondary = colors.textSecondary;
  const subtleBg = colors.bgSubtle;
  const inputBg = colors.bgInput;
  const inputBorder = colors.borderInput;

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get(LOYALTY_SETTINGS);
      const data = res.data?.data || {};
      const programme = data.programme || {};
      setForm({
        name: programme.name || '',
        description: programme.description || '',
        status: programme.status || 'active',
        points_per_order: programme.points_per_order ?? 10,
        currency_per_point: programme.currency_per_point ?? 0.01,
        min_order_amount: programme.min_order_amount ?? '',
        min_points_required: programme.min_points_required ?? 0,
        max_redeem_percent: programme.max_redeem_percent ?? '',
        points_expiry_days: programme.points_expiry_days ?? '',
        enable_earning: programme.enable_earning ?? true,
        enable_redemption: programme.enable_redemption ?? true,
      });
      setSummary(data.summary || {});
    } catch {
      toast({ title: t('Failed to load loyalty settings'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(LOYALTY_SETTINGS, {
        ...form,
        status: form.status,
        points_per_order: parseInt(form.points_per_order, 10) || 0,
        currency_per_point: parseFloat(form.currency_per_point) || 0,
        min_order_amount: form.min_order_amount === '' ? null : parseFloat(form.min_order_amount),
        min_points_required: parseInt(form.min_points_required, 10) || 0,
        max_redeem_percent: form.max_redeem_percent === '' ? null : parseFloat(form.max_redeem_percent),
        points_expiry_days: form.points_expiry_days === '' ? null : parseInt(form.points_expiry_days, 10),
        enable_earning: !!form.enable_earning,
        enable_redemption: !!form.enable_redemption,
      });
      toast({ title: t('Settings saved successfully'), status: 'success', duration: 2000, isClosable: true });
      fetchSettings();
    } catch {
      toast({ title: t('Failed to save settings'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const summaryCards = [
    { label: t('Customers Enrolled'), value: summary.customers_enrolled, icon: Users, color: 'brand.500' },
    { label: t('Points in Circulation'), value: summary.points_in_circulation, icon: Coins, color: 'purple.500' },
    { label: t('Lifetime Points Earned'), value: summary.lifetime_points_earned, icon: CircleArrowUp, color: 'green.500' },
    { label: t('Lifetime Points Redeemed'), value: summary.lifetime_points_redeemed, icon: CircleArrowDown, color: 'orange.500' },
  ];

  if (loading) {
    return (
      <Center h="60vh">
        <Spinner size="xl" color="brand.500" thickness="3px" />
      </Center>
    );
  }

  return (
    <Box bg={pageBg} minH="100vh">
      <PageHeader
        title={t('Loyalty Programme')}
        subtitle={t('Configure how customers earn and redeem loyalty points')}
        breadcrumbs={[
          { label: t('Dashboard'), path: DASHBOARD_PATH },
          { label: t('Loyalty'), isCurrent: true },
        ]}
      />

      <VStack spacing={6} align="stretch">
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
          {summaryCards.map((card) => (
            <Card key={card.label} bg={panelBg} border="1px solid" borderColor={panelBorder} borderRadius="xl" boxShadow="card">
              <CardBody>
                <HStack spacing={3}>
                  <Box p={2.5} bg={subtleBg} borderRadius="lg">
                    <Icon as={card.icon} boxSize={5} color={card.color} />
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={textSecondary}>{card.label}</Text>
                    <Text fontSize="2xl" fontWeight="800" color={textPrimary}>{card.value}</Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        <Card bg={panelBg} border="1px solid" borderColor={panelBorder} borderRadius="xl" boxShadow="card">
          <CardBody p={{ base: 5, md: 8 }}>
            <VStack spacing={6} align="stretch">
              <HStack spacing={3}>
                <Star size={22} color="brand.500" />
                <Heading size="md" color={textPrimary}>{t('Programme Configuration')}</Heading>
              </HStack>
              <Divider borderColor={panelBorder} />

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                <FormControl>
                  <FormLabel fontSize="sm" color={textSecondary}>{t('Programme Name')}</FormLabel>
                  <Input value={form.name} onChange={setField('name')} bg={inputBg} borderColor={inputBorder} borderRadius="lg" />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color={textSecondary}>{t('Status')}</FormLabel>
                  <HStack>
                    <Switch
                      isChecked={form.status === 'active'}
                      onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.checked ? 'active' : 'inactive' }))}
                      colorScheme="green"
                    />
                    <Badge colorScheme={form.status === 'active' ? 'green' : 'gray'} variant="subtle" borderRadius="full" px={2.5}>
                      {form.status === 'active' ? t('Active') : t('Inactive')}
                    </Badge>
                  </HStack>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color={textSecondary}>{t('Points per Order')}</FormLabel>
                  <Input type="number" value={form.points_per_order} onChange={setField('points_per_order')} bg={inputBg} borderColor={inputBorder} borderRadius="lg" />
                  <Text fontSize="xs" color="gray.500" mt={1}>{t('Points earned for every completed order')}</Text>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color={textSecondary}>{t('Value per Point')}</FormLabel>
                  <Input type="number" step="0.0001" value={form.currency_per_point} onChange={setField('currency_per_point')} bg={inputBg} borderColor={inputBorder} borderRadius="lg" />
                  <Text fontSize="xs" color="gray.500" mt={1}>{t('Discount value applied for each point redeemed')}</Text>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color={textSecondary}>{t('Minimum Order Amount')}</FormLabel>
                  <Input type="number" step="0.01" value={form.min_order_amount} onChange={setField('min_order_amount')} bg={inputBg} borderColor={inputBorder} borderRadius="lg" placeholder={t('Optional')} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color={textSecondary}>{t('Minimum Points to Redeem')}</FormLabel>
                  <Input type="number" value={form.min_points_required} onChange={setField('min_points_required')} bg={inputBg} borderColor={inputBorder} borderRadius="lg" />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color={textSecondary}>{t('Max Redemption (% of order)')}</FormLabel>
                  <Input type="number" step="0.01" value={form.max_redeem_percent} onChange={setField('max_redeem_percent')} bg={inputBg} borderColor={inputBorder} borderRadius="lg" placeholder={t('Optional')} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color={textSecondary}>{t('Points Expiry (days)')}</FormLabel>
                  <Input type="number" value={form.points_expiry_days} onChange={setField('points_expiry_days')} bg={inputBg} borderColor={inputBorder} borderRadius="lg" placeholder={t('Optional')} />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} bg={subtleBg} p={4} borderRadius="xl">
                <HStack justify="space-between">
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color={textPrimary}>{t('Enable Earning')}</Text>
                    <Text fontSize="xs" color={textSecondary}>{t('Award points when orders are completed')}</Text>
                  </Box>
                  <Switch
                    isChecked={form.enable_earning}
                    onChange={(e) => setForm((prev) => ({ ...prev, enable_earning: e.target.checked }))}
                    colorScheme="green"
                  />
                </HStack>
                <HStack justify="space-between">
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color={textPrimary}>{t('Enable Redemption')}</Text>
                    <Text fontSize="xs" color={textSecondary}>{t('Allow customers to redeem points at POS')}</Text>
                  </Box>
                  <Switch
                    isChecked={form.enable_redemption}
                    onChange={(e) => setForm((prev) => ({ ...prev, enable_redemption: e.target.checked }))}
                    colorScheme="green"
                  />
                </HStack>
              </SimpleGrid>

              <HStack justify="flex-end">
                <Button
                  colorScheme="green"
                  onClick={handleSave}
                  isLoading={saving}
                  leftIcon={<Save size={16} />}
                  borderRadius="lg"
                  fontWeight="700"
                >
                  {t('Save Settings')}
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
