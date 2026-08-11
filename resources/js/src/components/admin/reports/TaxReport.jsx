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
import { REPORT_META, REPORT_TAXES } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";
import { usePermission } from "../../../context/PermissionContext";

const ADMIN_ROLES = ['super_admin', 'admin', 'restaurant_owner'];

export default function TaxReport() {
    const { t } = useTranslation();
    const { user } = usePermission();
    const colors = useThemeColors();
    const toast = useToast();
    const { formatAmount } = useCurrencyFormatter();

    const isAdmin = user?.roles?.some((role) => ADMIN_ROLES.includes(role));
    const userBranchId = user?.branch_id || null;

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

    useEffect(() => {
        api.get(REPORT_META)
            .then((res) => {
                const data = res.data?.data || {};
                setMeta({ branches: data.branches || [] });
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
            };
            if (isAdmin) {
                params.branch_id = branchId || undefined;
            } else if (userBranchId) {
                params.branch_id = userBranchId;
            }
            const res = await api.get(REPORT_TAXES, { params });
            setReport(res.data?.data || null);
        } catch (err) {
            console.error("fetchReport error:", err);
            toast({ title: t("error_fetching_data"), status: "error", duration: 3000, isClosable: true });
        } finally {
            setLoading(false);
        }
    }, [dateFrom, dateTo, branchId, t, toast, isAdmin, userBranchId]);

    useEffect(() => {
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        { header: t("date"), accessorKey: "date" },
        { header: t("type"), accessorKey: "type" },
        { header: t("reference"), accessorKey: "reference" },
        { header: t("tax_rate"), accessorKey: "tax_rate" },
        { header: t("tax_amount"), accessorKey: "tax_amount" },
    ];

    const rows = (report?.rows || []).map((row) => ({
        ...row,
        type: row.type === "sale" ? t("output_tax") : t("input_tax"),
        reference: row.reference || "-",
        tax_rate: row.tax_rate !== null && row.tax_rate !== undefined ? `${parseFloat(row.tax_rate)}%` : "-",
        tax_amount: formatAmount(parseFloat(row.tax_amount || 0)),
    }));

    const period = `${dateFrom} - ${dateTo}`;
    const summary = report?.summary || {};
    const stats = [
        { label: t("output_tax"), value: formatAmount(parseFloat(summary.output_tax || 0)) },
        { label: t("input_tax"), value: formatAmount(parseFloat(summary.input_tax || 0)) },
        {
            label: t("net_tax"),
            value: formatAmount(parseFloat(summary.net_tax || 0)),
            color: parseFloat(summary.net_tax || 0) >= 0 ? "green.500" : "red.500",
        },
        { label: t("output_entries"), value: summary.output_entries ?? 0 },
        { label: t("input_entries"), value: summary.input_entries ?? 0 },
    ];
    const summaryRows = [
        { label: t("output_tax"), value: formatAmount(parseFloat(summary.output_tax || 0)) },
        { label: t("input_tax"), value: formatAmount(parseFloat(summary.input_tax || 0)) },
        { label: t("net_tax"), value: formatAmount(parseFloat(summary.net_tax || 0)) },
        { label: t("output_entries"), value: summary.output_entries ?? 0 },
        { label: t("input_entries"), value: summary.input_entries ?? 0 },
    ];

    return (
        <Box>
            <PageHeader
                title={t("tax_report")}
                subtitle={t("tax_report_subtitle")}
                breadcrumbs={[
                    { label: t("dashboard"), path: "/dashboard" },
                    { label: t("reports"), path: "/reports/taxes" },
                    { label: t("tax_report"), isCurrent: true },
                ]}
            >
                <ReportExport
                    title={t("tax_report")}
                    period={period}
                    columns={columns}
                    rows={rows}
                    summary={summaryRows}
                    filename="tax-report"
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
                <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4} alignItems="flex-end">
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

                    <Box bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} overflow="hidden">
                        <Box px={{ base: 4, md: 6 }} py={4} borderBottom="1px solid" borderColor={colors.borderDefault}>
                            <Text fontSize="md" fontWeight="600">{t("tax_details")}</Text>
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
                                                <Td>
                                                    <Badge
                                                        colorScheme={row.type === t("output_tax") ? "green" : "blue"}
                                                        variant="subtle"
                                                        borderRadius="full"
                                                        px={2.5}
                                                        py={0.5}
                                                        fontSize="xs"
                                                    >
                                                        {row.type}
                                                    </Badge>
                                                </Td>
                                                <Td fontSize="sm" fontFamily="mono">{row.reference}</Td>
                                                <Td fontSize="sm">{row.tax_rate}</Td>
                                                <Td fontSize="sm" textAlign="right" fontWeight="600">{row.tax_amount}</Td>
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
