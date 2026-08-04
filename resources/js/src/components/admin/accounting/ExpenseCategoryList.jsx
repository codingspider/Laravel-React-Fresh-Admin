import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
    Select,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { MoreHorizontal } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../axios";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import TableExportButtons from "../../ui/TableExportButtons";
import { LIST_EXPENSE_CATEGORY, DELETE_EXPENSE_CATEGORY } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";

export default function ExpenseCategoryList() {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(15);
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [statusFilter, setStatusFilter] = useState("");
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const colors = useThemeColors();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(LIST_EXPENSE_CATEGORY, {
                params: {
                    page: pageIndex + 1,
                    per_page: pageSize,
                    search: globalFilter || "",
                    status: statusFilter || "",
                },
            });
            const items = res.data?.data?.data || res.data?.data || [];
            const total = res.data?.meta?.total || res.data?.data?.total || items.length;
            setData(items);
            setPageCount(Math.ceil(total / pageSize));
            setTotalItems(total);
        } catch (err) {
            console.error("fetchData error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [pageIndex, globalFilter, pageSize, statusFilter]);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Expense Categories`;
        fetchData();
    }, [fetchData]);

    const deleteItem = async (id) => {
        const result = await Swal.fire({
            title: t("are_you_sure"),
            text: t("data_will_be_deleted"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#0d9488",
            cancelButtonColor: "#6b7280",
            confirmButtonText: t("yes_delete"),
            cancelButtonText: t("cancel"),
            reverseButtons: true,
            customClass: { popup: "swal-popup" },
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`${DELETE_EXPENSE_CATEGORY(id)}`);
                toast({
                    title: t("data_deleted_successfully"),
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                fetchData();
            } catch (error) {
                toast({
                    title: t("error_deleting_data"),
                    description: error.response?.data?.message || t("something_went_wrong"),
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };

    const statusColors = { active: "green", inactive: "red" };

    const columns = [
        {
            header: "#",
            cell: ({ row }) => (
                <Text fontSize="sm" fontWeight="500" color="gray.500">
                    {row.index + 1}
                </Text>
            ),
        },
        {
            header: t("name"),
            accessorKey: "name",
            cell: ({ row }) => (
                <Box>
                    <Text fontSize="sm" fontWeight="600">
                        {row.original.name}
                    </Text>
                    {row.original.code && (
                        <Text fontSize="xs" color="gray.500" fontFamily="mono">
                            {row.original.code}
                        </Text>
                    )}
                </Box>
            ),
        },
        {
            header: t("account"),
            accessorKey: "account",
            cell: ({ getValue }) => (
                <Text fontSize="sm">
                    {getValue()?.name || "-"}
                </Text>
            ),
        },
        {
            header: t("description"),
            accessorKey: "description",
            cell: ({ getValue }) => (
                <Text fontSize="sm" color="gray.500" noShrink>
                    {getValue() || "-"}
                </Text>
            ),
        },
        {
            header: t("status"),
            accessorKey: "status",
            cell: ({ getValue }) => {
                const val = getValue();
                return (
                    <Badge
                        colorScheme={statusColors[val] || "gray"}
                        variant="subtle"
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        fontSize="xs"
                        fontWeight="600"
                        textTransform="capitalize"
                    >
                        {t(val)}
                    </Badge>
                );
            },
        },
        {
            header: t("actions"),
            cell: ({ row }) => (
                <Menu>
                    <MenuButton
                        as={IconButton}
                        icon={<Icon as={MoreHorizontal} boxSize={4} />}
                        variant="ghost"
                        size="sm"
                        borderRadius="lg"
                        aria-label={t("actions")}
                    />
                    <MenuList minW="140px" p={1.5}>
                        <MenuItem
                            icon={<Icon as={EditIcon} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            onClick={() => navigate(`/accounting/expense-categories/edit/${row.original.id}`, { state: { category: row.original } })}
                        >
                            {t("edit")}
                        </MenuItem>
                        <MenuItem
                            icon={<Icon as={DeleteIcon} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            color="red.500"
                            _hover={{ bg: "red.50", _dark: { bg: "red.900" } }}
                            onClick={() => deleteItem(row.original.id)}
                        >
                            {t("delete")}
                        </MenuItem>
                    </MenuList>
                </Menu>
            ),
        },
    ];

    return (
        <Box>
            <PageHeader
                title={t("expense_categories")}
                subtitle={t("manage_all_expense_categories")}
                breadcrumbs={[
                    { label: t("dashboard"), path: "/dashboard" },
                    { label: t("expense_categories"), isCurrent: true },
                ]}
                action="/accounting/expense-categories/create"
                actionLabel={t("add_expense_category")}
            >
                <TableExportButtons data={data} columns={columns} filename="expense-categories" />
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
                    addURL="/accounting/expense-categories/create"
                    totalItems={totalItems}
                >
                    <Select
                        maxW="160px"
                        size="md"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPageIndex(0); }}
                        placeholder={t("all_statuses")}
                        borderRadius="lg"
                    >
                        <option value="active">{t("active")}</option>
                        <option value="inactive">{t("inactive")}</option>
                    </Select>
                </TanStackTable>
            </Box>
        </Box>
    );
}
