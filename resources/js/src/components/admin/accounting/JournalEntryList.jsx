import React, { useEffect, useState, useCallback } from "react";
import {
    Box,
    Text,
    Badge,
    Icon,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Select,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import api from "../../../axios";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import TableExportButtons from "../../ui/TableExportButtons";
import { LIST_JOURNAL } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

export default function JournalEntryList() {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(15);
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [typeFilter, setTypeFilter] = useState("");
    const [accountFilter, setAccountFilter] = useState("");
    const [accounts, setAccounts] = useState([]);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const { t } = useTranslation();
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = {
                page: pageIndex + 1,
                per_page: pageSize,
                search: globalFilter || "",
                entry_type: typeFilter || "",
                account_id: accountFilter || "",
            };
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            const res = await api.get(LIST_JOURNAL, { params });
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
    }, [pageIndex, globalFilter, pageSize, typeFilter, accountFilter, dateFrom, dateTo]);

    const fetchAccounts = useCallback(async () => {
        try {
            const res = await api.get("/journal/ledger");
            const accs = res.data?.data?.accounts || [];
            setAccounts(accs);
        } catch (err) {
            console.error("fetchAccounts error:", err);
        }
    }, []);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Journal Entries`;
        fetchAccounts();
        fetchData();
    }, [fetchData, fetchAccounts]);

    useEffect(() => {
        if (dateFrom && dateTo) {
            fetchData();
        }
    }, [dateFrom, dateTo]);

    const handleDateFilter = () => {
        if (dateFrom && dateTo) {
            setPageIndex(0);
            fetchData();
        }
    };

    const typeColors = {
        debit: "green",
        credit: "blue",
    };

    const sourceColors = {
        income: "green",
        expense: "red",
        cash_bank: "blue",
    };

    const columns = [
        {
            header: "#",
            cell: ({ row }) => (
                <Text fontSize="sm" fontWeight="500" color="gray.500">
                    {row.index + 1 + pageIndex * pageSize}
                </Text>
            ),
        },
        {
            header: t("entry_date"),
            accessorKey: "entry_date",
            cell: ({ getValue }) => (
                <Text fontSize="sm">
                    {getValue() ? new Date(getValue()).toLocaleDateString() : "-"}
                </Text>
            ),
        },
        {
            header: t("voucher_number"),
            accessorKey: "voucher_number",
            cell: ({ getValue }) => (
                <Text fontSize="sm" fontFamily="mono">
                    {getValue() || "-"}
                </Text>
            ),
        },
        {
            header: t("account_name"),
            accessorKey: "account",
            cell: ({ getValue }) => (
                <Text fontSize="sm" fontWeight="600">
                    {getValue()?.name || "-"}
                </Text>
            ),
        },
        {
            header: t("entry_type"),
            accessorKey: "entry_type",
            cell: ({ getValue }) => {
                const val = getValue();
                return (
                    <Badge
                        colorScheme={typeColors[val] || "gray"}
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
            header: t("amount"),
            accessorKey: "amount",
            cell: ({ getValue }) => (
                <Text fontSize="sm" fontWeight="600">
                    {formatAmount(parseFloat(getValue() || 0))}
                </Text>
            ),
        },
        {
            header: t("source_module"),
            accessorKey: "source_module",
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
                        {t(val) || val || "-"}
                    </Badge>
                );
            },
        },
        {
            header: t("description"),
            accessorKey: "description",
            cell: ({ getValue }) => (
                <Text fontSize="sm" noOfLines={1} maxW="150px">
                    {getValue() || "-"}
                </Text>
            ),
        },
        {
            header: t("actions"),
            cell: ({ row }) => (
                <Menu>
                    <MenuButton
                        as={Icon}
                        asIcon={Eye}
                        variant="ghost"
                        size="sm"
                        borderRadius="lg"
                        aria-label={t("actions")}
                        cursor="pointer"
                    />
                    <MenuList minW="140px" p={1.5}>
                        <MenuItem
                            icon={<Icon as={Eye} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            onClick={() => window.open(`/accounting/journal/view/${row.original.id}`, "_blank")}
                        >
                            {t("view")}
                        </MenuItem>
                    </MenuList>
                </Menu>
            ),
        },
    ];

    return (
        <Box>
            <PageHeader
                title={t("journal_entries")}
                subtitle={t("manage_journal_entries")}
                breadcrumbs={[
                    { label: t("dashboard"), path: "/dashboard" },
                    { label: t("journal_entries"), isCurrent: true },
                ]}
            >
                <TableExportButtons data={data} columns={columns} filename="journal-entries" />
            </PageHeader>

            <Box
                bg={colors.bgCard}
                p={{ base: 3, md: 6 }}
                borderRadius="xl"
                boxShadow="card"
                border="1px solid"
                borderColor={colors.borderDefault}
            >
                <Box mt={4} mb={4} display="flex" gap={3} flexWrap="wrap" alignItems="center">
                    <Select
                        maxW="160px"
                        size="md"
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setPageIndex(0); }}
                        placeholder={t("all_sources")}
                        borderRadius="lg"
                        bg={colors.bgInput}
                        border="1px solid"
                        borderColor={colors.borderInput}
                        focusBorderColor="teal.500"
                    >
                        <option value="debit">{t("debit")}</option>
                        <option value="credit">{t("credit")}</option>
                    </Select>

                    <Select
                        maxW="200px"
                        size="md"
                        value={accountFilter}
                        onChange={(e) => { setAccountFilter(e.target.value); setPageIndex(0); }}
                        placeholder={t("select_account")}
                        borderRadius="lg"
                        bg={colors.bgInput}
                        border="1px solid"
                        borderColor={colors.borderInput}
                        focusBorderColor="teal.500"
                    >
                        <option value="">{t("all_accounts") || "All Accounts"}</option>
                        {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                                {acc.code} - {acc.name}
                            </option>
                        ))}
                    </Select>

                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            border: "1px solid " + colors.borderInput,
                            background: colors.bgInput,
                            fontSize: "14px",
                        }}
                    />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            border: "1px solid " + colors.borderInput,
                            background: colors.bgInput,
                            fontSize: "14px",
                        }}
                    />
                </Box>

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
                    totalItems={totalItems}
                >

                </TanStackTable>


            </Box>
        </Box>
    );
}
