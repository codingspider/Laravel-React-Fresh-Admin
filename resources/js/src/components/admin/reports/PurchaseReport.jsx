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
import { REPORT_META, REPORT_PURCHASES } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";
import { usePermission } from "../../../context/PermissionContext";

const ADMIN_ROLES = ['super_admin', 'admin', 'restaurant_owner'];

export default function PurchaseReport() {
    const { t } = useTranslation();
    const { user } = usePermission();
    const colors = useThemeColors();
    const toast = useToast();
    const { formatAmount } = useCurrencyFormatter();

    const isAdmin = user?.roles?.some((role) => ADMIN_ROLES.includes(role));
    const userBranchId = user?.branch_id || null;

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [meta, setMeta] = useState({ branches: [], suppliers: [], purchase_statuses: [] });
    const [dateFrom, setDateFrom] = useState(monthStart.toISOString().slice(0, 10));
    const [dateTo, setDateTo] = useState(today.toISOString().slice(0, 10));
    const [branchId, setBranchId] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [status, setStatus] = useState("");
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
                    suppliers: data.suppliers || [],
                    purchase_statuses: data.purchase_statuses || [],
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
            const params = {
                date_from: dateFrom,
                date_to: dateTo,
                supplier_id: supplierId || undefined,
                status: status || undefined,
            };
            if (isAdmin) {
                params.branch_id = branchId || undefined;
            } else if (userBranchId) {
                params.branch_id = userBranchId;
            }
            const res = await api.get(REPORT_PURCHASES, { params });
            setReport(res.data?.data || null);
        } catch (err) {
            console.error("fetchReport error:", err);
            toast({ title: t("error_fetching_data"), status: "error", duration: 3000, isClosable: true });
        } finally {
            setLoading(false);
        }
    }, [dateFrom, dateTo, branchId, supplierId, status, t, toast, isAdmin, userBranchId]);

    useEffect(() => {
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        { header: t("invoice_number"), accessorKey: "invoice_number" },
        { header: t("date"), accessorKey: "date" },
        { header: t("supplier"), accessorKey: "supplier" },
        { header: t("branch"), accessorKey: "branch" },
        { header: t("order_type"), accessorKey: "order_type" },
        { header: t("subtotal"), accessorKey: "subtotal" },
        { header: t("discount"), accessorKey: "discount_amount" },
        { header: t("tax_amount"), accessorKey: "tax_amount" },
        { header: t("shipping_cost"), accessorKey: "shipping_cost" },
        { header: t("total"), accessorKey: "total" },
        { header: t("paid"), accessorKey: "paid_amount" },
        { header: t("due"), accessorKey: "due_amount" },
        { header: t("status"), accessorKey: "status" },
    ];

    const rows = (report?.rows || []).map((row) => ({
        ...row,
        order_type: (row.order_type || "-").replace(/_/g, " "),
        supplier: row.supplier || "-",
        branch: row.branch || "-",
        subtotal: formatAmount(parseFloat(row.subtotal || 0)),
        discount_amount: formatAmount(parseFloat(row.discount_amount || 0)),
        tax_amount: formatAmount(parseFloat(row.tax_amount || 0)),
        shipping_cost: formatAmount(parseFloat(row.shipping_cost || 0)),
        total: formatAmount(parseFloat(row.total || 0)),
        paid_amount: formatAmount(parseFloat(row.paid_amount || 0)),
        due_amount: formatAmount(parseFloat(row.due_amount || 0)),
    }));

    const period = `${dateFrom} - ${dateTo}`;
    const summary = report?.summary || {};
    const stats = [
        { label: t("total_purchases"), value: summary.total_purchases ?? 0 },
        { label: t("subtotal"), value: formatAmount(parseFloat(summary.subtotal || 0)) },
        { label: t("discount"), value: formatAmount(parseFloat(summary.discount_amount || 0)) },
        { label: t("tax_amount"), value: formatAmount(parseFloat(summary.tax_amount || 0)) },
        { label: t("shipping_cost"), value: formatAmount(parseFloat(summary.shipping_cost || 0)) },
        { label: t("total_amount"), value: formatAmount(parseFloat(summary.total_amount || 0)), color: "green.500" },
        { label: t("amount_paid"), value: formatAmount(parseFloat(summary.paid_amount || 0)) },
        { label: t("due"), value: formatAmount(parseFloat(summary.due_amount || 0)), color: "red.500" },
    ];
    const summaryRows = [
        { label: t("total_purchases"), value: summary.total_purchases ?? 0 },
        { label: t("total_amount"), value: formatAmount(parseFloat(summary.total_amount || 0)) },
        { label: t("tax_amount"), value: formatAmount(parseFloat(summary.tax_amount || 0)) },
        { label: t("discount"), value: formatAmount(parseFloat(summary.discount_amount || 0)) },
        { label: t("shipping_cost"), value: formatAmount(parseFloat(summary.shipping_cost || 0)) },
        { label: t("amount_paid"), value: formatAmount(parseFloat(summary.paid_amount || 0)) },
        { label: t("due"), value: formatAmount(parseFloat(summary.due_amount || 0)) },
    ];

    return (
        <Box>
            <PageHeader
                title={t("purchase_report")}
                subtitle={t("purchase_report_subtitle")}
                breadcrumbs={[
                    { label: t("dashboard"), path: "/dashboard" },
                    { label: t("reports"), path: "/reports/purchases" },
                    { label: t("purchase_report"), isCurrent: true },
                ]}
            >
                <ReportExport
                    title={t("purchase_report")}
                    period={period}
                    columns={columns}
                    rows={rows}
                    summary={summaryRows}
                    filename="purchase-report"
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
                    {isAdmin && (
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
                    )}
                    <GridItem>
                        <Text fontSize="xs" fontWeight="500" color={colors.textSecondary} mb={1}>
                            {t("supplier")}
                        </Text>
                        <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} placeholder={t("all_suppliers")} {...filterProps}>
                            {meta.suppliers.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </Select>
                    </GridItem>
                    <GridItem>
                        <Text fontSize="xs" fontWeight="500" color={colors.textSecondary} mb={1}>
                            {t("status")}
                        </Text>
                        <Select value={status} onChange={(e) => setStatus(e.target.value)} placeholder={t("all_status")} {...filterProps}>
                            {meta.purchase_statuses.map((s) => (
                                <option key={s} value={s}>{s}</option>
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

                    {report.by_status?.length > 0 && (
                        <Box bg={colors.bgCard} p={{ base: 4, md: 5 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mb={6}>
                            <Text fontSize="md" fontWeight="600" mb={3}>{t("by_status")}</Text>
                            <TableContainer>
                                <Table variant="striped" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th fontSize="xs" textTransform="uppercase">{t("status")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("count")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("total")}</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {report.by_status.map((item, i) => (
                                            <Tr key={i}>
                                                <Td fontSize="sm" textTransform="capitalize">{item.key}</Td>
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
                            <Text fontSize="md" fontWeight="600">{t("purchase_details")}</Text>
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
                                                <Td fontSize="sm" fontFamily="mono" whiteSpace="nowrap">{row.invoice_number}</Td>
                                                <Td fontSize="sm" whiteSpace="nowrap">{row.date}</Td>
                                                <Td fontSize="sm">{row.supplier}</Td>
                                                <Td fontSize="sm">{row.branch}</Td>
                                                <Td fontSize="sm" textTransform="capitalize">{row.order_type}</Td>
                                                <Td fontSize="sm" textAlign="right">{row.subtotal}</Td>
                                                <Td fontSize="sm" textAlign="right">{row.discount_amount}</Td>
                                                <Td fontSize="sm" textAlign="right">{row.tax_amount}</Td>
                                                <Td fontSize="sm" textAlign="right">{row.shipping_cost}</Td>
                                                <Td fontSize="sm" textAlign="right" fontWeight="600">{row.total}</Td>
                                                <Td fontSize="sm" textAlign="right">{row.paid_amount}</Td>
                                                <Td fontSize="sm" textAlign="right" color="red.500">{row.due_amount}</Td>
                                                <Td>
                                                    <Badge
                                                        colorScheme={row.status === "active" ? "green" : "gray"}
                                                        variant="subtle"
                                                        borderRadius="full"
                                                        px={2.5}
                                                        py={0.5}
                                                        fontSize="xs"
                                                        textTransform="capitalize"
                                                    >
                                                        {row.status || "-"}
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
