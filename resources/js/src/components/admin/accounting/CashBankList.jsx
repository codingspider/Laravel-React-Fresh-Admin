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
import BranchFilter from "../../ui/BranchFilter";
import { LIST_CASH_BANK, DELETE_CASH_BANK } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

export default function CashBankList() {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(15);
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [typeFilter, setTypeFilter] = useState("");
    const [branchFilter, setBranchFilter] = useState(null);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(LIST_CASH_BANK, {
                params: {
                    page: pageIndex + 1,
                    per_page: pageSize,
                    search: globalFilter || "",
                    type: typeFilter || "",
                    branch_id: branchFilter || "",
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
    }, [pageIndex, globalFilter, pageSize, typeFilter, branchFilter]);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Cash & Bank`;
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
                await api.delete(`${DELETE_CASH_BANK(id)}`);
                toast({ title: t("data_deleted_successfully"), status: "success", duration: 3000, isClosable: true });
                fetchData();
            } catch (error) {
                toast({ title: t("error_deleting_data"), description: error.response?.data?.message || t("something_went_wrong"), status: "error", duration: 3000, isClosable: true });
            }
        }
    };

    const typeColors = {
        cash_deposit: "green",
        cash_withdraw: "red",
        bank_deposit: "blue",
        bank_withdraw: "orange",
        transfer: "purple",
    };

    const statusColors = { pending: "yellow", completed: "green", cancelled: "red" };

    const columns = [
        { header: "#", cell: ({ row }) => <Text fontSize="sm" fontWeight="500" color="gray.500">{row.index + 1 + pageIndex * pageSize}</Text> },
        {
            header: t("transaction_date"),
            accessorKey: "transaction_date",
            cell: ({ getValue }) => <Text fontSize="sm">{getValue() ? new Date(getValue()).toLocaleDateString() : "-"}</Text>,
        },
        {
            header: t("transaction_type"),
            accessorKey: "type",
            cell: ({ getValue }) => {
                const val = getValue();
                return <Badge colorScheme={typeColors[val] || "gray"} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="600" textTransform="capitalize">{t(val)}</Badge>;
            },
        },
        {
            header: t("transaction_reference"),
            accessorKey: "reference_number",
            cell: ({ getValue }) => <Text fontSize="sm" fontFamily="mono">{getValue() || "-"}</Text>,
        },
        {
            header: t("account"),
            accessorKey: "account",
            cell: ({ getValue }) => <Text fontSize="sm" fontWeight="600">{getValue()?.name || "-"}</Text>,
        },
        {
            header: t("transaction_amount"),
            accessorKey: "amount",
            cell: ({ getValue }) => <Text fontSize="sm" fontWeight="600">{formatAmount(parseFloat(getValue() || 0))}</Text>,
        },
        {
            header: t("status"),
            accessorKey: "status",
            cell: ({ getValue }) => {
                const val = getValue();
                return <Badge colorScheme={statusColors[val] || "gray"} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="600" textTransform="capitalize">{t(val)}</Badge>;
            },
        },
        {
            header: t("branch"),
            cell: ({ row }) => (
                <Text fontSize="sm">{row.original.branch?.name || "-"}</Text>
            ),
        },
        {
            header: t("actions"),
            cell: ({ row }) => (
                <Menu>
                    <MenuButton as={IconButton} icon={<Icon as={MoreHorizontal} boxSize={4} />} variant="ghost" size="sm" borderRadius="lg" aria-label={t("actions")} />
                    <MenuList minW="140px" p={1.5}>
                        <MenuItem icon={<Icon as={EditIcon} boxSize={4} />} borderRadius="md" fontSize="sm"
                            onClick={() => navigate(`/accounting/cash-bank/edit/${row.original.id}`, { state: { transaction: row.original } })}>
                            {t("edit")}
                        </MenuItem>
                        <MenuItem icon={<Icon as={DeleteIcon} boxSize={4} />} borderRadius="md" fontSize="sm" color="red.500"
                            _hover={{ bg: "red.50", _dark: { bg: "red.900" } }}
                            onClick={() => deleteItem(row.original.id)}>
                            {t("delete")}
                        </MenuItem>
                    </MenuList>
                </Menu>
            ),
        },
    ];

    return (
        <Box>
            <PageHeader title={t("cash_bank")} subtitle={t("manage_all_transactions")}
                breadcrumbs={[{ label: t("dashboard"), path: "/dashboard" }, { label: t("cash_bank"), isCurrent: true }]}
                action="/accounting/cash-bank/create" actionLabel={t("add_transaction")}>
                <TableExportButtons data={data} columns={columns} filename="cash-bank" />
            </PageHeader>

            <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                <TanStackTable columns={columns} data={data} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter}
                    pageIndex={pageIndex} pageSize={pageSize} setPageIndex={setPageIndex} pageCount={pageCount}
                    isLoading={isLoading} hideAddBtn="true" totalItems={totalItems}>
                    <Select maxW="160px" size="md" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPageIndex(0); }} placeholder={t("all_sources")} borderRadius="lg">
                        <option value="cash_deposit">{t("cash_deposit")}</option>
                        <option value="cash_withdraw">{t("cash_withdraw")}</option>
                        <option value="bank_deposit">{t("bank_deposit")}</option>
                        <option value="bank_withdraw">{t("bank_withdraw")}</option>
                        <option value="transfer">{t("transfer")}</option>
                    </Select>

                    <BranchFilter value={branchFilter} onChange={setBranchFilter} />
                </TanStackTable>
            </Box>
        </Box>
    );
}
