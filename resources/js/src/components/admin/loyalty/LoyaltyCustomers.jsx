import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, useToast, Icon, IconButton, Text, Badge, Menu, MenuButton, MenuList, MenuItem,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Button, Input, FormControl, FormLabel, useDisclosure, VStack, HStack
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { MoreHorizontal, Plus, Minus, History } from 'lucide-react';
import api from '../../../axios';
import {
  LOYALTY_ADJUST_POINTS,
  LOYALTY_CUSTOMERS,
} from '../../../routes/apiRoutes';
import { DASHBOARD_PATH, LOYALTY_TRANSACTIONS_PATH } from '../../../routes/superAdminRoutes';
import TanStackTable from '../../../TanStackTable';
import PageHeader from '../../ui/PageHeader';
import useThemeColors from '../../../hooks/useThemeColors';
import BranchFilter from '../../ui/BranchFilter';
import { usePermission } from '../../../context/PermissionContext';

export default function LoyaltyCustomers() {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(15);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const { t } = useTranslation();
  const { can } = usePermission();
  const navigate = useNavigate();
  const toast = useToast();
  const colors = useThemeColors();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [adjustCustomer, setAdjustCustomer] = useState(null);
  const [adjustPoints, setAdjustPoints] = useState(0);
  const [branchFilter, setBranchFilter] = useState(null);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(LOYALTY_CUSTOMERS, {
        params: { page: pageIndex + 1, per_page: pageSize, search: globalFilter || '', branch_id: branchFilter || '' },
      });
      const items = res.data?.data?.data || res.data?.data || [];
      const total = res.data?.meta?.total || res.data?.data?.total || items.length;
      setData(items);
      setPageCount(Math.ceil(total / pageSize));
      setTotalItems(total);
    } catch (err) {
      console.error('fetchData error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, globalFilter, pageSize, branchFilter]);

  useEffect(() => {
    const app_name = localStorage.getItem('app_name');
    document.title = `${app_name} | Loyalty Customers`;
    fetchData();
  }, [fetchData]);

  const openAdjust = (customer, initial = 0) => {
    setAdjustCustomer(customer);
    setAdjustPoints(initial);
    setAdjustReason('');
    onOpen();
  };

  const submitAdjust = async () => {
    if (!adjustCustomer || !adjustReason.trim()) {
      toast({ title: t('Please provide a reason'), status: 'warning', duration: 2500, isClosable: true });
      return;
    }
    if (parseInt(adjustPoints, 10) === 0) {
      toast({ title: t('Points cannot be zero'), status: 'warning', duration: 2500, isClosable: true });
      return;
    }
    setAdjusting(true);
    try {
      await api.post(LOYALTY_ADJUST_POINTS, {
        customer_id: adjustCustomer.id,
        points: parseInt(adjustPoints, 10),
        reason: adjustReason.trim(),
      });
      toast({ title: t('Points adjusted successfully'), status: 'success', duration: 2500, isClosable: true });
      onClose();
      fetchData();
    } catch (err) {
      toast({
        title: t('Failed to adjust points'),
        description: err.response?.data?.message || t('Something went wrong'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setAdjusting(false);
    }
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
      accessorKey: 'name',
      cell: ({ getValue, row }) => (
        <Box>
          <Text fontSize="sm" fontWeight="600">{getValue() || '-'}</Text>
          <Text fontSize="xs" color="gray.500">{row.original.phone || row.original.email || '-'}</Text>
        </Box>
      ),
    },
    {
      header: t('Points Balance'),
      accessorKey: 'points_balance',
      cell: ({ getValue }) => (
        <Badge colorScheme="brand" variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="sm" fontWeight="700">
          {getValue() ?? 0}
        </Badge>
      ),
    },
    {
      header: t('Lifetime Points'),
      accessorKey: 'lifetime_points',
      cell: ({ getValue }) => <Text fontSize="sm">{getValue() ?? 0}</Text>,
    },
    {
      header: t('Redeemed'),
      accessorKey: 'total_redeemed',
      cell: ({ getValue }) => <Text fontSize="sm">{getValue() ?? 0}</Text>,
    },
    {
      header: t('Last Earned'),
      accessorKey: 'last_earned_at',
      cell: ({ getValue }) => (
        <Text fontSize="sm" color="gray.500">{getValue() ? new Date(getValue()).toLocaleDateString() : '-'}</Text>
      ),
    },
    {
      header: t('Branch'),
      cell: ({ row }) => (
        <Text fontSize="sm">{row.original.branch_name || '-'}</Text>
      ),
    },
    {
      header: t('Actions'),
      cell: ({ row }) => (
        <Menu>
          <MenuButton as={IconButton} icon={<Icon as={MoreHorizontal} boxSize={4} />} variant="ghost" size="sm" borderRadius="lg" aria-label={t('Actions')} />
          <MenuList minW="180px" p={1.5}>
            {can('view_loyalty_transactions') && (
              <MenuItem
                icon={<Icon as={History} boxSize={4} />}
                borderRadius="md"
                fontSize="sm"
                onClick={() => navigate(`${LOYALTY_TRANSACTIONS_PATH}?customer_id=${row.original.id}`)}
              >
                {t('View Transactions')}
              </MenuItem>
            )}
            {can('manage_loyalty_points') && (
              <MenuItem
                icon={<Icon as={EditIcon} boxSize={4} />}
                borderRadius="md"
                fontSize="sm"
                onClick={() => openAdjust(row.original)}
              >
                {t('Adjust Points')}
              </MenuItem>
            )}
            {can('manage_loyalty_points') && (
              <MenuItem
                icon={<Icon as={DeleteIcon} boxSize={4} />}
                borderRadius="md"
                fontSize="sm"
                color="red.500"
                _hover={{ bg: 'red.50', _dark: { bg: 'red.900' } }}
                onClick={() => openAdjust(row.original, -10)}
              >
                {t('Deduct Points')}
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t('Loyalty Customers')}
        subtitle={t('Track and manage customer loyalty points')}
        breadcrumbs={[
          { label: t('Dashboard'), path: DASHBOARD_PATH },
          { label: t('Loyalty'), path: '/loyalty/settings' },
          { label: t('Customers'), isCurrent: true },
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
        <TanStackTable
          columns={columns}
          data={data}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          pageCount={pageCount}
          isLoading={isLoading}
          hideAddBtn="true"
          searchPlaceholder={t('Search customers...')}
          totalItems={totalItems}
        >
          <BranchFilter value={branchFilter} onChange={setBranchFilter} />
        </TanStackTable>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg={colors.bgCard}>
          <ModalHeader borderBottom="1px solid" borderColor={colors.borderDefault}>
            {t('Adjust Points')}
            {adjustCustomer && (
              <Text fontSize="sm" fontWeight="500" color="gray.500" mt={1}>
                {adjustCustomer.name} · {adjustCustomer.phone || '-'}
              </Text>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            <VStack spacing={4} pt={2}>
              <FormControl>
                <FormLabel fontSize="sm" color={colors.textSecondary}>{t('Points')}</FormLabel>
                <Input
                  type="number"
                  value={adjustPoints}
                  onChange={(e) => setAdjustPoints(e.target.value)}
                  bg={colors.bgInput}
                  borderColor={colors.borderInput}
                  borderRadius="lg"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {t('Use a positive value to add points, negative to deduct')}
                </Text>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color={colors.textSecondary}>{t('Reason')}</FormLabel>
                <Input
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  bg={colors.bgInput}
                  borderColor={colors.borderInput}
                  borderRadius="lg"
                  placeholder={t('e.g. Compensation, correction, bonus')}
                />
              </FormControl>
              <HStack w="100%" spacing={2} justify="flex-start">
                <Button
                  size="sm"
                  leftIcon={<Plus size={14} />}
                  colorScheme="green"
                  variant="outline"
                  borderRadius="lg"
                  onClick={() => setAdjustPoints(String((parseInt(adjustPoints, 10) || 0) + 10))}
                >
                  +10
                </Button>
                <Button
                  size="sm"
                  leftIcon={<Minus size={14} />}
                  colorScheme="red"
                  variant="outline"
                  borderRadius="lg"
                  onClick={() => setAdjustPoints(String((parseInt(adjustPoints, 10) || 0) - 10))}
                >
                  -10
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={colors.borderDefault}>
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="lg">{t('Cancel')}</Button>
            <Button colorScheme="green" onClick={submitAdjust} isLoading={adjusting} borderRadius="lg" fontWeight="700">
              {t('Save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
