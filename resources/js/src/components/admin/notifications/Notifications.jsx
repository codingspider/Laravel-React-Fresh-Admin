import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, useToast, Text, Badge, Select, Button, HStack, Flex, FormControl, FormLabel,
  Icon, IconButton, SimpleGrid, Tooltip,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { usePermission } from '../../../context/PermissionContext';
import { Search, CheckCheck, Trash2, Bell, ShoppingBag, RotateCcw, TriangleAlert } from 'lucide-react';
import api from '../../../axios';
import {
  NOTIFICATIONS_LIST,
  NOTIFICATIONS_MARK_READ,
  NOTIFICATIONS_READ_ALL,
  NOTIFICATIONS_DELETE,
  NOTIFICATIONS_CLEAR_READ,
  NOTIFICATIONS_UNREAD_COUNT,
} from '../../../routes/apiRoutes';
import { DASHBOARD_PATH } from '../../../routes/superAdminRoutes';
import TanStackTable from '../../../TanStackTable';
import PageHeader from '../../ui/PageHeader';
import useThemeColors from '../../../hooks/useThemeColors';
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';

const TYPE_META = {
  new_order: { icon: ShoppingBag, color: 'green', label: 'New Order' },
  order_refunded: { icon: RotateCcw, color: 'orange', label: 'Refund' },
  low_stock: { icon: TriangleAlert, color: 'red', label: 'Low Stock' },
};

