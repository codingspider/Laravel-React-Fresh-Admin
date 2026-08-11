import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    useToast,
    Icon,
    IconButton,
    Text,
    Badge,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    HStack,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { MoreHorizontal, Eye } from 'lucide-react';
import api from '../../../axios';
import {
    CRM_CUSTOMERS,
    CRM_CUSTOMER,
} from '../../../routes/apiRoutes';
import {
    DASHBOARD_PATH,
    CRM_DASHBOARD_PATH,
    CRM_CUSTOMER_EDIT_PATH,
    CRM_CUSTOMER_VIEW_PATH,
} from '../../../routes/superAdminRoutes';
import TanStackTable from '../../../TanStackTable';
import PageHeader from '../../ui/PageHeader';
import useThemeColors from '../../../hooks/useThemeColors';
import BranchFilter from '../../ui/BranchFilter';
import { usePermission } from '../../../context/PermissionContext';
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';

const SOURCE_COLORS = {
    manual: 'gray',
    pos: 'teal',
    web: 'blue',
    qr: 'purple',
    reservation: 'orange',
    delivery: 'green',
};

const LEAD_STATUS_COLORS = {
    new: 'blue',
    contacted: 'purple',
    qualified: 'teal',
    won: 'green',
    lost: 'red',
};

export default function CrmCustomerList() {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(15);
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [branchFilter, setBranchFilter] = useState(null);
    const { t } = useTranslation();
    const { can } = usePermission();
    const navigate = useNavigate();
    const toast = useToast();
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(CRM_CUSTOMERS, {
                params: { page: pageIndex + 1, per_page: pageSize, search: globalFilter || '', branch_id: branchFilter || '' },
            });
            const items = res.data?.data?.data || res.data?.data || [];
            const total = res.data?.meta?.total || res.data?.data?.total || items.length;
            setData(items);
            setPageCount(Math.ceil(total / pageSize));
            setTotalItems(total);
        } catch (err) {
            console.error('CrmCustomerList fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [pageIndex, globalFilter, pageSize, branchFilter]);

    useEffect(() => {
        const app_name = localStorage.getItem('app_name');
        document.title = `${app_name} | CRM Customers`;
        fetchData();
    }, [fetchData]);

    const handleSearch = (value) => {
        setGlobalFilter(value);
        setPageIndex(0);
    };

    const confirmDelete = (customer) => {
        setDeleteTarget(customer);
    };

    const submitDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await api.delete(CRM_CUSTOMER(deleteTarget.id));
            toast({ title: t('Customer deleted'), status: 'success', duration: 2500, isClosable: true });
            setDeleteTarget(null);
            fetchData();
        } catch (err) {
            toast({
                title: t('Failed to delete customer'),
                description: err.response?.data?.message || t('Something went wrong'),
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsDeleting(false);
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
            header: t('Contact'),
            accessorKey: 'email',
            cell: ({ getValue, row }) => (
                <Box>
                    <Text fontSize="sm">{getValue() || '-'}</Text>
                    {row.original.phone && <Text fontSize="xs" color="gray.500">{row.original.phone}</Text>}
                </Box>
            ),
        },
        {
            header: t('Source'),
            accessorKey: 'source',
            cell: ({ getValue }) => {
                const source = getValue() || 'manual';
                return (
                    <Badge colorScheme={SOURCE_COLORS[source] || 'gray'} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" textTransform="capitalize">
                        {source}
                    </Badge>
                );
            },
        },
        {
            header: t('Lead Status'),
            accessorKey: 'lead_status',
            cell: ({ getValue }) => {
                const status = getValue();
                if (!status) return <Text fontSize="sm" color="gray.400">-</Text>;
                return (
                    <Badge colorScheme={LEAD_STATUS_COLORS[status] || 'gray'} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" textTransform="capitalize">
                        {status}
                    </Badge>
                );
            },
        },
        {
            header: t('Segments'),
            accessorKey: 'segments',
            cell: ({ getValue }) => {
                const segments = getValue() || [];
                if (segments.length === 0) return <Text fontSize="sm" color="gray.400">-</Text>;
                return (
                    <HStack spacing={1} maxW="220px" flexWrap="wrap">
                        {segments.slice(0, 2).map((segment) => (
                            <Badge key={segment.id} variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs" colorScheme="teal">
                                {segment.name}
                            </Badge>
                        ))}
                        {segments.length > 2 && (
                            <Badge variant="outline" borderRadius="full" px={2} py={0.5} fontSize="xs">
                                +{segments.length - 2}
                            </Badge>
                        )}
                    </HStack>
                );
            },
        },
        {
            header: t('Total Spent'),
            accessorKey: 'total_spent',
            cell: ({ getValue }) => (
                <Text fontSize="sm" fontWeight="700">{formatAmount(parseFloat(getValue() || 0))}</Text>
            ),
        },
        {
            header: t('Branch'),
            cell: ({ row }) => (
                <Text fontSize="sm">{row.original.branch?.name || '-'}</Text>
            ),
        },
        {
            header: t('Actions'),
            cell: ({ row }) => (
                <Menu>
                    <MenuButton as={IconButton} icon={<Icon as={MoreHorizontal} boxSize={4} />} variant="ghost" size="sm" borderRadius="lg" aria-label={t('Actions')} />
                    <MenuList minW="180px" p={1.5}>
                        {can('view_customers') && (
                            <MenuItem
                                icon={<Icon as={Eye} boxSize={4} />}
                                borderRadius="md"
                                fontSize="sm"
                                onClick={() => navigate(CRM_CUSTOMER_VIEW_PATH(row.original.id))}
                            >
                                {t('View 360')}
                            </MenuItem>
                        )}
                        {can('update_customers') && (
                            <MenuItem
                                icon={<EditIcon boxSize={4} />}
                                borderRadius="md"
                                fontSize="sm"
                                onClick={() => navigate(CRM_CUSTOMER_EDIT_PATH(row.original.id))}
                            >
                                {t('Edit')}
                            </MenuItem>
                        )}
                        {can('delete_customers') && (
                            <MenuItem
                                icon={<DeleteIcon boxSize={4} />}
                                borderRadius="md"
                                fontSize="sm"
                                color="red.500"
                                _hover={{ bg: 'red.50', _dark: { bg: 'red.900' } }}
                                onClick={() => confirmDelete(row.original)}
                            >
                                {t('Delete')}
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
                title={t('CRM Customers')}
                subtitle={t('Customer 360 profile management')}
                breadcrumbs={[
                    { label: t('Dashboard'), path: DASHBOARD_PATH },
                    { label: t('CRM'), path: CRM_DASHBOARD_PATH },
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
                    onSearch={handleSearch}
                    hideAddBtn="true"
                    searchPlaceholder={t('Search customers...')}
                    totalItems={totalItems}
                >
                    <BranchFilter value={branchFilter} onChange={setBranchFilter} />
                </TanStackTable>
            </Box>

            <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} isCentered>
                <ModalOverlay />
                <ModalContent bg={colors.bgCard}>
                    <ModalHeader borderBottom="1px solid" borderColor={colors.borderDefault}>
                        {t('Delete Customer')}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={4} pt={5}>
                        <Text fontSize="sm" color={colors.textSecondary}>
                            {t('Are you sure you want to delete this customer? This action cannot be undone.')}
                        </Text>
                        {deleteTarget && (
                            <Text fontSize="sm" fontWeight="600" mt={2}>
                                {deleteTarget.name}
                            </Text>
                        )}
                    </ModalBody>
                    <ModalFooter borderTop="1px solid" borderColor={colors.borderDefault}>
                        <Button variant="ghost" mr={3} onClick={() => setDeleteTarget(null)} borderRadius="lg">{t('Cancel')}</Button>
                        <Button colorScheme="red" onClick={submitDelete} isLoading={isDeleting} borderRadius="lg" fontWeight="700">
                            {t('Delete')}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
