import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, SimpleGrid, VStack, HStack, Text, Badge, useToast, Menu, MenuButton, MenuList, MenuItem,
  Spinner, Center, Divider, Table, Thead, Tbody, Tr, Th, Td, useDisclosure, MenuDivider,
} from '@chakra-ui/react';
import { ArrowLeft, ReceiptText, Printer, FileText, CreditCard, ChevronDown, ChefHat } from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import api from '../../axios';
import useThemeColors from '../../hooks/useThemeColors';
import { useCurrencyFormatter } from '../../useCurrencyFormatter';
import { GET_POS_SALE } from '../../routes/apiRoutes';
import ReceiptPrint from './partials/ReceiptPrint';
import KOTPrint from './partials/KOTPrint';
import MakePaymentModal from './partials/MakePaymentModal';

const statusColors = {
  pending: 'yellow', confirmed: 'blue', preparing: 'orange',
  completed: 'green', cancelled: 'red', refunded: 'purple',
};
const paymentColors = {
  unpaid: 'red', partial: 'yellow', paid: 'green', refunded: 'purple',
};
const orderTypeColors = { dine_in: 'blue', takeaway: 'orange', delivery: 'purple' };

export default function POSSalesView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const colors = useThemeColors();
  const { formatAmount } = useCurrencyFormatter();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const a4PrintRef = useRef(null);
  const thermalPrintRef = useRef(null);
  const kotPrintRef = useRef(null);
  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure();

  const fetchSale = () => {
    setLoading(true);
    api.get(GET_POS_SALE(id))
      .then((res) => { setSale(res.data.data); })
      .catch(() => { toast({ title: t('Error loading sale'), status: 'error' }); })
      .finally(() => { setLoading(false); });
  };

  useEffect(() => { fetchSale(); }, [id, toast, t]);

  if (loading) return <Center py={10}><Spinner size="lg" color="brand.500" /></Center>;
  if (!sale) return <Center py={10}><Text>{t('Sale not found')}</Text></Center>;

  const due = Math.max(0, (parseFloat(sale.total) || 0) - (parseFloat(sale.amount_paid) || 0));
  const canPay = (sale.payment_status === 'unpaid' || sale.payment_status === 'partial') && !['cancelled', 'refunded'].includes(sale.status);

  return (
    <Box>
      <PageHeader
        title={`${t('Sale')} #${sale.invoice_number || sale.id}`}
        subtitle={t('Sale Details')}
        breadcrumbs={[
          { label: t('Dashboard'), link: '/dashboard' },
          { label: t('POS Sales'), link: '/pos/sales' },
          { label: `#${sale.invoice_number || sale.id}` },
        ]}
      >
        <HStack spacing={2}>
          {canPay && (
            <Button leftIcon={<CreditCard size={16} />} colorScheme="green" onClick={onPaymentOpen} borderRadius="lg" fontWeight="600">
              {t('Make Payment')}
            </Button>
          )}
          <Menu>
            <MenuButton as={Button} leftIcon={<Printer size={16} />} rightIcon={<ChevronDown size={14} />} variant="outline" borderRadius="lg" fontWeight="600">
              {t('Print')}
            </MenuButton>
            <MenuList minW="200px">
              <MenuItem icon={<FileText size={16} />} onClick={() => a4PrintRef.current?.()}>
                {t('Invoice (A4)')}
              </MenuItem>
              <MenuItem icon={<Printer size={16} />} onClick={() => thermalPrintRef.current?.()}>
                {t('Receipt (80mm Thermal)')}
              </MenuItem>
              <MenuDivider />
              <MenuItem icon={<ChefHat size={16} />} onClick={() => kotPrintRef.current?.()}>
                {t('KOT (Kitchen Order Ticket)')}
              </MenuItem>
            </MenuList>
          </Menu>
          <Button leftIcon={<ArrowLeft size={16} />} variant="ghost" onClick={() => navigate('/pos/sales')} borderRadius="lg">
            {t('Back')}
          </Button>
        </HStack>
      </PageHeader>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        <Box bg={colors.bgCard} borderRadius="xl" border="1px solid" borderColor={colors.borderDefault} p={6}>
          <HStack mb={4}>
            <ReceiptText size={20} color="brand.500" />
            <Text fontWeight="600" fontSize="lg">{t('Order Info')}</Text>
          </HStack>
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm" color={colors.textSecondary}>{t('Invoice')}</Text>
              <Text fontSize="sm" fontWeight="600" fontFamily="mono">{sale.invoice_number || '-'}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color={colors.textSecondary}>{t('Branch')}</Text>
              <Text fontSize="sm" fontWeight="600">{sale.branch?.name || '-'}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color={colors.textSecondary}>{t('Order Type')}</Text>
              <Badge colorScheme={orderTypeColors[sale.order_type] || 'gray'} variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs" fontWeight="600" textTransform="capitalize">
                {t(sale.order_type || 'unknown')}
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color={colors.textSecondary}>{t('Status')}</Text>
              <Badge colorScheme={statusColors[sale.status] || 'gray'} variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs" fontWeight="600" textTransform="capitalize">
                {t(sale.status)}
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color={colors.textSecondary}>{t('Payment Status')}</Text>
              <Badge colorScheme={paymentColors[sale.payment_status] || 'gray'} variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs" fontWeight="600" textTransform="capitalize">
                {t(sale.payment_status)}
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color={colors.textSecondary}>{t('Table')}</Text>
              <Text fontSize="sm" fontWeight="600">{sale.table?.name || '-'}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color={colors.textSecondary}>{t('Created By')}</Text>
              <Text fontSize="sm" fontWeight="600">{sale.user?.name || '-'}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color={colors.textSecondary}>{t('Waiter')}</Text>
              <Text fontSize="sm" fontWeight="600">{sale.user?.name || '-'}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color={colors.textSecondary}>{t('Date')}</Text>
              <Text fontSize="sm">{sale.created_at ? new Date(sale.created_at).toLocaleString() : '-'}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color={colors.textSecondary}>{t('Updated At')}</Text>
              <Text fontSize="sm">{sale.updated_at ? new Date(sale.updated_at).toLocaleString() : '-'}</Text>
            </HStack>
            {sale.customer && (
              <Box bg={colors.bgCard} borderRadius="xl" border="1px solid" borderColor={colors.borderDefault} p={4}>
                <HStack mb={2}>
                  <Text fontWeight="600" fontSize="sm">{t('Customer Info')}</Text>
                </HStack>
                <VStack spacing={1} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="xs" color={colors.textSecondary}>{t('Name')}</Text>
                    <Text fontSize="xs" fontWeight="600">{sale.customer.name || '-'}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="xs" color={colors.textSecondary}>{t('Phone')}</Text>
                    <Text fontSize="xs" fontWeight="600">{sale.customer.phone || '-'}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="xs" color={colors.textSecondary}>{t('Address')}</Text>
                    <Text fontSize="xs" fontWeight="600">{sale.customer.address || '-'}</Text>
                  </HStack>
                </VStack>
              </Box>
            )}
          </VStack>
        </Box>

        <Box bg={colors.bgCard} borderRadius="xl" border="1px solid" borderColor={colors.borderDefault} p={6} gridColumn={{ lg: 'span 2' }}>
          <Text fontWeight="600" fontSize="lg" mb={4}>{t('Products')}</Text>
          <Box overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th fontSize="xs" fontWeight="600" color={colors.textSecondary}>#</Th>
                  <Th fontSize="xs" fontWeight="600" color={colors.textSecondary}>{t('Item')}</Th>
                  <Th fontSize="xs" fontWeight="600" color={colors.textSecondary} textAlign="center">{t('Qty')}</Th>
                  <Th fontSize="xs" fontWeight="600" color={colors.textSecondary} textAlign="right">{t('Price')}</Th>
                  <Th fontSize="xs" fontWeight="600" color={colors.textSecondary} textAlign="right">{t('Total')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(sale.items || []).map((item, idx) => (
                  <Tr key={item.id}>
                    <Td fontSize="sm" color={colors.textSecondary}>{idx + 1}</Td>
                    <Td fontSize="sm" fontWeight="600">
                      {item.item_name}
                      {item.modifiers && item.modifiers.length > 0 && (
                        <Text fontSize="xs" color={colors.textMuted}>
                          {item.modifiers.map(m => m.name).join(', ')}
                        </Text>
                      )}
                    </Td>
                    <Td fontSize="sm" textAlign="center">{item.quantity}</Td>
                    <Td fontSize="sm" textAlign="right">{formatAmount(item.unit_price)}</Td>
                    <Td fontSize="sm" fontWeight="600" textAlign="right" color="brand.500">{formatAmount(item.total)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          <Divider my={4} />

          <VStack spacing={2} align="stretch" maxW="300px" ml="auto">
            <HStack justify="space-between">
              <Text fontSize="sm" color={colors.textSecondary}>{t('Subtotal')}</Text>
              <Text fontSize="sm" fontWeight="600">{formatAmount(sale.subtotal)}</Text>
            </HStack>
            {parseFloat(sale.discount_amount) > 0 && (
              <HStack justify="space-between">
                <Text fontSize="sm" color={colors.textSecondary}>{t('Discount')}</Text>
                <Text fontSize="sm" fontWeight="600" color="red.500">-{formatAmount(sale.discount_amount)}</Text>
              </HStack>
            )}
            {parseFloat(sale.tax_amount) > 0 && (
              <HStack justify="space-between">
                <Text fontSize="sm" color={colors.textSecondary}>{t('VAT')}</Text>
                <Text fontSize="sm" fontWeight="600">+{formatAmount(sale.tax_amount)}</Text>
              </HStack>
            )}
            {parseFloat(sale.delivery_charge) > 0 && (
              <HStack justify="space-between">
                <Text fontSize="sm" color={colors.textSecondary}>{t('Delivery')}</Text>
                <Text fontSize="sm" fontWeight="600">+{formatAmount(sale.delivery_charge)}</Text>
              </HStack>
            )}
            {sale.coupon_code && (
              <HStack justify="space-between">
                <Text fontSize="sm" color={colors.textSecondary}>{t('Coupon')}</Text>
                <Text fontSize="sm" fontWeight="600" color="green.500">{sale.coupon_code}</Text>
              </HStack>
            )}
            {parseFloat(sale.tip_amount) > 0 && (
              <HStack justify="space-between">
                <Text fontSize="sm" color={colors.textSecondary}>{t('Tip')}</Text>
                <Text fontSize="sm" fontWeight="600">+{formatAmount(sale.tip_amount)}</Text>
              </HStack>
            )}
            <Divider />
            <HStack justify="space-between">
              <Text fontSize="md" fontWeight="700">{t('Due')}</Text>
              <Text fontSize="md" fontWeight="700" color="brand.500">{formatAmount(due)}</Text>
            </HStack>
          </VStack>

          {(sale.notes || sale.kitchen_notes) && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={6}>
              {sale.notes && (
                <Box bg={colors.bgCard} borderRadius="xl" border="1px solid" borderColor={colors.borderDefault} p={4}>
                  <Text fontWeight="600" mb={2}>{t('Order Notes')}</Text>
                  <Text fontSize="sm" color={colors.textSecondary}>{sale.notes}</Text>
                </Box>
              )}
              {sale.kitchen_notes && (
                <Box bg={colors.bgCard} borderRadius="xl" border="1px solid" borderColor={colors.borderDefault} p={4}>
                  <Text fontWeight="600" mb={2}>{t('Kitchen Notes')}</Text>
                  <Text fontSize="sm" color={colors.textSecondary}>{sale.kitchen_notes}</Text>
                </Box>
              )}
            </SimpleGrid>
          )}

          {(sale.payments && sale.payments.length > 0) && (
            <Box bg={colors.bgCard} borderRadius="xl" border="1px solid" borderColor={colors.borderDefault} p={6} mt={6}>
              <Text fontWeight="600" fontSize="lg" mb={4}>{t('Payments')}</Text>
              <Box overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th fontSize="xs" fontWeight="600" color={colors.textSecondary}>#</Th>
                      <Th fontSize="xs" fontWeight="600" color={colors.textSecondary}>{t('Method')}</Th>
                      <Th fontSize="xs" fontWeight="600" color={colors.textSecondary}>{t('Reference')}</Th>
                      <Th fontSize="xs" fontWeight="600" color={colors.textSecondary} textAlign="right">{t('Amount')}</Th>
                      <Th fontSize="xs" fontWeight="600" color={colors.textSecondary}>{t('Date')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sale.payments.map((p, idx) => (
                      <Tr key={p.id}>
                        <Td fontSize="sm" color={colors.textSecondary}>{idx + 1}</Td>
                        <Td fontSize="sm" fontWeight="600" textTransform="capitalize">{p.payment_method}</Td>
                        <Td fontSize="sm" color={colors.textSecondary}>{p.reference_number || '-'}</Td>
                        <Td fontSize="sm" fontWeight="600" textAlign="right" color="green.500">{formatAmount(p.amount)}</Td>
                        <Td fontSize="sm">{p.created_at ? new Date(p.created_at).toLocaleString() : '-'}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          )}
        </Box>
      </SimpleGrid>

      <ReceiptPrint sale={sale} type="a4" triggerRef={a4PrintRef} />
      <ReceiptPrint sale={sale} type="thermal" triggerRef={thermalPrintRef} />
      <KOTPrint sale={sale} triggerRef={kotPrintRef} />

      <MakePaymentModal
        isOpen={isPaymentOpen}
        onClose={onPaymentClose}
        sale={sale}
        onPaymentSuccess={fetchSale}
      />
    </Box>
  );
}