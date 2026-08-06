import React, { useCallback, useEffect, useState } from "react";
import {
    Box,
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
    Spinner,
    useToast,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import api from "../../../axios";
import PageHeader from "../../ui/PageHeader";
import ReportExport from "../../ui/ReportExport";
import ReportSummaryCard from "./ReportSummaryCard";
import { REPORT_META, REPORT_EXPENSES } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

export default function ExpenseReport() {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const toast = useToast();
    const { formatAmount } = useCurrencyFormatter();

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [meta, setMeta] = useState({ branches: [], expense_categories: [], payment_methods: [] });
    const [dateFrom, setDateFrom] = useState(monthStart.toISOString().slice(0, 10));
    const [dateTo, setDateTo] = useState(today.toISOString().slice(0, 10));
    const [branchId, setBranchId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
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

    useEffect(() => {
        api.get(REPORT_META)
            .then((res) => {
                const data = res.data?.data || {};
                setMeta({
                    branches: data.branches || [],
                    expense_categories: data.expense_categories || [],
                    payment_methods: data.payment_methods || [],
                });
            })
            .catch(() => {});
    }, []);

    const fetchReport = useCallback(async () => {
        if (!dateFrom || !dateTo) {
            toast({ title: t("date_range_required"), status: "warning", duration: 3000, isClosable: true });
            return;
        }
        setLoading(true);
        try {
            const res = await api.get(REPORT_EXPENSES, {
                params: {
                    date_from: dateFrom,
                    date_to: dateTo,
                    branch_id: branchId || undefined,
                    expense_category_id: categoryId || undefined,
                    payment_method: paymentMethod || undefined,
                },
            });
            setReport(res.data?.data || null);
        } catch (err) {
            console.error("fetchReport error:", err);
            toast({ title: t("error_fetching_data"), status: "error", duration: 3000, isClosable: true });
        } finally {
            setLoading(false);
        }
    }, [dateFrom, dateTo, branchId, categoryId, paymentMethod, t, toast]);

    useEffect(() => {
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        { header: t("date"), accessorKey: "date" },
        { header: t("reference_number"), accessorKey: "reference_number" },
        { header: t("category"), accessorKey: "category_name" },
        { header: t("branch"), accessorKey: "branch" },
        { header: t("supplier"), accessorKey: "supplier" },
        { header: t("payment_method"), accessorKey: "payment_method" },
        { header: t("amount"), accessorKey: "amount" },
        { header: t("status"), accessorKey: "status" },
    ];

    const rows = (report?.rows || []).map((row) => ({
        ...row,
        category_name: row.category_name || "-",
        branch: row.branch || "-",
        supplier: row.supplier || "-",
        payment_method: (row.payment_method || "-").replace(/_/g, " "),
        amount: formatAmount(parseFloat(row.amount || 0)),
    }));

    const period = `${dateFrom} - ${dateTo}`;
    const summary = report?.summary || {};
    const stats = [
        { label: t("total_expenses"), value: summary.total_expenses ?? 0 },
        { label: t("total_amount"), value: formatAmount(parseFloat(summary.total_amount || 0)), color: "red.500" },
    ];
    const summaryRows = [
        { label: t("total_expenses"), value: summary.total_expenses ?? 0 },
        { label: t("total_amount"), value: formatAmount(parseFloat(summary.total_amount || 0)) },
    ];

    return (
        <Box>
            <PageHeader
                title={t("expense_report")}
                subtitle={t("expense_report_subtitle")}
                breadcrumbs={[
                    { label: t("dashboard"), path: "/dashboard" },
                    { label: t("reports"), path: "/reports/expenses" },
                    { label: t("expense_report"), isCurrent: true },
                ]}
            >
                <ReportExport
                    title={t("expense_report")}
                    period={period}
                    columns={columns}
                    rows={rows}
                    summary={summaryRows}
                    filename="expense-report"
                />
            </PageHeader>

            <Box
                bg={colors.bgCard}
                p={{ base: 4, md: 6 }}
                borderRadius="xl"
                boxShadow="card"
                border="1px solid"
                borderColor={colors.borderDefault}
                mb={6}
            >
                <Grid templateColumns={{ base: "1fr", md: "repeat(6, 1fr)" }} gap={4} alignItems="flex-end">
                    <GridItem>
                        <Text fontSize="xs" fontWeight="500" color={colors.textSecondary} mb={1}>
                            {t("date_from")}
                        </Text>
                        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} {...filterProps} />
                    </GridItem>
                    <GridItem>
                        <Text fontSize="xs" fontWeight="500" color={colors.textSecondary} mb={1}>
                            {t("date_to")}
                        </Text>
                        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} {...filterProps} />
                    </GridItem>
                    <GridItem>
                        <Text fontSize="xs" fontWeight="500" color={colors.textSecondary} mb={1}>
                            {t("branch")}
                        </Text>
                        <Select value={branchId} onChange={(e) => setBranchId(e.target.value)} placeholder={t("all_branches")} {...filterProps}>
                            {meta.branches.map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </Select>
                    </GridItem>
                    <GridItem>
                        <Text fontSize="xs" fontWeight="500" color={colors.textSecondary} mb={1}>
                            {t("category")}
                        </Text>
                        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} placeholder={t("all_categories")} {...filterProps}>
                            {meta.expense_categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </Select>
                    </GridItem>
                    <GridItem>
                        <Text fontSize="xs" fontWeight="500" color={colors.textSecondary} mb={1}>
                            {t("payment_method")}
                        </Text>
                        <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} placeholder={t("all_payment_methods")} {...filterProps}>
                            {meta.payment_methods.map((pm) => (
                                <option key={pm} value={pm}>{pm.replace(/_/g, " ")}</option>
                            ))}
                        </Select>
                    </GridItem>
                    <GridItem>
                        <Button
                            colorScheme="teal"
                            bg="teal.500"
                            color="white"
                            fontWeight="semibold"
                            px={6}
                            h={10}
                            borderRadius="md"
                            _hover={{ bg: "teal.600" }}
                            _active={{ bg: "teal.700" }}
                            onClick={fetchReport}
                            isLoading={loading}
                            w={{ base: "100%", md: "auto" }}
                        >
                            {t("generate_report")}
                        </Button>
                    </GridItem>
                </Grid>
            </Box>

            {loading && (
                <Box textAlign="center" py={16}>
                    <Spinner color="teal.500" size="xl" />
                </Box>
            )}

            {report && !loading && (
                <>
                    <Box mb={6}>
                        <ReportSummaryCard stats={stats} />
                    </Box>

                    {report.by_category?.length > 0 && (
                        <Box bg={colors.bgCard} p={{ base: 4, md: 5 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mb={6}>
                            <Text fontSize="md" fontWeight="600" mb={3}>{t("by_category")}</Text>
                            <TableContainer>
                                <Table variant="striped" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th fontSize="xs" textTransform="uppercase">{t("category")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("count")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("total")}</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {report.by_category.map((item, i) => (
                                            <Tr key={i}>
                                                <Td fontSize="sm">{item.key}</Td>
                                                <Td fontSize="sm" textAlign="right">{item.count}</Td>
                                                <Td fontSize="sm" textAlign="right" fontWeight="600">{formatAmount(parseFloat(item.total || 0))}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    <Box bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} overflow="hidden">
                        <Box px={{ base: 4, md: 6 }} py={4} borderBottom="1px solid" borderColor={colors.borderDefault}>
                            <Text fontSize="md" fontWeight="600">{t("expense_details")}</Text>
                        </Box>
                        {rows.length === 0 ? (
                            <Box p={10} textAlign="center">
                                <Text fontSize="sm" color={colors.textSecondary}>{t("no_data_found")}</Text>
                            </Box>
                        ) : (
                            <Box overflowX="auto">
                                <Table variant="striped" size="sm">
                                    <Thead>
                                        <Tr>
                                            {columns.map((col, i) => (
                                                <Th key={i} fontSize="xs" textTransform="uppercase" whiteSpace="nowrap">{col.header}</Th>
                                            ))}
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {rows.map((row, i) => (
                                            <Tr key={i} _hover={{ bg: colors.bgHover }} transition="background 0.15s ease">
                                                <Td fontSize="sm" whiteSpace="nowrap">{row.date}</Td>
                                                <Td fontSize="sm" fontFamily="mono">{row.reference_number}</Td>
                                                <Td fontSize="sm">{row.category_name}</Td>
                                                <Td fontSize="sm">{row.branch}</Td>
                                                <Td fontSize="sm">{row.supplier}</Td>
                                                <Td fontSize="sm" textTransform="capitalize">{row.payment_method}</Td>
                                                <Td fontSize="sm" textAlign="right" fontWeight="600" color="red.500">{row.amount}</Td>
                                                <Td>
                                                    <Badge
                                                        colorScheme={row.status === "completed" ? "green" : "yellow"}
                                                        variant="subtle"
                                                        borderRadius="full"
                                                        px={2.5}
                                                        py={0.5}
                                                        fontSize="xs"
                                                        textTransform="capitalize"
                                                    >
                                                        {(row.status || "-").replace(/_/g, " ")}
                                                    </Badge>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        )}
                    </Box>
                </>
            )}
        </Box>
    );
}
