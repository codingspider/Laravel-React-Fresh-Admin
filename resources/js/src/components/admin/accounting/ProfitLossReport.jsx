import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Box,
    Flex,
    Grid,
    GridItem,
    Text,
    Button,
    Select,
    Input,
    Badge,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    useToast,
    Spinner,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import api from "../../../axios";
import PageHeader from "../../ui/PageHeader";
import ReportExport from "../../ui/ReportExport";
import ReportSummaryCard from "../reports/ReportSummaryCard";
import { REPORT_META, PROFIT_LOSS_REPORT } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

const money = (value) => parseFloat(value || 0);

function SectionHeader({ label, total }) {
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();
    return (
        <Tr bg={colors.bgSubtle}>
            <Td colSpan={3} fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="0.5px">
                {label}
            </Td>
            <Td fontWeight="700" textAlign="right" fontSize="sm">
                {formatAmount(total)}
            </Td>
        </Tr>
    );
}

function ItemRow({ item }) {
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();
    return (
        <Tr>
            <Td pl={8} fontSize="sm">
                {item.name}
            </Td>
            <Td fontSize="sm" fontFamily="mono" color={colors.textMuted}>
                {item.code || "-"}
            </Td>
            <Td fontSize="sm" textAlign="center" color={colors.textMuted}>
                {item.transactions_count}
            </Td>
            <Td fontSize="sm" textAlign="right" fontWeight="600">
                {formatAmount(money(item.amount))}
            </Td>
        </Tr>
    );
}

function TotalRow({ label, value, color, highlight }) {
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();
    return (
        <Tr fontWeight="700" borderTop="2px solid" borderColor={colors.borderStrong} bg={highlight ? colors.bgSubtle : undefined}>
            <Td colSpan={3}>{label}</Td>
            <Td textAlign="right" color={color}>
                {formatAmount(money(value))}
            </Td>
        </Tr>
    );
}

