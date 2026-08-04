import React, { useEffect, useState, useCallback } from "react";
import {
    Box,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Select,
    Grid,
    GridItem,
    useToast,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import api from "../../../axios";
import PageHeader from "../../ui/PageHeader";
import TableExportButtons from "../../ui/TableExportButtons";
import { LEDGER_BY_ACCOUNT, LEDGER_ACCOUNTS } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

export default function LedgerList() {
    const [data, setData] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [accountInfo, setAccountInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();
    const toast = useToast();

    const fetchAccounts = useCallback(async () => {
        try {
            const res = await api.get(LEDGER_ACCOUNTS);
            const accs = res.data?.data?.accounts || [];
            setAccounts(accs);
            if (accs.length > 0 && !selectedAccount) {
                setSelectedAccount(accs[0].id);
            }
        } catch (err) {
            console.error("fetchAccounts error:", err);
        }
    }, [selectedAccount]);

    const fetchLedger = useCallback(async () => {
        if (!selectedAccount) return;

        setLoading(true);
        try {
            const params = {};
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            const res = await api.get(LEDGER_BY_ACCOUNT(selectedAccount), { params });
            const result = res.data?.data || null;
            setData(result?.entries || []);
            setAccountInfo({
                account: result?.account || null,
                opening_balance: result?.opening_balance || 0,
                total_debit: result?.total_debit || 0,
                total_credit: result?.total_credit || 0,
                closing_balance: result?.closing_balance || 0,
            });
        } catch (err) {
            console.error("fetchLedger error:", err);
            toast({
                title: t("error_fetching_data"),
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    }, [selectedAccount, dateFrom, dateTo, t, toast]);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Ledger`;
        fetchAccounts();
    }, [fetchAccounts]);

    useEffect(() => {
        fetchLedger();
    }, [fetchLedger]);

    const columns = [
        { header: t("date"), accessorKey: "date" },
        { header: t("voucher_number"), accessorKey: "voucher_number" },
        { header: t("description"), accessorKey: "description" },
        { header: t("debit"), accessorKey: "debit" },
        { header: t("credit"), accessorKey: "credit" },
        { header: t("balance"), accessorKey: "balance" },
        { header: t("source_module"), accessorKey: "source_module" },
    ];

    return (
        <Box>
            <PageHeader
                title={t("ledger")}
                subtitle={t("manage_ledger")}
                breadcrumbs={[
                    { label: t("dashboard"), path: "/dashboard" },
                    { label: t("ledger"), isCurrent: true },
                ]}
            >
                <TableExportButtons data={data} columns={columns} filename="ledger" />
            </PageHeader>

            <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mb={6}>
                <Grid templateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap={4} mb={4}>
                    <GridItem>
                        <Text fontSize="xs" color="gray.500" mb={1}>{t("select_account")}</Text>
                        <Select
                            size="md"
                            value={selectedAccount}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            borderRadius="lg"
                            bg={colors.bgInput}
                            border="1px solid"
                            borderColor={colors.borderInput}
                            focusBorderColor="teal.500"
                        >
                            {accounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.code} - {acc.name}
                                </option>
                            ))}
                        </Select>
                    </GridItem>
                    <GridItem>
                        <Text fontSize="xs" color="gray.500" mb={1}>{t("date_from") || "From Date"}</Text>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                border: "1px solid " + colors.borderInput,
                                background: colors.bgInput,
                                fontSize: "14px",
                            }}
                        />
                    </GridItem>
                    <GridItem>
                        <Text fontSize="xs" color="gray.500" mb={1}>{t("date_to") || "To Date"}</Text>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                border: "1px solid " + colors.borderInput,
                                background: colors.bgInput,
                                fontSize: "14px",
                            }}
                        />
                    </GridItem>
                </Grid>

                {accountInfo && (
                    <Grid templateColumns="repeat(auto-fit, minmax(140px, 1fr))" gap={4} mb={2}>
                        <GridItem>
                            <Text fontSize="xs" color="gray.500">{t("opening_balance")}</Text>
                            <Text fontSize="sm" fontWeight="600">{formatAmount(parseFloat(accountInfo.opening_balance || 0))}</Text>
                        </GridItem>
                        <GridItem>
                            <Text fontSize="xs" color="gray.500">{t("total_debit")}</Text>
                            <Text fontSize="sm" fontWeight="600">{formatAmount(parseFloat(accountInfo.total_debit || 0))}</Text>
                        </GridItem>
                        <GridItem>
                            <Text fontSize="xs" color="gray.500">{t("total_credit")}</Text>
                            <Text fontSize="sm" fontWeight="600">{formatAmount(parseFloat(accountInfo.total_credit || 0))}</Text>
                        </GridItem>
                        <GridItem>
                            <Text fontSize="xs" color="gray.500">{t("closing_balance")}</Text>
                            <Text fontSize="sm" fontWeight="600" color={(accountInfo.closing_balance >= 0 ? "green.500" : "red.500")}>
                                {formatAmount(parseFloat(accountInfo.closing_balance || 0))}
                            </Text>
                        </GridItem>
                    </Grid>
                )}
            </Box>

            <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                <TableContainer>
                    <Table variant="striped" size="sm">
                        <Thead>
                            <Tr>
                                <Th fontSize="xs" textTransform="uppercase">{t("date")}</Th>
                                <Th fontSize="xs" textTransform="uppercase">{t("voucher_number")}</Th>
                                <Th fontSize="xs" textTransform="uppercase">{t("description")}</Th>
                                <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("debit")}</Th>
                                <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("credit")}</Th>
                                <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("balance")}</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {data.length === 0 ? (
                                <Tr>
                                    <Td colSpan="6" textAlign="center" py={8}>
                                        <Text color="gray.500">{t("no_entries_in_ledger")}</Text>
                                    </Td>
                                </Tr>
                            ) : (
                                data.map((item, idx) => (
                                    <Tr key={idx}>
                                        <Td fontSize="sm">{item.date ? new Date(item.date).toLocaleDateString() : "-"}</Td>
                                        <Td fontSize="sm" fontFamily="mono">{item.voucher_number || "-"}</Td>
                                        <Td fontSize="sm" maxW="200px" noOfLines={1}>{item.description || "-"}</Td>
                                        <Td fontSize="sm" textAlign="right" fontWeight="600">
                                            {item.debit ? formatAmount(parseFloat(item.debit)) : "-"}
                                        </Td>
                                        <Td fontSize="sm" textAlign="right" fontWeight="600">
                                            {item.credit ? formatAmount(parseFloat(item.credit)) : "-"}
                                        </Td>
                                        <Td fontSize="sm" textAlign="right" fontWeight="600">
                                            {formatAmount(parseFloat(item.balance || 0))}
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </Tbody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}
