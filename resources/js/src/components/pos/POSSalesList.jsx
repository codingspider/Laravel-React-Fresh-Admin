import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, HStack, VStack, Text, Badge, useToast, Spinner, Center,
  Input, Select, IconButton, Tooltip, Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye } from 'react-icons/fi';
import api from '../../axios';
import PageHeader from '../ui/PageHeader';

const STATUS_COLORS = {
  pending: 'yellow',
  confirmed: 'blue',
  preparing: 'orange',
  ready: 'cyan',
  served: 'purple',
  completed: 'green',
  cancelled: 'red',
};

const PAYMENT_COLORS = {
  unpaid: 'red',
  partial: 'orange',
  paid: 'green',
};

export default function POSSalesList() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = { per_page: 15, page };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.payment_status = paymentFilter;

      const res = await api.get('/v1/pos/sales', { params });
      setSales(res.data.data || []);
      setMeta(res.data.meta || {});
    } catch {
      toast({ title: t('failed_to_load_sales'), status: 'error', duration: 3000, position: 'bottom-right' });
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, paymentFilter, t, toast]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  return (
    <Box>
      <PageHeader
        title={t('sales_history')}
        subtitle={t('view_all_pos_sales')}
        breadcrumbs={[{ label: t('dashboard'), link: '/dashboard' }, { label: t('pos') }, { label: t('sales_history') }]}
      />

      <Box bg={bg} borderRadius="xl" border="1px solid" borderColor={borderColor} p={6}>
        <Flex mb={4} gap={4} direction={{ base: 'column', md: 'row' }} align="center">
          <HStack maxW="300px">
            <Input
              placeholder={t('search_invoice')}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </HStack>
          <Select
            placeholder={t('all_statuses')}
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            maxW="180px"
          >
            <option value="pending">{t('pending')}</option>
            <option value="confirmed">{t('confirmed')}</option>
            <option value="preparing">{t('preparing')}</option>
            <option value="completed">{t('completed')}</option>
            <option value="cancelled">{t('cancelled')}</option>
          </Select>
          <Select
            placeholder={t('all_payments')}
            value={paymentFilter}
            onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}
            maxW="180px"
          >
            <option value="unpaid">{t('unpaid')}</option>
            <option value="partial">{t('partial')}</option>
            <option value="paid">{t('paid')}</option>
          </Select>
        </Flex>

        {loading ? (
          <Center py={10}><Spinner size="lg" color="teal.500" /></Center>
        ) : sales.length === 0 ? (
          <Center py={10}><Text color="gray.500">{t('no_sales_found')}</Text></Center>
        ) : (
          <Box overflowX="auto">
            <Box as="table" w="100%" fontSize="sm">
              <Box as="thead">
                <Box as="tr" borderBottom="1px solid" borderColor={borderColor}>
                  {[t('invoice'), t('order_type'), t('status'), t('payment'), t('total'), t('paid'), t('date')].map((h) => (
                    <Box as="th" key={h} px={4} py={3} textAlign="left" fontWeight="600" color="gray.500">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {sales.map(sale => (
                  <Box as="tr" key={sale.id} borderBottom="1px solid" borderColor={borderColor} _hover={{ bg: hoverBg }}>
                    <Box as="td" px={4} py={3} fontWeight="bold">{sale.invoice_number}</Box>
                    <Box as="td" px={4} py={3}>
                      <Badge colorScheme={sale.order_type === 'dine_in' ? 'blue' : sale.order_type === 'takeaway' ? 'green' : 'purple'}>
                        {t(sale.order_type?.replace('_', ' '))}
                      </Badge>
                    </Box>
                    <Box as="td" px={4} py={3}><Badge colorScheme={STATUS_COLORS[sale.status]}>{t(sale.status)}</Badge></Box>
                    <Box as="td" px={4} py={3}><Badge colorScheme={PAYMENT_COLORS[sale.payment_status]}>{t(sale.payment_status)}</Badge></Box>
                    <Box as="td" px={4} py={3} fontWeight="bold">${parseFloat(sale.total || 0).toFixed(2)}</Box>
                    <Box as="td" px={4} py={3}>${parseFloat(sale.amount_paid || 0).toFixed(2)}</Box>
                    <Box as="td" px={4} py={3}>{new Date(sale.created_at).toLocaleDateString()}</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {meta.last_page > 1 && (
          <Flex mt={4} justify="center" gap={2}>
            <Button size="sm" isDisabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t('previous')}</Button>
            <Text alignSelf="center" fontSize="sm" mx={2}>{t('page')} {page} {t('of')} {meta.last_page}</Text>
            <Button size="sm" isDisabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>{t('next')}</Button>
          </Flex>
        )}
      </Box>
    </Box>
  );
}