export default function Notifications() {
  const [data, setData] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(15);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [unread, setUnread] = useState(0);

  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { t } = useTranslation();
  const toast = useToast();
  const colors = useThemeColors();
  const { formatAmount } = useCurrencyFormatter();
  const { can } = usePermission();

  const toastRef = useRef(toast);
  const tRef = useRef(t);
  toastRef.current = toast;
  tRef.current = t;

  const fetchUnread = useCallback(async () => {
    if (!can('view_notifications')) return;
    try {
      const res = await api.get(NOTIFICATIONS_UNREAD_COUNT);
      setUnread(res.data?.data?.unread_count || 0);
    } catch {
      setUnread(0);
    }
  }, [can]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pageIndex + 1,
        per_page: pageSize,
        type: typeFilter || undefined,
        read: statusFilter === 'read' ? 1 : undefined,
        unread: statusFilter === 'unread' ? 1 : undefined,
      };
      const res = await api.get(NOTIFICATIONS_LIST, { params });
      const items = res.data?.data?.data || res.data?.data || [];
      const total = res.data?.meta?.total || res.data?.data?.total || items.length;
      setData(items);
      setPageCount(Math.ceil(total / pageSize));
      setTotalItems(total);
    } catch (err) {
      console.error('fetchData error:', err);
      toastRef.current({ title: tRef.current('Failed to load notifications'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, typeFilter, statusFilter]);

  useEffect(() => {
    const app_name = localStorage.getItem('app_name');
    document.title = `${app_name} | Notifications`;
    fetchUnread();
  }, [fetchUnread]);

  const lastParamsRef = useRef('');
  useEffect(() => {
    const key = `${pageIndex}|${typeFilter}|${statusFilter}`;
    if (lastParamsRef.current === key) return;
    lastParamsRef.current = key;
    fetchData();
  }, [fetchData, pageIndex, typeFilter, statusFilter]);

  const applyFilters = () => {
    setPageIndex(0);
  };

  const resetFilters = () => {
    setTypeFilter('');
    setStatusFilter('');
    setPageIndex(0);
  };

  const markAsRead = async (id) => {
    try {
      await api.put(NOTIFICATIONS_MARK_READ(id));
      setData((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
      toast({ title: t('Notification marked as read'), status: 'success', duration: 2000, isClosable: true });
    } catch {
      toast({ title: t('Failed to update notification'), status: 'error', duration: 3000, isClosable: true });
    }
  };

  const markAllRead = async () => {
    try {
      await api.put(NOTIFICATIONS_READ_ALL);
      setData((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
      toast({ title: t('All notifications marked as read'), status: 'success', duration: 2000, isClosable: true });
    } catch {
      toast({ title: t('Failed to update notifications'), status: 'error', duration: 3000, isClosable: true });
    }
  };

  const clearRead = async () => {
    try {
      await api.delete(NOTIFICATIONS_CLEAR_READ);
      fetchData();
      toast({ title: t('Read notifications cleared'), status: 'success', duration: 2000, isClosable: true });
    } catch {
      toast({ title: t('Failed to clear notifications'), status: 'error', duration: 3000, isClosable: true });
    }
  };

  const removeNotification = async (id) => {
    try {
      await api.delete(NOTIFICATIONS_DELETE(id));
      setData((prev) => prev.filter((n) => n.id !== id));
      toast({ title: t('Notification deleted'), status: 'success', duration: 2000, isClosable: true });
    } catch {
      toast({ title: t('Failed to delete notification'), status: 'error', duration: 3000, isClosable: true });
    }
  };

  const notificationText = (n) => {
    if (n.type === 'new_order') {
      return `${t('New order')} ${n.invoice_number || `#${n.sale_id}`} — ${formatAmount(n.total)}`;
    }
    if (n.type === 'order_refunded') {
      return `${t('Order')} ${n.invoice_number || `#${n.sale_id}`} ${t('refunded')} — ${formatAmount(n.refund_amount)}`;
    }
    if (n.type === 'low_stock') {
      return `${n.item_name} ${t('is running low')} (${n.current_stock}/${n.minimum_stock})`;
    }
    return t('You have a new notification');
  };

  const columns = [
    {
      header: '#',
      cell: ({ row }) => (
        <Text fontSize="sm" fontWeight="500" color="gray.500">{row.index + 1 + pageIndex * pageSize}</Text>
      ),
    },
    {
      header: t('Type'),
      accessorKey: 'type',
      cell: ({ getValue }) => {
        const meta = TYPE_META[getValue()] || { icon: Bell, color: 'gray' };
        return (
          <HStack spacing={2}>
            <Box bg={`${meta.color}.50`} _dark={{ bg: `${meta.color}.900` }} p={1.5} borderRadius="lg">
              <Icon as={meta.icon} boxSize={4} color={`${meta.color}.500`} />
            </Box>
            <Badge colorScheme={meta.color} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="600">
              {t(meta.label)}
            </Badge>
          </HStack>
        );
      },
    },
    {
      header: t('Message'),
      cell: ({ row }) => (
        <Text fontSize="sm" fontWeight={row.original.read ? '400' : '600'} noOfLines={2}>
          {notificationText(row.original)}
        </Text>
      ),
    },
    {
      header: t('Status'),
      accessorKey: 'read',
      cell: ({ getValue }) => (
        <Badge colorScheme={getValue() ? 'gray' : 'brand'} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="600">
          {getValue() ? t('Read') : t('Unread')}
        </Badge>
      ),
    },
    {
      header: t('Date'),
      accessorKey: 'created_at',
      cell: ({ getValue }) => (
        <Text fontSize="sm" color="gray.500">
          {getValue() ? new Date(getValue()).toLocaleString() : '-'}
        </Text>
      ),
    },
    {
      header: t('Actions'),
      id: 'actions',
      cell: ({ row }) => (
        <HStack spacing={1}>
          {!row.original.read && (
            <Tooltip label={t('Mark as read')} hasArrow>
              <IconButton
                size="sm"
                variant="ghost"
                icon={<Icon as={CheckCheck} boxSize={4} />}
                onClick={() => markAsRead(row.original.id)}
                aria-label={t('Mark as read')}
                borderRadius="lg"
              />
            </Tooltip>
          )}
          <Tooltip label={t('Delete')} hasArrow>
            <IconButton
              size="sm"
              variant="ghost"
              color="red.500"
              icon={<Icon as={Trash2} boxSize={4} />}
              onClick={() => removeNotification(row.original.id)}
              aria-label={t('Delete')}
              borderRadius="lg"
            />
          </Tooltip>
        </HStack>
      ),
    },
  ];

  const stats = [
    { label: t('Unread'), value: unread, color: 'brand.500' },
    { label: t('Total'), value: totalItems, color: 'purple.500' },
  ];

  return (
    <Box>
      <PageHeader
        title={t('Notifications')}
        subtitle={t('In-app alerts about orders, refunds and low stock')}
        breadcrumbs={[
          { label: t('Dashboard'), path: DASHBOARD_PATH },
          { label: t('Notifications'), isCurrent: true },
        ]}
      />

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        {stats.map((s) => (
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
        <Box bg={colors.bgCard} border="1px solid" borderColor={colors.borderDefault} borderRadius="xl" p={4}>
          <Text fontSize="xs" color={colors.textSecondary} mb={1}>{t('Unread')}</Text>
          <HStack spacing={2}>
            <Button size="xs" variant="outline" colorScheme="brand" leftIcon={<CheckCheck size={14} />} onClick={markAllRead} borderRadius="lg">
              {t('Mark all read')}
            </Button>
          </HStack>
        </Box>
        <Box bg={colors.bgCard} border="1px solid" borderColor={colors.borderDefault} borderRadius="xl" p={4}>
          <Text fontSize="xs" color={colors.textSecondary} mb={1}>{t('Cleanup')}</Text>
          <Button size="xs" variant="outline" colorScheme="red" leftIcon={<Trash2 size={14} />} onClick={clearRead} borderRadius="lg">
            {t('Clear read')}
          </Button>
        </Box>
      </SimpleGrid>

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
              {Object.keys(TYPE_META).map((type) => (
                <option key={type} value={type}>{t(TYPE_META[type].label)}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl maxW={{ base: '100%', lg: '200px' }}>
            <FormLabel fontSize="xs" color={colors.textSecondary}>{t('Status')}</FormLabel>
            <Select
              size="md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              bg={colors.bgInput}
              borderColor={colors.borderInput}
              borderRadius="lg"
            >
              <option value="">{t('All Status')}</option>
              <option value="unread">{t('Unread')}</option>
              <option value="read">{t('Read')}</option>
            </Select>
          </FormControl>
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
