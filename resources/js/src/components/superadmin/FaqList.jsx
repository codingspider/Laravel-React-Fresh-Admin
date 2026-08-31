import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    useToast,
    Icon,
    IconButton,
    Text,
    Badge,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Switch,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { MoreHorizontal, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../axios';
import TanStackTable from '../../TanStackTable';
import PageHeader from '../ui/PageHeader';
import { FAQS_ADMIN, FAQ_API } from '../../routes/apiRoutes';
import { FAQ_CREATE_PATH, FAQ_EDIT_PATH, DASHBOARD_PATH } from '../../routes/superAdminRoutes';
import useThemeColors from '../../hooks/useThemeColors';
import { useNavigate } from 'react-router-dom';

const FaqList = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const colors = useThemeColors();
    const navigate = useNavigate();

    const [faqs, setFaqs] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(10);

    const fetchFaqs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(FAQS_ADMIN, {
                params: { per_page: 100, search: globalFilter || undefined },
            });
            const items = res.data?.data?.data || res.data?.data || [];
            setFaqs(items);
            setTotal(res.data?.meta?.total || res.data?.data?.total || items.length);
        } catch (error) {
            toast({
                title: t('Failed to load FAQs'),
                description: error.response?.data?.message || t('Something went wrong. Please try again.'),
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    }, [globalFilter, t, toast]);

    useEffect(() => {
        fetchFaqs();
    }, [fetchFaqs]);

    const toggleActive = async (faq) => {
        try {
            await api.put(FAQ_API(faq.id), { is_active: !faq.is_active });
            toast({
                title: t('FAQ updated'),
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            fetchFaqs();
        } catch (error) {
            toast({
                title: t('Failed to update FAQ'),
                description: error.response?.data?.message || t('Something went wrong. Please try again.'),
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
        }
    };

    const deleteFaq = async (faq) => {
        const result = await Swal.fire({
            title: t('Are you sure?'),
            text: t('This FAQ will be permanently deleted.'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0d9488',
            cancelButtonColor: '#6b7280',
            confirmButtonText: t('Yes, delete'),
            cancelButtonText: t('Cancel'),
            reverseButtons: true,
            customClass: { popup: 'swal-popup' },
        });

        if (result.isConfirmed) {
            try {
                await api.delete(FAQ_API(faq.id));
                toast({
                    title: t('FAQ deleted'),
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                fetchFaqs();
            } catch (error) {
                toast({
                    title: t('Failed to delete FAQ'),
                    description: error.response?.data?.message || t('Something went wrong. Please try again.'),
                    status: 'error',
                    duration: 4000,
                    isClosable: true,
                });
            }
        }
    };

    const columns = [
        {
            header: '#',
            cell: ({ row }) => (
                <Text fontSize="sm" fontWeight="500" color="gray.500">
                    {row.index + 1}
                </Text>
            ),
        },
        {
            header: t('Question'),
            accessorKey: 'question',
            cell: ({ getValue }) => (
                <Text fontSize="sm" fontWeight="600" maxW="420px" noOfLines={2}>
                    {getValue()}
                </Text>
            ),
        },
        {
            header: t('Answer'),
            accessorKey: 'answer',
            cell: ({ getValue }) => (
                <Text fontSize="sm" color="gray.500" maxW="420px" noOfLines={2}>
                    {getValue()}
                </Text>
            ),
        },
        {
            header: t('Sort'),
            accessorKey: 'sort_order',
            cell: ({ getValue }) => (
                <Text fontSize="sm">{getValue() ?? 0}</Text>
            ),
        },
        {
            header: t('Status'),
            accessorKey: 'is_active',
            cell: ({ row }) => (
                <Switch
                    colorScheme="teal"
                    size="sm"
                    isChecked={row.original.is_active}
                    onChange={() => toggleActive(row.original)}
                />
            ),
        },
        {
            header: t('Actions'),
            cell: ({ row }) => (
                <Menu>
                    <MenuButton
                        as={IconButton}
                        icon={<Icon as={MoreHorizontal} boxSize={4} />}
                        variant="ghost"
                        size="sm"
                        borderRadius="lg"
                        aria-label={t('Actions')}
                    />
                    <MenuList minW="140px" p={1.5}>
                        <MenuItem
                            icon={<Icon as={EditIcon} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            onClick={() => navigate(FAQ_EDIT_PATH.replace(':id', row.original.id))}
                        >
                            {t('Edit')}
                        </MenuItem>
                        <MenuItem
                            icon={<Icon as={DeleteIcon} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            color="red.500"
                            _hover={{ bg: 'red.50', _dark: { bg: 'red.900' } }}
                            onClick={() => deleteFaq(row.original)}
                        >
                            {t('Delete')}
                        </MenuItem>
                    </MenuList>
                </Menu>
            ),
        },
    ];

    const tableData = Array.isArray(faqs) ? faqs : [];
    const startIdx = pageIndex * pageSize;
    const paginatedData = tableData.slice(startIdx, startIdx + pageSize);
    const pageCount = Math.max(1, Math.ceil(tableData.length / pageSize));

    return (
        <Box>
            <PageHeader
                title={t('FAQs')}
                subtitle={t('Manage the frequently asked questions shown on the public website.')}
                breadcrumbs={[
                    { label: t('dashboard'), path: DASHBOARD_PATH },
                    { label: t('FAQs'), isCurrent: true },
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
                    data={paginatedData}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    setPageIndex={setPageIndex}
                    pageCount={pageCount}
                    isLoading={loading}
                    hideAddBtn="true"
                    totalItems={tableData.length}
                    addURL={FAQ_CREATE_PATH}
                    searchPlaceholder={t('Search FAQs...')}
                >
                    <Button
                        variant="primary"
                        leftIcon={<Icon as={Plus} boxSize={4} />}
                        size="md"
                        onClick={() => navigate(FAQ_CREATE_PATH)}
                    >
                        {t('Add FAQ')}
                    </Button>
                </TanStackTable>
            </Box>
        </Box>
    );
};

export default FaqList;
