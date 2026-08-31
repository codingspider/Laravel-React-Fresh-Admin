import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, useToast, Text, Badge, Select, Input, Button, HStack, Flex, FormControl, FormLabel, Icon,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import api from '../../../axios';
import { LOYALTY_TRANSACTIONS, LOYALTY_CUSTOMERS } from '../../../routes/apiRoutes';
import { DASHBOARD_PATH } from '../../../routes/superAdminRoutes';
import TanStackTable from '../../../TanStackTable';
import PageHeader from '../../ui/PageHeader';
import useThemeColors from '../../../hooks/useThemeColors';
import BranchFilter from '../../ui/BranchFilter';

const TYPE_STYLES = {
  earn: 'green',
  redeem: 'orange',
  adjust: 'purple',
  expire: 'red',
  restore: 'blue',
};

export default function LoyaltyTransactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const [customerFilter, setCustomerFilter] = useState(searchParams.get('customer_id') || '');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [customers, setCustomers] = useState([]);
  const [branchFilter, setBranchFilter] = useState(null);

  const { t } = useTranslation();
  const toast = useToast();
  const colors = useThemeColors();

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await api.get(LOYALTY_CUSTOMERS, { params: { per_page: 100 } });
      const items = res.data?.data?.data || res.data?.data || [];
      setCustomers(items);
    } catch {
      setCustomers([]);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pageIndex + 1,
        per_page: pageSize,
        type: typeFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        customer_id: customerFilter || undefined,
        branch_id: branchFilter || undefined,
      };
      const res = await api.get(LOYALTY_TRANSACTIONS, { params });
      const items = res.data?.data?.data || res.data?.data || [];
      const total = res.data?.meta?.total || res.data?.data?.total || items.length;
      setData(items);
      setPageCount(Math.ceil(total / pageSize));
      setTotalItems(total);
    } catch (err) {
      console.error('fetchData error:', err);
      toast({ title: t('Failed to load transactions'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, pageSize, typeFilter, dateFrom, dateTo, customerFilter, branchFilter, toast, t]);

  useEffect(() => {
    const app_name = localStorage.getItem('app_name');
    document.title = `${app_name} | Loyalty Transactions`;
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const fromParam = searchParams.get('customer_id');
    if (fromParam) {
      setCustomerFilter(fromParam);
      setPageIndex(0);
    }
  }, [searchParams]);

  const applyFilters = () => {
    setPageIndex(0);
    const params = {};
    if (customerFilter) params.customer_id = customerFilter;
    setSearchParams(params, { replace: true });
    fetchData();
  };

  const resetFilters = () => {
    setCustomerFilter('');
    setTypeFilter('');
    setDateFrom('');
    setDateTo('');
    setPageIndex(0);
    setSearchParams({}, { replace: true });
  };

  const columns = [
    {
      header: '#',
      cell: ({ row }) => (
        <Text fontSize="sm" fontWeight="500" color="gray.500">{row.index + 1 + pageIndex * pageSize}</Text>
      ),
    },
    {
      header: t('Customer'),
      accessorFn: (row) => row.customer?.name || `#${row.customer_id}`,
      cell: ({ getValue, row }) => (
        <Box>
          <Text fontSize="sm" fontWeight="600">{getValue()}</Text>
          <Text fontSize="xs" color="gray.500">{row.original.customer?.phone || '-'}</Text>
        </Box>
      ),
    },
    {
      header: t('Type'),
      accessorKey: 'type',
      cell: ({ getValue }) => (
        <Badge colorScheme={TYPE_STYLES[getValue()] || 'gray'} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="600" textTransform="capitalize">
          {t(getValue().charAt(0).toUpperCase() + getValue().slice(1))}
        </Badge>
      ),
    },
    {
      header: t('Points'),
      accessorKey: 'points',
      cell: ({ getValue }) => {
        const value = parseInt(getValue(), 10);
        return (
          <Text fontSize="sm" fontWeight="700" color={value >= 0 ? 'green.500' : 'red.500'}>
            {value >= 0 ? `+${value}` : value}
          </Text>
        );
      },
    },
    {
      header: t('Balance'),
      accessorKey: 'balance_after',
      cell: ({ getValue }) => <Text fontSize="sm">{getValue()}</Text>,
    },
    {
      header: t('Reference'),
      accessorKey: 'reference',
      cell: ({ getValue, row }) => (
        <Box>
          <Text fontSize="sm" color="gray.500">{getValue() || '-'}</Text>
          {row.original.reason && (
            <Text fontSize="xs" color="gray.400" noOfLines={1}>{row.original.reason}</Text>
          )}
        </Box>
      ),
    },
    {
      header: t('Date'),
      accessorKey: 'created_at',
      cell: ({ getValue }) => (
        <Text fontSize="sm" color="gray.500">{getValue() ? new Date(getValue()).toLocaleString() : '-'}</Text>
      ),
    },
    {
      header: t('Branch'),
      cell: ({ row }) => (
        <Text fontSize="sm">{row.original.branch?.name || '-'}</Text>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t('Loyalty Transactions')}
        subtitle={t('Immutable ledger of customer points activity')}
        breadcrumbs={[
          { label: t('Dashboard'), path: DASHBOARD_PATH },
          { label: t('Loyalty'), path: '/loyalty/settings' },
          { label: t('Transactions'), isCurrent: true },
        ]}
      />

      <Box
        bg={colors.bgCard}
        p={{ base: 4, md: 6 }}
        borderRadius="xl"
        boxShadow="card"
        border="1px solid"
        borderColor={colors.borderDefault}
      >
        <Flex direction={{ base: 'column', lg: 'row' }} gap={3} mb={4} align={{ base: 'stretch', lg: 'flex-end' }}>
          <FormControl maxW={{ base: '100%', lg: '220px' }}>
            <FormLabel fontSize="xs" color={colors.textSecondary}>{t('Customer')}</FormLabel>
            <Select
              size="md"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              bg={colors.bgInput}
              borderColor={colors.borderInput}
              borderRadius="lg"
            >
              <option value="">{t('All Customers')}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl maxW={{ base: '100%', lg: '180px' }}>
            <FormLabel fontSize="xs" color={colors.textSecondary}>{t('Type')}</FormLabel>
            <Select
              size="md"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              bg={colors.bgInput}
              borderColor={colors.borderInput}
              borderRadius="lg"
            >
              <option value="">{t('All Types')}</option>
              {['earn', 'redeem', 'adjust', 'expire', 'restore'].map((type) => (
                <option key={type} value={type}>{t(type.charAt(0).toUpperCase() + type.slice(1))}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl maxW={{ base: '100%', lg: '180px' }}>
            <FormLabel fontSize="xs" color={colors.textSecondary}>{t('From')}</FormLabel>
            <Input
              type="date"
              size="md"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              bg={colors.bgInput}
              borderColor={colors.borderInput}
              borderRadius="lg"
            />
          </FormControl>
          <FormControl maxW={{ base: '100%', lg: '180px' }}>
            <FormLabel fontSize="xs" color={colors.textSecondary}>{t('To')}</FormLabel>
            <Input
              type="date"
              size="md"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              bg={colors.bgInput}
              borderColor={colors.borderInput}
              borderRadius="lg"
            />
          </FormControl>
          <BranchFilter value={branchFilter} onChange={setBranchFilter} />

          <HStack spacing={2}>
            <Button colorScheme="brand" leftIcon={<Icon as={Search} boxSize={4} />} borderRadius="lg" onClick={applyFilters}>
              {t('Filter')}
            </Button>
            <Button variant="outline" borderRadius="lg" onClick={resetFilters}>
              {t('Reset')}
            </Button>
          </HStack>
        </Flex>

        <TanStackTable
          columns={columns}
          data={data}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          pageCount={pageCount}
          isLoading={isLoading}
          hideAddBtn="true"
          searchPlaceholder={t('Search...')}
          totalItems={totalItems}
        />
      </Box>
    </Box>
  );
}
