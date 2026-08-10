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
    Select,
    FormControl,
    FormLabel,
    VStack,
    HStack,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { MoreHorizontal, Check, Plus } from 'lucide-react';
import api from '../../../axios';
import {
    CRM_FOLLOW_UPS,
    CRM_FOLLOW_UP,
    CRM_FOLLOW_UP_COMPLETE,
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
import BranchFilter from '../../ui/BranchFilter';

const STATUS_COLORS = {
    pending: 'orange',
    completed: 'green',
};

const EMPTY_FORM = { customer_id: '', title: '', notes: '', due_at: '', status: 'pending' };

export default function CrmFollowUpList() {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(15);
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');
    const [branchFilter, setBranchFilter] = useState(null);
    const { t } = useTranslation();
    const { can } = usePermission();
    const toast = useToast();
    const colors = useThemeColors();

    const [modalMode, setModalMode] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingFollowUp, setEditingFollowUp] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [completingId, setCompletingId] = useState(null);
    const [customerOptions, setCustomerOptions] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = { page: pageIndex + 1, per_page: pageSize, search: globalFilter || '' };
            if (statusFilter) params.status = statusFilter;
            if (branchFilter) params.branch_id = branchFilter;
            const res = await api.get(CRM_FOLLOW_UPS, { params });
            const items = res.data?.data?.data || res.data?.data || [];
            const total = res.data?.meta?.total || res.data?.data?.total || items.length;
            setData(items);
            setPageCount(Math.ceil(total / pageSize));
            setTotalItems(total);
        } catch (err) {
            console.error('CrmFollowUpList fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [pageIndex, globalFilter, pageSize, statusFilter, branchFilter]);

    useEffect(() => {
        const app_name = localStorage.getItem('app_name');
        document.title = `${app_name} | CRM Follow-ups`;
        fetchData();
    }, [fetchData]);

    const fetchCustomers = useCallback(async () => {
        try {
            const res = await api.get(CRM_CUSTOMERS, { params: { per_page: 100 } });
            const items = res.data?.data?.data || res.data?.data || [];
            setCustomerOptions(items);
        } catch (err) {
            setCustomerOptions([]);
        }
    }, []);

    useEffect(() => {
        if (modalMode === 'create' || modalMode === 'edit') {
            fetchCustomers();
        }
    }, [modalMode, fetchCustomers]);

    const handleSearch = (value) => {
        setGlobalFilter(value);
        setPageIndex(0);
    };

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setEditingFollowUp(null);
        setModalMode('create');
    };

    const openEdit = (followUp) => {
        setEditingFollowUp(followUp);
        setForm({
            customer_id: followUp.customer_id,
            title: followUp.title,
            notes: followUp.notes || '',
            due_at: followUp.due_at ? followUp.due_at.slice(0, 16) : '',
            status: followUp.status || 'pending',
        });
        setModalMode('edit');
    };

    const submitForm = async () => {
        if (!form.customer_id) {
            toast({ title: t('Please select a customer'), status: 'warning', duration: 2500, isClosable: true });
            return;
        }
        if (!form.title.trim()) {
            toast({ title: t('Title is required'), status: 'warning', duration: 2500, isClosable: true });
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = { ...form, title: form.title.trim() };
            if (modalMode === 'edit' && editingFollowUp) {
                await api.put(CRM_FOLLOW_UP(editingFollowUp.id), payload);
            } else {
                await api.post(CRM_FOLLOW_UPS, payload);
            }
            toast({ title: t('Follow-up saved'), status: 'success', duration: 2500, isClosable: true });
            setModalMode(null);
            fetchData();
        } catch (err) {
            toast({
                title: t('Failed to save follow-up'),
                description: err.response?.data?.message || t('Something went wrong'),
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const completeFollowUp = async (followUpId) => {
        setCompletingId(followUpId);
        try {
            await api.post(CRM_FOLLOW_UP_COMPLETE(followUpId));
            toast({ title: t('Follow-up completed'), status: 'success', duration: 2500, isClosable: true });
            fetchData();
        } catch (err) {
            toast({
                title: t('Failed to complete follow-up'),
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setCompletingId(null);
        }
    };

    const submitDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await api.delete(CRM_FOLLOW_UP(deleteTarget.id));
            toast({ title: t('Follow-up deleted'), status: 'success', duration: 2500, isClosable: true });
            setDeleteTarget(null);
            fetchData();
        } catch (err) {
            toast({
                title: t('Failed to delete follow-up'),
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
            accessorKey: 'customer',
            cell: ({ getValue }) => {
                const customer = getValue();
                if (!customer) return <Text fontSize="sm" color="gray.400">-</Text>;
                return (
                    <Box>
                        <Text fontSize="sm" fontWeight="600">{customer.name}</Text>
                        <Text fontSize="xs" color="gray.500">{customer.phone || '-'}</Text>
                    </Box>
                );
            },
        },
        {
            header: t('Title'),
            accessorKey: 'title',
            cell: ({ getValue }) => <Text fontSize="sm" fontWeight="500">{getValue()}</Text>,
        },
        {
            header: t('Notes'),
            accessorKey: 'notes',
            cell: ({ getValue }) => <Text fontSize="sm" color="gray.600" noOfLines={1}>{getValue() || '-'}</Text>,
        },
        {
            header: t('Due Date'),
            accessorKey: 'due_at',
            cell: ({ getValue }) => (
                <Text fontSize="sm" color="gray.600">
                    {getValue() ? new Date(getValue()).toLocaleDateString() : '-'}
                </Text>
            ),
        },
        {
            header: t('Status'),
            accessorKey: 'status',
            cell: ({ getValue }) => {
                const status = getValue() || 'pending';
                return (
                    <Badge colorScheme={STATUS_COLORS[status] || 'gray'} variant="subtle" borderRadius="full" px={2.5} py={0.5} textTransform="capitalize">
                        {status}
                    </Badge>
                );
            },
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
                        {row.original.status !== 'completed' && can('complete_follow_ups') && (
                            <MenuItem
                                icon={<Icon as={Check} boxSize={4} />}
                                borderRadius="md"
                                fontSize="sm"
                                color="green.600"
                                onClick={() => completeFollowUp(row.original.id)}
                            >
                                {t('Complete')}
                            </MenuItem>
                        )}
                        {can('update_follow_ups') && (
                            <MenuItem
                                icon={<EditIcon boxSize={4} />}
                                borderRadius="md"
                                fontSize="sm"
                                onClick={() => openEdit(row.original)}
                            >
                                {t('Edit')}
                            </MenuItem>
                        )}
                        {can('delete_follow_ups') && (
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
                title={t('CRM Follow-ups')}
                subtitle={t('Manage scheduled customer follow-up activities')}
                breadcrumbs={[
                    { label: t('Dashboard'), path: DASHBOARD_PATH },
                    { label: t('CRM'), path: CRM_DASHBOARD_PATH },
                    { label: t('Follow-ups'), isCurrent: true },
                ]}
            >
                {can('create_follow_ups') && (
                    <Button colorScheme="teal" size="md" leftIcon={<Plus size={16} />} onClick={openCreate}>
                        {t('Add Follow-up')}
                    </Button>
                )}
            </PageHeader>

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
                    hideAddBtn={can('create_follow_ups') ? 'false' : 'true'}
                    searchPlaceholder={t('Search follow-ups...')}
                    totalItems={totalItems}
                >
                    <Select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPageIndex(0); }}
                        w={{ base: 'full', md: '150px' }}
                        size="md"
                        borderRadius="lg"
                        bg={colors.bgSubtle}
                        placeholder={t('All Statuses')}
                    >
                        <option value="pending">{t('Pending')}</option>
                        <option value="completed">{t('Completed')}</option>
                    </Select>

                    <BranchFilter value={branchFilter} onChange={setBranchFilter} />

                    {can('create_follow_ups') && (
                        <Button colorScheme="teal" size="md" leftIcon={<Plus size={16} />} onClick={openCreate}>
                            {t('Add Follow-up')}
                        </Button>
                    )}
                </TanStackTable>
            </Box>

            {/* Create/Edit Modal */}
            <Modal isOpen={modalMode === 'create' || modalMode === 'edit'} onClose={() => setModalMode(null)} isCentered>
                <ModalOverlay />
                <ModalContent bg={colors.bgCard}>
                    <ModalHeader borderBottom="1px solid" borderColor={colors.borderDefault}>
                        {modalMode === 'edit' ? t('Edit Follow-up') : t('Add Follow-up')}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={4} pt={5}>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" color={colors.textSecondary}>{t('Customer')}</FormLabel>
                                <Select
                                    value={form.customer_id}
                                    onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                                    bg={colors.bgInput}
                                    borderColor={colors.borderInput}
                                    borderRadius="lg"
                                    placeholder={t('Select customer')}
                                >
                                    {customerOptions.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name} {customer.phone ? `(${customer.phone})` : ''}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" color={colors.textSecondary}>{t('Title')}</FormLabel>
                                <Input
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder={t('e.g. Birthday call')}
                                    bg={colors.bgInput}
                                    borderColor={colors.borderInput}
                                    borderRadius="lg"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm" color={colors.textSecondary}>{t('Notes')}</FormLabel>
                                <Textarea
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    bg={colors.bgInput}
                                    borderColor={colors.borderInput}
                                    borderRadius="lg"
                                    size="sm"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm" color={colors.textSecondary}>{t('Due Date')}</FormLabel>
                                <Input
                                    type="datetime-local"
                                    value={form.due_at}
                                    onChange={(e) => setForm({ ...form, due_at: e.target.value })}
                                    bg={colors.bgInput}
                                    borderColor={colors.borderInput}
                                    borderRadius="lg"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm" color={colors.textSecondary}>{t('Status')}</FormLabel>
                                <Select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    bg={colors.bgInput}
                                    borderColor={colors.borderInput}
                                    borderRadius="lg"
                                >
                                    <option value="pending">{t('Pending')}</option>
                                    <option value="completed">{t('Completed')}</option>
                                </Select>
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

            {/* Delete Modal */}
            <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} isCentered>
                <ModalOverlay />
                <ModalContent bg={colors.bgCard}>
                    <ModalHeader borderBottom="1px solid" borderColor={colors.borderDefault}>{t('Delete Follow-up')}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={4} pt={5}>
                        <Text fontSize="sm" color={colors.textSecondary}>
                            {t('Are you sure you want to delete this follow-up?')}
                        </Text>
                        {deleteTarget && (
                            <Text fontSize="sm" fontWeight="600" mt={2}>{deleteTarget.title}</Text>
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