export default function ProfitLossReport() {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const toast = useToast();
    const { formatAmount } = useCurrencyFormatter();
    const requestId = useRef(0);

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [meta, setMeta] = useState({ branches: [] });
    const [dateFrom, setDateFrom] = useState(monthStart.toISOString().slice(0, 10));
    const [dateTo, setDateTo] = useState(today.toISOString().slice(0, 10));
    const [branchId, setBranchId] = useState("");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const filterProps = {
        bg: colors.bgInput,
        border: "1px solid",
        borderColor: colors.borderInput,
        borderRadius: "md",
        size: "md",
        focusBorderColor: "teal.500",
        _hover: { borderColor: colors.borderDefault },
        transition: "all 0.2s",
    };

    const sourceLabels = {
        pos_sale: t("pos_sale"),
        manual_income: t("manual_income"),
        other_income: t("other_income"),
    };

    useEffect(() => {
        api.get(REPORT_META)
            .then((res) => {
                const data = res.data?.data || res.data || {};
                setMeta({ branches: data.branches || [] });
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | ${t("profit_loss_report")}`;
    }, [t]);

    const fetchReport = useCallback(async () => {
        if (!dateFrom || !dateTo) {
            toast({ title: t("date_range_required"), status: "warning", duration: 3000, isClosable: true });
            return;
        }
        const id = ++requestId.current;
        setLoading(true);
        try {
            const res = await api.get(PROFIT_LOSS_REPORT, {
                params: {
                    date_from: dateFrom,
                    date_to: dateTo,
                    branch_id: branchId || undefined,
                },
            });
            if (id !== requestId.current) return;
            setReport(res.data?.data || null);
        } catch (err) {
            if (id !== requestId.current) return;
            console.error("fetchReport error:", err);
            toast({ title: t("error_fetching_data"), status: "error", duration: 3000, isClosable: true });
        } finally {
            if (id === requestId.current) setLoading(false);
        }
    }, [dateFrom, dateTo, branchId, t, toast]);

    useEffect(() => {
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const periodText = `${new Date(dateFrom).toLocaleDateString()} - ${new Date(dateTo).toLocaleDateString()}`;
    const selectedBranch = meta.branches.find((b) => String(b.id) === String(branchId));
    const periodLabel = selectedBranch ? `${periodText} · ${selectedBranch.name}` : periodText;

    const statementRows = report
        ? (() => {
            const rows = [];
            const pushSection = (label) => rows.push({ label, count: "", amount: "" });
            const pushItems = (items) =>
                items.forEach((it) =>
                    rows.push({ label: it.name, count: it.transactions_count, amount: formatAmount(money(it.amount)) })
                );

            pushSection(t("revenue"));
            pushItems(report.revenue.items || []);
            rows.push({ label: t("total_revenue"), count: "", amount: formatAmount(money(report.total_revenue)) });

            pushSection(t("cost_of_goods_sold"));
            pushItems(report.cogs.items || []);
            rows.push({ label: t("total_cogs"), count: "", amount: formatAmount(money(report.total_cogs)) });

            rows.push({ label: t("gross_profit"), count: "", amount: formatAmount(money(report.gross_profit)) });

            pushSection(t("operating_expenses"));
            pushItems(report.operating_expenses.items || []);
            rows.push({ label: t("total_operating_expenses"), count: "", amount: formatAmount(money(report.total_operating_expenses)) });

            rows.push({ label: t("net_profit"), count: "", amount: formatAmount(money(report.net_profit)) });
            return rows;
        })()
        : [];

    const incomeExportRows = (report?.income_transactions || []).map((row) => ({
        date: row.date || "-",
        source: sourceLabels[row.source] || row.source || "-",
        account: row.account || "-",
        reference_number: row.reference_number || "-",
        payment_method: row.payment_method || "-",
        amount: formatAmount(money(row.amount)),
    }));

    const expenseExportRows = (report?.expense_transactions || []).map((row) => ({
        date: row.date || "-",
        account: row.account || "-",
        category: row.category || "-",
        reference_number: row.reference_number || "-",
        payment_method: row.payment_method || "-",
        status: row.status || "-",
        amount: formatAmount(money(row.amount)),
    }));

    return (
        <Box>
            <PageHeader
                title={t("profit_loss_report")}
                subtitle={t("manage_reports")}
                breadcrumbs={[
                    { label: t("dashboard"), path: "/dashboard" },
                    { label: t("reports"), path: "/reports/sales" },
                    { label: t("profit_loss_report"), isCurrent: true },
                ]}
            >
                {report && (
                    <ReportExport
                        title={t("profit_loss_report")}
                        period={periodLabel}
                        summary={[
                            { label: t("total_revenue"), value: formatAmount(money(report.total_revenue)) },
                            { label: t("gross_profit"), value: formatAmount(money(report.gross_profit)) },
                            { label: t("net_profit"), value: formatAmount(money(report.net_profit)) },
                        ]}
                        sections={[
                            {
                                title: t("statement"),
                                columns: [
                                    { header: t("account_name"), accessorKey: "label" },
                                    { header: t("count"), accessorKey: "count" },
                                    { header: t("amount"), accessorKey: "amount" },
                                ],
                                rows: statementRows,
                            },
                            {
                                title: t("income_transactions"),
                                columns: [
                                    { header: t("date"), accessorKey: "date" },
                                    { header: t("source"), accessorKey: "source" },
                                    { header: t("account_name"), accessorKey: "account" },
                                    { header: t("reference_number"), accessorKey: "reference_number" },
                                    { header: t("payment_method"), accessorKey: "payment_method" },
                                    { header: t("amount"), accessorKey: "amount" },
                                ],
                                rows: incomeExportRows,
                            },
                            {
                                title: t("expense_transactions"),
                                columns: [
                                    { header: t("date"), accessorKey: "date" },
                                    { header: t("account_name"), accessorKey: "account" },
                                    { header: t("category"), accessorKey: "category" },
                                    { header: t("reference_number"), accessorKey: "reference_number" },
                                    { header: t("payment_method"), accessorKey: "payment_method" },
                                    { header: t("status"), accessorKey: "status" },
                                    { header: t("amount"), accessorKey: "amount" },
                                ],
                                rows: expenseExportRows,
                            },
                        ]}
                        filename="profit-loss-report"
                    />
                )}
            </PageHeader>

            {/* Filters */}
            <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mb={6}>
                <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4} alignItems="flex-end">
                    <GridItem>
                        <Text fontSize="sm" fontWeight="500" mb={2}>
                            {t("date_from")}
                        </Text>
                        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} {...filterProps} />
                    </GridItem>
                    <GridItem>
                        <Text fontSize="sm" fontWeight="500" mb={2}>
                            {t("date_to")}
                        </Text>
                        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} {...filterProps} />
                    </GridItem>
                    <GridItem>
                        <Text fontSize="sm" fontWeight="500" mb={2}>
                            {t("branch")}
                        </Text>
                        <Select value={branchId} onChange={(e) => setBranchId(e.target.value)} placeholder={t("all_branches")} {...filterProps}>
                            {meta.branches.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </Select>
                    </GridItem>
                    <GridItem>
                        <Button colorScheme="teal" size="md" onClick={fetchReport} isLoading={loading} w={{ base: "full", md: "auto" }}>
                            {t("generate_report")}
                        </Button>
                    </GridItem>
                </Grid>
            </Box>

            {loading && !report && (
                <Box textAlign="center" py={16}>
                    <Spinner color="teal.500" size="xl" />
                </Box>
            )}

            {!loading && report && (
                <>
                    {/* Summary cards */}
                    <ReportSummaryCard
                        stats={[
                            { label: t("total_revenue"), value: formatAmount(money(report.total_revenue)), color: "green.500" },
                            { label: t("cost_of_goods_sold"), value: formatAmount(money(report.total_cogs)), color: "orange.500" },
                            { label: t("gross_profit"), value: formatAmount(money(report.gross_profit)), color: "teal.500" },
                            { label: t("total_operating_expenses"), value: formatAmount(money(report.total_operating_expenses)), color: "red.500" },
                            {
                                label: t("net_profit"),
                                value: formatAmount(money(report.net_profit)),
                                color: money(report.net_profit) >= 0 ? "green.500" : "red.500",
                            },
                            { label: t("net_margin"), value: `${money(report.net_margin)}%`, color: "purple.500" },
                        ]}
                    />

                    {/* Statement */}
                    <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mt={6}>
                        <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
                            <Text fontSize="md" fontWeight="600">
                                {t("profit_loss_statement")}
                            </Text>
                            <Text fontSize="xs" color={colors.textMuted}>
                                {t("period")}: {periodLabel}
                            </Text>
                        </Flex>
                        <TableContainer mt={4}>
                            <Table variant="unstyled" size="sm">
                                <Thead>
                                    <Tr>
                                        <Th fontSize="xs" textTransform="uppercase" color={colors.textMuted}>
                                            {t("account_name")}
                                        </Th>
                                        <Th fontSize="xs" textTransform="uppercase" color={colors.textMuted}>
                                            {t("account_code")}
                                        </Th>
                                        <Th fontSize="xs" textTransform="uppercase" textAlign="center" color={colors.textMuted}>
                                            {t("count")}
                                        </Th>
                                        <Th fontSize="xs" textTransform="uppercase" textAlign="right" color={colors.textMuted}>
                                            {t("amount")}
                                        </Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    <SectionHeader label={t("revenue")} total={report.total_revenue} />
                                    {(report.revenue.items || []).map((item, idx) => (
                                        <ItemRow key={idx} item={item} />
                                    ))}
                                    <TotalRow label={t("total_revenue")} value={report.total_revenue} />

                                    <SectionHeader label={t("cost_of_goods_sold")} total={report.total_cogs} />
                                    {(report.cogs.items || []).map((item, idx) => (
                                        <ItemRow key={idx} item={item} />
                                    ))}
                                    <TotalRow label={t("total_cogs")} value={report.total_cogs} />

                                    <TotalRow label={t("gross_profit")} value={report.gross_profit} color="teal.500" highlight />

                                    <SectionHeader label={t("operating_expenses")} total={report.total_operating_expenses} />
                                    {(report.operating_expenses.items || []).map((item, idx) => (
                                        <ItemRow key={idx} item={item} />
                                    ))}
                                    <TotalRow label={t("total_operating_expenses")} value={report.total_operating_expenses} />

                                    <TotalRow
                                        label={t("net_profit")}
                                        value={report.net_profit}
                                        color={money(report.net_profit) >= 0 ? "green.500" : "red.500"}
                                        highlight
                                    />
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>

                    {/* Breakdown by account */}
                    <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mt={6}>
                        <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                            <Text fontSize="md" fontWeight="600" mb={4}>
                                {t("income_breakdown")}
                            </Text>
                            <TableContainer>
                                <Table variant="striped" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th fontSize="xs" textTransform="uppercase">{t("account_name")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase" textAlign="center">{t("count")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("amount")}</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {(report.revenue.items || []).map((item, idx) => (
                                            <Tr key={idx}>
                                                <Td fontSize="sm" fontWeight="600">{item.name}</Td>
                                                <Td fontSize="sm" textAlign="center" color={colors.textMuted}>{item.transactions_count}</Td>
                                                <Td fontSize="sm" textAlign="right" fontWeight="600">{formatAmount(money(item.amount))}</Td>
                                            </Tr>
                                        ))}
                                        <Tr fontWeight="700" bg={colors.bgSubtle}>
                                            <Td fontSize="sm">{t("total_revenue")}</Td>
                                            <Td />
                                            <Td fontSize="sm" textAlign="right">{formatAmount(money(report.total_revenue))}</Td>
                                        </Tr>
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </Box>

                        <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                            <Text fontSize="md" fontWeight="600" mb={4}>
                                {t("expense_breakdown")}
                            </Text>
                            <TableContainer>
                                <Table variant="striped" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th fontSize="xs" textTransform="uppercase">{t("account_name")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase" textAlign="center">{t("count")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("amount")}</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {[...(report.cogs.items || []), ...(report.operating_expenses.items || [])].map((item, idx) => (
                                            <Tr key={idx}>
                                                <Td fontSize="sm" fontWeight="600">
                                                    {item.name}
                                                    {item.account_group === "purchase" && (
                                                        <Text as="span" fontSize="xs" color="orange.500" fontWeight="500" ml={2}>
                                                            {t("cost_of_goods_sold")}
                                                        </Text>
                                                    )}
                                                </Td>
                                                <Td fontSize="sm" textAlign="center" color={colors.textMuted}>{item.transactions_count}</Td>
                                                <Td fontSize="sm" textAlign="right" fontWeight="600">{formatAmount(money(item.amount))}</Td>
                                            </Tr>
                                        ))}
                                        <Tr fontWeight="700" bg={colors.bgSubtle}>
                                            <Td fontSize="sm">{t("total_expenses")}</Td>
                                            <Td />
                                            <Td fontSize="sm" textAlign="right">{formatAmount(money(report.total_expenses))}</Td>
                                        </Tr>
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Grid>

                    {/* Transactions */}
                    <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mt={6}>
                        <Text fontSize="md" fontWeight="600" mb={4}>
                            {t("income_transactions")} ({(report.income_transactions || []).length})
                        </Text>
                        {(report.income_transactions || []).length > 0 ? (
                            <TableContainer>
                                <Table variant="striped" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th fontSize="xs" textTransform="uppercase">{t("date")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase">{t("source")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase">{t("account_name")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase">{t("reference_number")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase">{t("payment_method")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("amount")}</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {(report.income_transactions || []).map((row, idx) => (
                                            <Tr key={idx}>
                                                <Td fontSize="sm">{row.date || "-"}</Td>
                                                <Td fontSize="sm">
                                                    <Badge colorScheme="green" variant="subtle" fontSize="xs">
                                                        {sourceLabels[row.source] || row.source || "-"}
                                                    </Badge>
                                                </Td>
                                                <Td fontSize="sm">{row.account || "-"}</Td>
                                                <Td fontSize="sm" fontFamily="mono" color={colors.textMuted}>{row.reference_number || "-"}</Td>
                                                <Td fontSize="sm" color={colors.textMuted}>{row.payment_method || "-"}</Td>
                                                <Td fontSize="sm" textAlign="right" fontWeight="600">{formatAmount(money(row.amount))}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Text fontSize="sm" color={colors.textMuted}>{t("no_transactions")}</Text>
                        )}
                    </Box>

                    <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mt={6}>
                        <Text fontSize="md" fontWeight="600" mb={4}>
                            {t("expense_transactions")} ({(report.expense_transactions || []).length})
                        </Text>
                        {(report.expense_transactions || []).length > 0 ? (
                            <TableContainer>
                                <Table variant="striped" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th fontSize="xs" textTransform="uppercase">{t("date")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase">{t("account_name")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase">{t("category")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase">{t("reference_number")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase">{t("payment_method")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase">{t("status")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("amount")}</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {(report.expense_transactions || []).map((row, idx) => (
                                            <Tr key={idx}>
                                                <Td fontSize="sm">{row.date || "-"}</Td>
                                                <Td fontSize="sm">{row.account || "-"}</Td>
                                                <Td fontSize="sm" color={colors.textMuted}>{row.category || "-"}</Td>
                                                <Td fontSize="sm" fontFamily="mono" color={colors.textMuted}>{row.reference_number || "-"}</Td>
                                                <Td fontSize="sm" color={colors.textMuted}>{row.payment_method || "-"}</Td>
                                                <Td fontSize="sm">
                                                    <Badge
                                                        colorScheme={row.status === "approved" ? "green" : row.status === "rejected" ? "red" : "orange"}
                                                        variant="subtle"
                                                        fontSize="xs"
                                                    >
                                                        {row.status || "-"}
                                                    </Badge>
                                                </Td>
                                                <Td fontSize="sm" textAlign="right" fontWeight="600">{formatAmount(money(row.amount))}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Text fontSize="sm" color={colors.textMuted}>{t("no_transactions")}</Text>
                        )}
                    </Box>
                </>
            )}
        </Box>
    );
}
