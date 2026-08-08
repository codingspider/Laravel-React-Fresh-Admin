import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Text, Badge, Select, Button, HStack, Flex, FormControl, FormLabel,
  Icon, Input, InputGroup, InputLeftElement, SimpleGrid, Stack,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Search, History, RotateCcw } from 'lucide-react';
import api from '../../../axios';
import { ACTIVITY_LOG_LIST } from '../../../routes/apiRoutes';
import { DASHBOARD_PATH } from '../../../routes/superAdminRoutes';
import TanStackTable from '../../../TanStackTable';
import PageHeader from '../../ui/PageHeader';
import useThemeColors from '../../../hooks/useThemeColors';

const ACTION_META = {
  create: { color: 'green', label: 'Create' },
  update: { color: 'blue', label: 'Update' },
  delete: { color: 'red', label: 'Delete' },
};

const METHOD_META = {
  POST: { color: 'green' },
  PUT: { color: 'blue' },
  PATCH: { color: 'yellow' },
  DELETE: { color: 'red' },
};

export default function ActivityLogList() {
  const [data, setData] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(15);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { t } = useTranslation();
  const colors = useThemeColors();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pageIndex + 1,
        per_page: pageSize,
        search: search || undefined,
        action: actionFilter || undefined,
        method: methodFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      };
      const res = await api.get(ACTIVITY_LOG_LIST, { params });
      const items = res.data?.data?.data || res.data?.data || [];
      const total = res.data?.meta?.total || res.data?.data?.total || items.length;
      setData(items);
      setPageCount(Math.ceil(total / pageSize));
      setTotalItems(total);
    } catch (err) {
      console.error('ActivityLogList fetchData error:', err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, search, actionFilter, methodFilter, dateFrom, dateTo]);

  useEffect(() => {
    const app_name = localStorage.getItem('app_name');
    document.title = `${app_name} | ${t('Activity Logs')}`;
  }, [t]);

  const lastParamsRef = useRef('');
  useEffect(() => {
    const key = `${pageIndex}|${search}|${actionFilter}|${methodFilter}|${dateFrom}|${dateTo}`;
    if (lastParamsRef.current === key) return;
    lastParamsRef.current = key;
    fetchData();
  }, [fetchData, pageIndex, search, actionFilter, methodFilter, dateFrom, dateTo]);

  const applyFilters = () => {
    setPageIndex(0);
  };

  const resetFilters = () => {
    setSearch('');
    setActionFilter('');
    setMethodFilter('');
    setDateFrom('');
    setDateTo('');
    setPageIndex(0);
  };

  const statusColor = (status) => {
    if (status >= 200 && status < 300) return 'green';
    if (status >= 400 && status < 500) return 'orange';
    if (status >= 500) return 'red';
    return 'gray';
  };

  const columns = [
    {
      header: '#',
      cell: ({ row }) => (
        <Text fontSize="sm" fontWeight="500" color="gray.500">{row.index + 1 + pageIndex * pageSize}</Text>
      ),
    },
    {
      header: t('User'),
      accessorKey: 'user',
      cell: ({ getValue }) => {
        const user = getValue();
        return (
          <Box minW="160px">
            <Text fontSize="sm" fontWeight="600" noOfLines={1}>{user?.name || t('System')}</Text>
            {user?.email && (
              <Text fontSize="xs" color="gray.500" noOfLines={1}>{user.email}</Text>
            )}
          </Box>
        );
      },
    },
    {
      header: t('Description'),
      accessorKey: 'description',
      cell: ({ getValue, row }) => (
        <Box minW="220px">
          <Text fontSize="sm" fontWeight="500" noOfLines={1}>{getValue() || '-'}</Text>
          <Text fontSize="xs" color="gray.500" noOfLines={1}>{row.original.path || ''}</Text>
        </Box>
      ),
    },
    {
      header: t('Action'),
      accessorKey: 'action',
      cell: ({ getValue }) => {
        const meta = ACTION_META[getValue()] || { color: 'gray', label: getValue() };
        return (
          <Badge colorScheme={meta.color} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="600">
            {t(meta.label)}
          </Badge>
        );
      },
    },
    {
      header: t('Method'),
      accessorKey: 'method',
      cell: ({ getValue }) => {
        const meta = METHOD_META[getValue()] || { color: 'gray' };
        return (
          <Badge colorScheme={meta.color} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="600">
            {getValue() || '-'}
          </Badge>
        );
      },
    },
    {
      header: t('Status'),
      accessorKey: 'response_status',
      cell: ({ getValue }) => (
        <Badge colorScheme={statusColor(getValue())} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="600">
          {getValue() ?? '-'}
        </Badge>
      ),
    },
    {
      header: t('IP Address'),
      accessorKey: 'ip_address',
      cell: ({ getValue }) => (
        <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">{getValue() || '-'}</Text>
      ),
    },
    {
      header: t('Date'),
      accessorKey: 'created_at',
      cell: ({ getValue }) => (
        <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
          {getValue() ? new Date(getValue()).toLocaleString() : '-'}
        </Text>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t('Activity Logs')}
        subtitle={t('Record of actions performed across the restaurant')}
        breadcrumbs={[
          { label: t('Dashboard'), path: DASHBOARD_PATH },
          { label: t('Activity Logs'), isCurrent: true },
        ]}
      />

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4} mb={6}>
        {[
          { label: t('Total Logs'), value: totalItems, color: 'brand.500' },
        ].map((s) => (
          <Box
            key={s.label}
            bg={colors.bgCard}
            border="1px solid"
            borderColor={colors.borderDefault}
            borderRadius="xl"
            p={4}
          >
            <Text fontSize="xs" color={colors.textSecondary} mb={1}>{s.label}</Text>
            <Text fontSize="2xl" fontWeight="700" color={s.color}>{s.value}</Text>
          </Box>
        ))}
      </SimpleGrid>

      <Box
        bg={colors.bgCard}
        p={{ base: 4, md: 6 }}
        borderRadius="xl"
        boxShadow="card"
        border="1px solid"
        borderColor={colors.borderDefault}
      >
        <Stack direction={{ base: 'column', lg: 'row' }} gap={3} mb={4} align={{ base: 'stretch', lg: 'flex-end' }}>
          <FormControl maxW={{ base: '100%', lg: '240px' }}>
            <FormLabel fontSize="xs" color={colors.textSecondary}>{t('Search')}</FormLabel>
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none">
                <Icon as={Search} color="gray.400" boxSize={4} />
              </InputLeftElement>
              <Input
                placeholder={t('Search by user, path or IP...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                bg={colors.bgInput}
                borderColor={colors.borderInput}
                borderRadius="lg"
              />
            </InputGroup>
          </FormControl>
          <FormControl maxW={{ base: '100%', lg: '180px' }}>
            <FormLabel fontSize="xs" color={colors.textSecondary}>{t('Action')}</FormLabel>
            <Select
              size="md"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              bg={colors.bgInput}
              borderColor={colors.borderInput}
              borderRadius="lg"
            >
              <option value="">{t('All Actions')}</option>
              {Object.keys(ACTION_META).map((action) => (
                <option key={action} value={action}>{t(ACTION_META[action].label)}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl maxW={{ base: '100%', lg: '160px' }}>
            <FormLabel fontSize="xs" color={colors.textSecondary}>{t('Method')}</FormLabel>
            <Select
              size="md"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              bg={colors.bgInput}
              borderColor={colors.borderInput}
              borderRadius="lg"
            >
              <option value="">{t('All Methods')}</option>
              {Object.keys(METHOD_META).map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl maxW={{ base: '100%', lg: '180px' }}>
            <FormLabel fontSize="xs" color={colors.textSecondary}>{t('From Date')}</FormLabel>
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
            <FormLabel fontSize="xs" color={colors.textSecondary}>{t('To Date')}</FormLabel>
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
          <HStack spacing={2} pb={0.5}>
            <Button colorScheme="brand" leftIcon={<Icon as={History} boxSize={4} />} borderRadius="lg" onClick={applyFilters}>
              {t('Filter')}
            </Button>
            <Button variant="outline" leftIcon={<Icon as={RotateCcw} boxSize={4} />} borderRadius="lg" onClick={resetFilters}>
              {t('Reset')}
            </Button>
          </HStack>
        </Stack>

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
