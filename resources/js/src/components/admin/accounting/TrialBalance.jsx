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
    Grid,
    GridItem,
    useToast,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import api from "../../../axios";
import PageHeader from "../../ui/PageHeader";
import TableExportButtons from "../../ui/TableExportButtons";
import { TRIAL_BALANCE } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

export default function TrialBalance() {
    const [balances, setBalances] = useState([]);
    const [totals, setTotals] = useState({ total_debit: 0, total_credit: 0, balanced: true });
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();
    const toast = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            const res = await api.get(TRIAL_BALANCE, { params });
            const result = res.data?.data || { balances: [], total_debit: 0, total_credit: 0, balanced: true };
            setBalances(result.balances || []);
            setTotals({
                total_debit: result.total_debit || 0,
                total_credit: result.total_credit || 0,
                balanced: result.balanced || false,
            });
        } catch (err) {
            console.error("fetchData error:", err);
            toast({
                title: t("error_fetching_data"),
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    }, [dateFrom, dateTo, t, toast]);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Trial Balance`;
        fetchData();
    }, [fetchData]);

    const columns = [
        { header: t("account_code"), accessorKey: "account_code" },
        { header: t("account_name"), accessorKey: "account_name" },
        { header: t("account_type"), accessorKey: "account_type" },
        { header: t("debit"), accessorKey: "debit" },
        { header: t("credit"), accessorKey: "credit" },
        { header: t("balance"), accessorKey: "balance" },
        { header: t("balance_type"), accessorKey: "balance_type" },
    ];

    return (
        <Box>
            <PageHeader
                title={t("trial_balance")}
                subtitle={t("manage_trial_balance")}
                breadcrumbs={[
                    { label: t("dashboard"), path: "/dashboard" },
                    { label: t("trial_balance"), isCurrent: true },
                ]}
            >
                <TableExportButtons data={balances} columns={columns} filename="trial-balance" />
            </PageHeader>

            <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mb={6}>
                <Grid templateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap={4} mb={4}>
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

                <Grid templateColumns="repeat(auto-fit, minmax(120px, 1fr))" gap={4} mb={2}>
                    <GridItem>
                        <Text fontSize="xs" color="gray.500">{t("total_debit")}</Text>
                        <Text fontSize="lg" fontWeight="700" color="red.500">
                            {formatAmount(parseFloat(totals.total_debit || 0))}
                        </Text>
                    </GridItem>
                    <GridItem>
                        <Text fontSize="xs" color="gray.500">{t("total_credit")}</Text>
                        <Text fontSize="lg" fontWeight="700" color="blue.500">
                            {formatAmount(parseFloat(totals.total_credit || 0))}
                        </Text>
                    </GridItem>
                    <GridItem>
                        <Text fontSize="xs" color="gray.500">{t("balance")}</Text>
                        <Text fontSize="lg" fontWeight="700" color={totals.balanced ? "green.500" : "red.500"}>
                            {totals.balanced ? t("balanced") : t("unbalanced")}
                        </Text>
                    </GridItem>
                </Grid>
            </Box>

            <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                <TableContainer>
                    <Table variant="striped" size="sm">
                        <Thead>
                            <Tr>
                                <Th fontSize="xs" textTransform="uppercase">{t("account_code")}</Th>
                                <Th fontSize="xs" textTransform="uppercase">{t("account_name")}</Th>
                                <Th fontSize="xs" textTransform="uppercase">{t("account_type")}</Th>
                                <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("debit")}</Th>
                                <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("credit")}</Th>
                                <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("balance")}</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {balances.length === 0 ? (
                                <Tr>
                                    <Td colSpan="7" textAlign="center" py={8}>
                                        <Text color="gray.500">{t("no_entries_found")}</Text>
                                    </Td>
                                </Tr>
                            ) : (
                                balances.map((item, idx) => (
                                    <Tr key={item.account_id || idx}>
                                        <Td fontSize="sm" fontFamily="mono">{item.account_code || "-"}</Td>
                                        <Td fontSize="sm" fontWeight="600">{item.account_name || "-"}</Td>
                                        <Td fontSize="sm" textTransform="capitalize">{item.account_type || "-"}</Td>
                                        <Td fontSize="sm" textAlign="right">{formatAmount(parseFloat(item.debit || 0))}</Td>
                                        <Td fontSize="sm" textAlign="right">{formatAmount(parseFloat(item.credit || 0))}</Td>
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
