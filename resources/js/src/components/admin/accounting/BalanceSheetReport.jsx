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
import { BALANCE_SHEET_REPORT } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

export default function BalanceSheetReport() {
    const [report, setReport] = useState(null);
    const [dateTo, setDateTo] = useState("");
    const { t } = useTranslation();
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();
    const toast = useToast();

    const fetchData = useCallback(async () => {
        if (!dateTo) {
            setDateTo(new Date().toISOString().split("T")[0]);
        }

        try {
            const res = await api.get(BALANCE_SHEET_REPORT, {
                params: { date_to: dateTo || new Date().toISOString().split("T")[0] },
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
        }
    }, [dateTo, t, toast]);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Balance Sheet`;
        fetchData();
    }, [fetchData]);

    const columns = [
        { header: t("account_code"), accessorKey: "code" },
        { header: t("account_name"), accessorKey: "name" },
        { header: t("account_type"), accessorKey: "type" },
        { header: t("balance"), accessorKey: "balance" },
    ];

    return (
        <Box>
            <PageHeader
                title={t("balance_sheet")}
                subtitle={t("manage_reports")}
                breadcrumbs={[
                    { label: t("dashboard"), path: "/dashboard" },
                    { label: t("balance_sheet"), isCurrent: true },
                ]}
            >
                <TableExportButtons data={report?.assets || []} columns={columns} filename="balance-sheet" />
            </PageHeader>

            <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mb={6}>
                <Grid templateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap={4} alignItems="flex-end">
                    <GridItem>
                        <Text fontSize="xs" color="gray.500" mb={1}>{t("date_to") || "As Of Date"}</Text>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => { setDateTo(e.target.value); fetchData(); }}
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
            </Box>

            {report && (
                <>
                    <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mb={6}>
                        <Grid templateColumns="repeat(auto-fit, minmax(140px, 1fr))" gap={4}>
                            <GridItem>
                                <Text fontSize="xs" color="gray.500">{t("total_assets")}</Text>
                                <Text fontSize="lg" fontWeight="700" color="green.500">
                                    {formatAmount(parseFloat(report.total_assets || 0))}
                                </Text>
                            </GridItem>
                            <GridItem>
                                <Text fontSize="xs" color="gray.500">{t("total_liabilities")}</Text>
                                <Text fontSize="lg" fontWeight="700" color="red.500">
                                    {formatAmount(parseFloat(report.total_liabilities || 0))}
                                </Text>
                            </GridItem>
                            <GridItem>
                                <Text fontSize="xs" color="gray.500">{t("total_equity")}</Text>
                                <Text fontSize="lg" fontWeight="700" color="blue.500">
                                    {formatAmount(parseFloat(report.total_equity || 0))}
                                </Text>
                            </GridItem>
                            <GridItem>
                                <Text fontSize="xs" color="gray.500">{t("total_liabilities_and_equity")}</Text>
                                <Text fontSize="lg" fontWeight="700" color="purple.500">
                                    {formatAmount(parseFloat(report.total_liabilities_and_equity || 0))}
                                </Text>
                            </GridItem>
                        </Grid>
                    </Box>

                    <Grid templateColumns="1fr 1fr" gap={6}>
                        <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                            <Text fontSize="md" fontWeight="600" mb={4} color="green.400">{t("total_assets")}</Text>
                            <TableContainer>
                                <Table variant="striped" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th fontSize="xs" textTransform="uppercase">{t("account_code")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase">{t("account_name")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("balance")}</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {(report.assets || []).length === 0 ? (
                                            <Tr>
                                                <Td colSpan="3" textAlign="center" py={4}>
                                                    <Text color="gray.500">{t("no_entries_found")}</Text>
                                                </Td>
                                            </Tr>
                                        ) : (
                                            report.assets.map((item) => (
                                                <Tr key={item.account.id}>
                                                    <Td fontSize="sm" fontFamily="mono">{item.account.code || "-"}</Td>
                                                    <Td fontSize="sm" fontWeight="600">{item.account.name || "-"}</Td>
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

                        <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                            <Text fontSize="md" fontWeight="600" mb={4} color="red.400">{t("total_liabilities")}</Text>
                            <TableContainer>
                                <Table variant="striped" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th fontSize="xs" textTransform="uppercase">{t("account_code")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase">{t("account_name")}</Th>
                                            <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("balance")}</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {(report.liabilities || []).length === 0 ? (
                                            <Tr>
                                                <Td colSpan="3" textAlign="center" py={4}>
                                                    <Text color="gray.500">{t("no_entries_found")}</Text>
                                                </Td>
                                            </Tr>
                                        ) : (
                                            report.liabilities.map((item) => (
                                                <Tr key={item.account.id}>
                                                    <Td fontSize="sm" fontFamily="mono">{item.account.code || "-"}</Td>
                                                    <Td fontSize="sm" fontWeight="600">{item.account.name || "-"}</Td>
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
                    </Grid>

                    <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mt={6}>
                        <Text fontSize="md" fontWeight="600" mb={4} color="blue.400">{t("total_equity")}</Text>
                        <TableContainer>
                            <Table variant="striped" size="sm">
                                <Thead>
                                    <Tr>
                                        <Th fontSize="xs" textTransform="uppercase">{t("account_code")}</Th>
                                        <Th fontSize="xs" textTransform="uppercase">{t("account_name")}</Th>
                                        <Th fontSize="xs" textTransform="uppercase" textAlign="right">{t("balance")}</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {(report.equity || []).length === 0 ? (
                                        <Tr>
                                            <Td colSpan="3" textAlign="center" py={4}>
                                                <Text color="gray.500">{t("no_entries_found")}</Text>
                                            </Td>
                                        </Tr>
                                    ) : (
                                        report.equity.map((item) => (
                                            <Tr key={item.account.id}>
                                                <Td fontSize="sm" fontFamily="mono">{item.account.code || "-"}</Td>
                                                <Td fontSize="sm" fontWeight="600">{item.account.name || "-"}</Td>
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
                </>
            )}
        </Box>
    );
}
