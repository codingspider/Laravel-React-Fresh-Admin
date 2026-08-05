import React, { useEffect, useState, useCallback } from "react";
import {
    Box,
    Text,
    Grid,
    GridItem,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    useToast,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import api from "../../../axios";
import PageHeader from "../../ui/PageHeader";
import TableExportButtons from "../../ui/TableExportButtons";
import { PROFIT_LOSS_REPORT } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

export default function ProfitLossReport() {
    const [report, setReport] = useState(null);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();
    const toast = useToast();

    const fetchData = useCallback(async () => {
        if (!dateFrom || !dateTo) return;

        setLoading(true);
        try {
            const res = await api.get(PROFIT_LOSS_REPORT, {
                params: { date_from: dateFrom, date_to: dateTo },
            });
            setReport(res.data?.data || null);
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
        document.title = `${app_name} | Profit & Loss`;
    }, []);

    const handleGenerate = () => {
        fetchData();
    };

    const columns = [
        { header: t("account_code"), accessorKey: "code" },
        { header: t("account_name"), accessorKey: "name" },
        { header: t("amount"), accessorKey: "amount" },
    ];

    return (
        <Box>
            <PageHeader
                title={t("profit_loss_report")}
                subtitle={t("manage_reports")}
                breadcrumbs={[
                    { label: t("dashboard"), path: "/dashboard" },
                    { label: t("profit_loss_report"), isCurrent: true },
                ]}
            />

            <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mb={6}>
                <Grid templateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap={4} alignItems="flex-end">
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
                    <GridItem>
                        <Text
                            fontSize="sm"
                            fontWeight="600"
                            cursor="pointer"
                            onClick={handleGenerate}
                            color="teal.500"
                            _hover={{ textDecoration: "underline" }}
                        >
                            {t("generate_report")}
                        </Text>
                    </GridItem>
                </Grid>
            </Box>

            {report && (
                <>
                    <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mb={6}>
                        <Grid templateColumns="repeat(auto-fit, minmax(140px, 1fr))" gap={4}>
                            <GridItem>
                                <Text fontSize="xs" color="gray.500">{t("total_income")}</Text>
                                <Text fontSize="lg" fontWeight="700" color="green.500">
                                    {formatAmount(parseFloat(report.total_income || 0))}
                                </Text>
                            </GridItem>
                            <GridItem>
                                <Text fontSize="xs" color="gray.500">{t("total_expenses")}</Text>
                                <Text fontSize="lg" fontWeight="700" color="red.500">
                                    {formatAmount(parseFloat(report.total_expenses || 0))}
                                </Text>
                            </GridItem>
                            <GridItem>
                                <Text fontSize="xs" color="gray.500">{t("net_profit")}</Text>
                                <Text fontSize="lg" fontWeight="700" color={(report.net_profit >= 0 ? "green.500" : "red.500")}>
                                    {formatAmount(parseFloat(report.net_profit || 0))}
                                </Text>
                            </GridItem>
                        </Grid>
                    </Box>

                    <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mb={6}>
                        <Text fontSize="md" fontWeight="600" mb={4}>{t("income_breakdown")}</Text>
                        <TableContainer>
                            <Table variant="striped" size="sm">
                                <Thead>
                                    <Tr>
                                        <Th fontSize="xs" textTransform="uppercase">{t("account_code")}</Th>
                                        <Th fontSize="xs" textTransform="uppercase">{t("account_name")}</Th>
                                        <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("amount")}</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {Object.entries(report.income_breakdown || {}).map(([key, item]) => (
                                        <Tr key={key}>
                                            <Td fontSize="sm" fontFamily="mono">{item.account?.code || "-"}</Td>
                                            <Td fontSize="sm" fontWeight="600">{item.account?.name || "-"}</Td>
                                            <Td fontSize="sm" textAlign="right" fontWeight="600">
                                                {formatAmount(parseFloat(item.total || 0))}
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>

                    <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                        <Text fontSize="md" fontWeight="600" mb={4}>{t("expense_breakdown")}</Text>
                        <TableContainer>
                            <Table variant="striped" size="sm">
                                <Thead>
                                    <Tr>
                                        <Th fontSize="xs" textTransform="uppercase">{t("account_code")}</Th>
                                        <Th fontSize="xs" textTransform="uppercase">{t("account_name")}</Th>
                                        <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("amount")}</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {Object.entries(report.expense_breakdown || {}).map(([key, item]) => (
                                        <Tr key={key}>
                                            <Td fontSize="sm" fontFamily="mono">{item.account?.code || "-"}</Td>
                                            <Td fontSize="sm" fontWeight="600">{item.account?.name || "-"}</Td>
                                            <Td fontSize="sm" textAlign="right" fontWeight="600">
                                                {formatAmount(parseFloat(item.total || 0))}
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                </>
            )}
        </Box>
    );
}
