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
import { CASH_FLOW_REPORT } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

export default function CashFlowReport() {
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
            const res = await api.get(CASH_FLOW_REPORT, {
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
        document.title = `${app_name} | Cash Flow`;
    }, []);

    const handleGenerate = () => {
        fetchData();
    };

    const columns = [
        { header: t("source_module"), accessorKey: "source_module" },
        { header: t("debit"), accessorKey: "debit" },
        { header: t("credit"), accessorKey: "credit" },
    ];

    return (
        <Box>
            <PageHeader
                title={t("cash_flow")}
                subtitle={t("manage_reports")}
                breadcrumbs={[
                    { label: t("dashboard"), path: "/dashboard" },
                    { label: t("cash_flow"), isCurrent: true },
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
                <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                    <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={4} mb={6}>
                        <GridItem>
                            <Text fontSize="xs" color="gray.500">{t("operating_activities")}</Text>
                            <Text fontSize="lg" fontWeight="700" color="green.500">
                                {formatAmount(parseFloat((report.operating_activities?.income || 0) - (report.operating_activities?.expenses || 0)))}
                            </Text>
                        </GridItem>
                        <GridItem>
                            <Text fontSize="xs" color="gray.500">{t("investing_activities")}</Text>
                            <Text fontSize="lg" fontWeight="700" color="blue.500">
                                {formatAmount(parseFloat((report.investing_activities?.deposits || 0) - (report.investing_activities?.withdrawals || 0)))}
                            </Text>
                        </GridItem>
                        <GridItem>
                            <Text fontSize="xs" color="gray.500">{t("net_cash_flow") || "Net Cash Flow"}</Text>
                            <Text fontSize="lg" fontWeight="700" color="purple.500">
                                {formatAmount(parseFloat(report.net_cash_flow || 0))}
                            </Text>
                        </GridItem>
                    </Grid>

                    <TableContainer>
                        <Table variant="striped" size="sm">
                            <Thead>
                                <Tr>
                                    <Th fontSize="xs" textTransform="uppercase">{t("account")}</Th>
                                    <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("debit")}</Th>
                                    <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("credit")}</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {report.operating_activities && (
                                    <>
                                        <Tr>
                                            <Td fontSize="sm" fontWeight="600">{t("total_income")}</Td>
                                            <Td fontSize="sm" textAlign="right">{formatAmount(parseFloat(report.operating_activities.income || 0))}</Td>
                                            <Td fontSize="sm" textAlign="right">-</Td>
                                        </Tr>
                                        <Tr>
                                            <Td fontSize="sm" fontWeight="600">{t("total_expenses")}</Td>
                                            <Td fontSize="sm" textAlign="right">{formatAmount(parseFloat(report.operating_activities.expenses || 0))}</Td>
                                            <Td fontSize="sm" textAlign="right">-</Td>
                                        </Tr>
                                    </>
                                )}
                                {report.investing_activities && (
                                    <>
                                        <Tr>
                                            <Td fontSize="sm" fontWeight="600">{t("deposits")}</Td>
                                            <Td fontSize="sm" textAlign="right">{formatAmount(parseFloat(report.investing_activities.deposits || 0))}</Td>
                                            <Td fontSize="sm" textAlign="right">-</Td>
                                        </Tr>
                                        <Tr>
                                            <Td fontSize="sm" fontWeight="600">{t("withdrawals")}</Td>
                                            <Td fontSize="sm" textAlign="right">{formatAmount(parseFloat(report.investing_activities.withdrawals || 0))}</Td>
                                            <Td fontSize="sm" textAlign="right">-</Td>
                                        </Tr>
                                    </>
                                )}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Box>
    );
}
