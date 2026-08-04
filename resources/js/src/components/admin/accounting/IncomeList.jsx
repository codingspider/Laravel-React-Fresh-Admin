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
import { LIST_INCOME, DELETE_INCOME } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

export default function IncomeList() {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(15);
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [sourceFilter, setSourceFilter] = useState("");
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(LIST_INCOME, {
                params: {
                    page: pageIndex + 1,
                    per_page: pageSize,
                    search: globalFilter || "",
                    source: sourceFilter || "",
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
    }, [pageIndex, globalFilter, pageSize, sourceFilter]);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Income`;
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
                await api.delete(DELETE_INCOME(id));
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

    const sourceColors = {
        pos_sale: "blue",
        manual_income: "green",
        other_income: "purple",
    };

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
            header: t("income_date"),
            accessorKey: "income_date",
            cell: ({ getValue }) => (
                <Text fontSize="sm">
                    {getValue() ? new Date(getValue()).toLocaleDateString() : "-"}
                </Text>
            ),
        },
        {
            header: t("reference_number"),
            accessorKey: "reference_number",
            cell: ({ getValue }) => (
                <Text fontSize="sm" fontFamily="mono">
                    {getValue() || "-"}
                </Text>
            ),
        },
        {
            header: t("income_source"),
            accessorKey: "source",
            cell: ({ getValue }) => {
                const val = getValue();
                return (
                    <Badge
                        colorScheme={sourceColors[val] || "gray"}
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
            header: t("payment_method"),
            accessorKey: "payment_method",
            cell: ({ getValue }) => (
                <Text fontSize="sm" textTransform="capitalize">
                    {getValue() || "-"}
                </Text>
            ),
        },
        {
            header: t("amount"),
            accessorKey: "amount",
            cell: ({ getValue }) => (
                <Text fontSize="sm" fontWeight="600">
                    {formatAmount(parseFloat(getValue() || 0))}
                </Text>
            ),
        },
        {
            header: t("notes"),
            accessorKey: "notes",
            cell: ({ getValue }) => (
                <Text fontSize="sm" color="gray.500" noShrink>
                    {getValue() || "-"}
                </Text>
            ),
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
                            onClick={() => navigate(`/accounting/income/edit/${row.original.id}`, { state: { income: row.original } })}
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
                title={t("income")}
                subtitle={t("manage_all_income")}
                breadcrumbs={[
                    { label: t("dashboard"), path: "/dashboard" },
                    { label: t("income"), isCurrent: true },
                ]}
                action="/accounting/income/create"
                actionLabel={t("add_income")}
            >
                <TableExportButtons data={data} columns={columns} filename="incomes" />
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
                    addURL="/accounting/income/create"
                    totalItems={totalItems}
                >
                    <Select
                        maxW="160px"
                        size="md"
                        value={sourceFilter}
                        onChange={(e) => { setSourceFilter(e.target.value); setPageIndex(0); }}
                        placeholder={t("all_sources")}
                        borderRadius="lg"
                    >
                        <option value="pos_sale">{t("pos_sale")}</option>
                        <option value="manual_income">{t("manual_income")}</option>
                        <option value="other_income">{t("other_income")}</option>
                    </Select>
                </TanStackTable>
            </Box>
        </Box>
    );
}
