import React, { useEffect, useState, useCallback } from 'react';
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
    Input,
    Textarea,
    FormControl,
    FormLabel,
    VStack,
    HStack,
    Checkbox,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { MoreHorizontal, Users, Plus } from 'lucide-react';
import api from '../../../axios';
import {
    CRM_SEGMENTS,
    CRM_SEGMENT,
    CRM_SEGMENT_CUSTOMERS,
    CRM_CUSTOMERS,
} from '../../../routes/apiRoutes';
import {
    DASHBOARD_PATH,
    CRM_DASHBOARD_PATH,
} from '../../../routes/superAdminRoutes';
import TanStackTable from '../../../TanStackTable';
import PageHeader from '../../ui/PageHeader';
import useThemeColors from '../../../hooks/useThemeColors';
import { usePermission } from '../../../context/PermissionContext';

const EMPTY_FORM = { name: '', description: '', color: '#0d9488' };

export default function CrmSegmentList() {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(15);
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const { t } = useTranslation();
    const { can } = usePermission();
    const toast = useToast();
    const colors = useThemeColors();

    const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'assign' | null
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingSegment, setEditingSegment] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [customerOptions, setCustomerOptions] = useState([]);
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(CRM_SEGMENTS, {
                params: { page: pageIndex + 1, per_page: pageSize, search: globalFilter || '' },
            });
            const items = res.data?.data?.data || res.data?.data || [];
            const total = res.data?.meta?.total || res.data?.data?.total || items.length;
            setData(items);
            setPageCount(Math.ceil(total / pageSize));
            setTotalItems(total);
        } catch (err) {
            console.error('CrmSegmentList fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [pageIndex, globalFilter, pageSize]);

    useEffect(() => {
        const app_name = localStorage.getItem('app_name');
        document.title = `${app_name} | CRM Segments`;
        fetchData();
    }, [fetchData]);

    const handleSearch = (value) => {
        setGlobalFilter(value);
        setPageIndex(0);
    };

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setEditingSegment(null);
        setModalMode('create');
    };

    const openEdit = (segment) => {
        setEditingSegment(segment);
        setForm({ name: segment.name, description: segment.description || '', color: segment.color || '#0d9488' });
        setModalMode('edit');
    };

    const openAssign = async (segment) => {
        setEditingSegment(segment);
        setCustomerSearch('');
        setSelectedCustomerIds(segment.customer_ids || []);
        setModalMode('assign');
        try {
            const res = await api.get(CRM_CUSTOMERS, { params: { per_page: 100 } });
            const items = res.data?.data?.data || res.data?.data || [];
            setCustomerOptions(items);
        } catch (err) {
            setCustomerOptions([]);
        }
    };

    const submitForm = async () => {
        if (!form.name.trim()) {
            toast({ title: t('Segment name is required'), status: 'warning', duration: 2500, isClosable: true });
            return;
        }
        setIsSubmitting(true);
        try {
            if (modalMode === 'edit' && editingSegment) {
                await api.put(CRM_SEGMENT(editingSegment.id), form);
            } else {
                await api.post(CRM_SEGMENTS, form);
            }
            toast({ title: t('Segment saved'), status: 'success', duration: 2500, isClosable: true });
            setModalMode(null);
            fetchData();
        } catch (err) {
            toast({
                title: t('Failed to save segment'),
                description: err.response?.data?.message || t('Something went wrong'),
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitAssign = async () => {
        if (!editingSegment) return;
        setIsSubmitting(true);
        try {
            await api.post(CRM_SEGMENT_CUSTOMERS(editingSegment.id), { customer_ids: selectedCustomerIds });
            toast({ title: t('Customers assigned'), status: 'success', duration: 2500, isClosable: true });
            setModalMode(null);
            fetchData();
        } catch (err) {
            toast({
                title: t('Failed to assign customers'),
                description: err.response?.data?.message || t('Something went wrong'),
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await api.delete(CRM_SEGMENT(deleteTarget.id));
            toast({ title: t('Segment deleted'), status: 'success', duration: 2500, isClosable: true });
            setDeleteTarget(null);
            fetchData();
        } catch (err) {
            toast({
                title: t('Failed to delete segment'),
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleCustomer = (customerId) => {
        setSelectedCustomerIds((prev) => prev.includes(customerId)
            ? prev.filter((cid) => cid !== customerId)
            : [...prev, customerId]);
    };

    const filteredCustomers = customerOptions.filter((c) => {
        const q = customerSearch.toLowerCase();
        if (!q) return true;
        return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q);
    });

    const columns = [
        {
            header: '#',
            cell: ({ row }) => (
                <Text fontSize="sm" fontWeight="500" color="gray.500">{row.index + 1 + pageIndex * pageSize}</Text>
            ),
        },
        {
            header: t('Name'),
            accessorKey: 'name',
            cell: ({ getValue, row }) => (
                <HStack spacing={2}>
                    <Box w={3} h={3} borderRadius="full" bg={row.original.color || 'teal.500'} />
                    <Text fontSize="sm" fontWeight="600">{getValue()}</Text>
                </HStack>
            ),
        },
        {
            header: t('Description'),
            accessorKey: 'description',
            cell: ({ getValue }) => <Text fontSize="sm" color="gray.600" noOfLines={1}>{getValue() || '-'}</Text>,
        },
        {
            header: t('Customers'),
            accessorKey: 'customers_count',
            cell: ({ getValue }) => (
                <Badge colorScheme="teal" variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="sm" fontWeight="700">
                    {getValue() ?? 0}
                </Badge>
            ),
        },
        {
            header: t('Actions'),
            cell: ({ row }) => (
                <Menu>
                    <MenuButton as={IconButton} icon={<Icon as={MoreHorizontal} boxSize={4} />} variant="ghost" size="sm" borderRadius="lg" aria-label={t('Actions')} />
                    <MenuList minW="180px" p={1.5}>
                        {can('update_segments') && (
                            <MenuItem
                                icon={<Icon as={Users} boxSize={4} />}
                                borderRadius="md"
                                fontSize="sm"
                                onClick={() => openAssign(row.original)}
                            >
                                {t('Assign Customers')}
                            </MenuItem>
                        )}
                        {can('update_segments') && (
                            <MenuItem
                                icon={<EditIcon boxSize={4} />}
                                borderRadius="md"
                                fontSize="sm"
                                onClick={() => openEdit(row.original)}
                            >
                                {t('Edit')}
                            </MenuItem>
                        )}
                        {can('delete_segments') && (
                            <MenuItem
                                icon={<DeleteIcon boxSize={4} />}
                                borderRadius="md"
                                fontSize="sm"
                                color="red.500"
                                _hover={{ bg: 'red.50', _dark: { bg: 'red.900' } }}
                                onClick={() => setDeleteTarget(row.original)}
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
                title={t('CRM Segments')}
                subtitle={t('Group customers into targeted segments')}
                breadcrumbs={[
                    { label: t('Dashboard'), path: DASHBOARD_PATH },
                    { label: t('CRM'), path: CRM_DASHBOARD_PATH },
                    { label: t('Segments'), isCurrent: true },
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
                    hideAddBtn={can('create_segments') ? 'false' : 'true'}
                    searchPlaceholder={t('Search segments...')}
                    totalItems={totalItems}
                >
                    {can('create_segments') && (
                        <Button colorScheme="teal" size="md" leftIcon={<Plus size={16} />} onClick={openCreate}>
                            {t('Add Segment')}
                        </Button>
                    )}
                </TanStackTable>
            </Box>

            {/* Create/Edit Modal */}
            <Modal isOpen={modalMode === 'create' || modalMode === 'edit'} onClose={() => setModalMode(null)} isCentered>
                <ModalOverlay />
                <ModalContent bg={colors.bgCard}>
                    <ModalHeader borderBottom="1px solid" borderColor={colors.borderDefault}>
                        {modalMode === 'edit' ? t('Edit Segment') : t('Add Segment')}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={4} pt={5}>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" color={colors.textSecondary}>{t('Name')}</FormLabel>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder={t('e.g. VIP Guests')}
                                    bg={colors.bgInput}
                                    borderColor={colors.borderInput}
                                    borderRadius="lg"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm" color={colors.textSecondary}>{t('Description')}</FormLabel>
                                <Textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    bg={colors.bgInput}
                                    borderColor={colors.borderInput}
                                    borderRadius="lg"
                                    size="sm"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm" color={colors.textSecondary}>{t('Color')}</FormLabel>
                                <Input
                                    type="color"
                                    value={form.color}
                                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                                    w="full"
                                    h={10}
                                    p={1}
                                    borderRadius="lg"
                                    cursor="pointer"
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter borderTop="1px solid" borderColor={colors.borderDefault}>
                        <Button variant="ghost" mr={3} onClick={() => setModalMode(null)} borderRadius="lg">{t('Cancel')}</Button>
                        <Button colorScheme="teal" onClick={submitForm} isLoading={isSubmitting} borderRadius="lg" fontWeight="700">
                            {t('Save')}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Assign Customers Modal */}
            <Modal isOpen={modalMode === 'assign'} onClose={() => setModalMode(null)} isCentered size="lg">
                <ModalOverlay />
                <ModalContent bg={colors.bgCard}>
                    <ModalHeader borderBottom="1px solid" borderColor={colors.borderDefault}>
                        {t('Assign Customers')}
                        {editingSegment && (
                            <Text fontSize="sm" fontWeight="500" color="gray.500" mt={1}>{editingSegment.name}</Text>
                        )}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={4} pt={5}>
                        <Input
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            placeholder={t('Search customers...')}
                            mb={3}
                            bg={colors.bgInput}
                            borderColor={colors.borderInput}
                            borderRadius="lg"
                        />
                        {filteredCustomers.length === 0 ? (
                            <Text fontSize="sm" color="gray.500" py={4}>{t('No customers found')}</Text>
                        ) : (
                            <Box maxH="320px" overflowY="auto" pr={1}>
                                <VStack spacing={1} align="stretch">
                                    {filteredCustomers.map((customer) => (
                                        <Checkbox
                                            key={customer.id}
                                            isChecked={selectedCustomerIds.includes(customer.id)}
                                            onChange={() => toggleCustomer(customer.id)}
                                            colorScheme="teal"
                                            p={2}
                                            borderRadius="md"
                                            _hover={{ bg: colors.bgHover }}
                                        >
                                            <Box>
                                                <Text fontSize="sm" fontWeight="600">{customer.name}</Text>
                                                <Text fontSize="xs" color="gray.500">{customer.email || customer.phone || '-'}</Text>
                                            </Box>
                                        </Checkbox>
                                    ))}
                                </VStack>
                            </Box>
                        )}
                    </ModalBody>
                    <ModalFooter borderTop="1px solid" borderColor={colors.borderDefault}>
                        <Button variant="ghost" mr={3} onClick={() => setModalMode(null)} borderRadius="lg">{t('Cancel')}</Button>
                        <Button colorScheme="teal" onClick={submitAssign} isLoading={isSubmitting} borderRadius="lg" fontWeight="700">
                            {t('Save')}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} isCentered>
                <ModalOverlay />
                <ModalContent bg={colors.bgCard}>
                    <ModalHeader borderBottom="1px solid" borderColor={colors.borderDefault}>{t('Delete Segment')}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={4} pt={5}>
                        <Text fontSize="sm" color={colors.textSecondary}>
                            {t('Are you sure you want to delete this segment?')}
                        </Text>
                        {deleteTarget && (
                            <Text fontSize="sm" fontWeight="600" mt={2}>{deleteTarget.name}</Text>
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
