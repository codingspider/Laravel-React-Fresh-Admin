import React, { useEffect, useState, useCallback } from "react";
import {
    Box,
    Text,
    Badge,
    Grid,
    GridItem,
    useToast,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import api from "../../../axios";
import PageHeader from "../../ui/PageHeader";
import { GET_JOURNAL } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

export default function JournalEntryView() {
    const [entry, setEntry] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { id } = useParams();
    const { t } = useTranslation();
    const toast = useToast();
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(GET_JOURNAL(id));
            setEntry(res.data?.data || null);
        } catch (err) {
            console.error("fetchData error:", err);
            toast({
                title: t("error_fetching_data"),
                description: err.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    }, [id, t, toast]);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Journal Entry #${id}`;
        fetchData();
    }, [fetchData]);

    const typeColors = {
        debit: "green",
        credit: "blue",
    };

    const sourceColors = {
        income: "green",
        expense: "red",
        cash_bank: "blue",
    };

    if (isLoading) {
        return (
            <Box>
                <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" border="1px solid" borderColor={colors.borderDefault}>
                    <Text>{t("loading")}...</Text>
                </Box>
            </Box>
        );
    }

    if (!entry) {
        return (
            <Box>
                <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" border="1px solid" borderColor={colors.borderDefault}>
                    <Text color="red.500">{t("not_found")}</Text>
                </Box>
            </Box>
        );
    }

    return (
        <Box>
            <PageHeader
                title={`${t("journal_entry_details")} #${entry.id}`}
                subtitle={t("view_journal")}
                breadcrumbs={[
                    { label: t("dashboard"), path: "/dashboard" },
                    { label: t("journal_entries"), path: "/accounting/journal" },
                    { label: `#${entry.id}`, isCurrent: true },
                ]}
            />

            <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mb={6}>
                <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                    <GridItem>
                        <Text fontSize="xs" color="gray.500" mb={1}>{t("entry_date")}</Text>
                        <Text fontSize="sm" fontWeight="600">
                            {entry.entry_date ? new Date(entry.entry_date).toLocaleDateString() : "-"}
                        </Text>
                    </GridItem>
                    <GridItem>
                        <Text fontSize="xs" color="gray.500" mb={1}>{t("voucher_number")}</Text>
                        <Text fontSize="sm" fontWeight="600" fontFamily="mono">
                            {entry.voucher_number || "-"}
                        </Text>
                    </GridItem>
                    <GridItem>
                        <Text fontSize="xs" color="gray.500" mb={1}>{t("entry_type")}</Text>
                        <Badge
                            colorScheme={typeColors[entry.entry_type] || "gray"}
                            variant="subtle"
                            borderRadius="full"
                            px={2.5}
                            py={0.5}
                            fontSize="xs"
                            fontWeight="600"
                            textTransform="capitalize"
                            w="fit-content"
                        >
                            {t(entry.entry_type)}
                        </Badge>
                    </GridItem>
                    <GridItem>
                        <Text fontSize="xs" color="gray.500" mb={1}>{t("amount")}</Text>
                        <Text fontSize="sm" fontWeight="600">
                            {formatAmount(parseFloat(entry.amount || 0))}
                        </Text>
                    </GridItem>
                    <GridItem>
                        <Text fontSize="xs" color="gray.500" mb={1}>{t("account_name")}</Text>
                        <Text fontSize="sm" fontWeight="600">
                            {entry.account?.name || "-"}
                        </Text>
                    </GridItem>
                    <GridItem>
                        <Text fontSize="xs" color="gray.500" mb={1}>{t("account_code")}</Text>
                        <Text fontSize="sm" fontWeight="600">
                            {entry.account?.code || "-"}
                        </Text>
                    </GridItem>
                    <GridItem>
                        <Text fontSize="xs" color="gray.500" mb={1}>{t("source_module")}</Text>
                        <Badge
                            colorScheme={sourceColors[entry.source_module] || "gray"}
                            variant="subtle"
                            borderRadius="full"
                            px={2.5}
                            py={0.5}
                            fontSize="xs"
                            fontWeight="600"
                            textTransform="capitalize"
                            w="fit-content"
                        >
                            {t(entry.source_module) || entry.source_module || "-"}
                        </Badge>
                    </GridItem>
                    <GridItem>
                        <Text fontSize="xs" color="gray.500" mb={1}>{t("reference_number")}</Text>
                        <Text fontSize="sm" fontWeight="600" fontFamily="mono">
                            {entry.reference_number || "-"}
                        </Text>
                    </GridItem>
                </Grid>
            </Box>

            <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                <Text fontSize="xs" color="gray.500" mb={1}>{t("description")}</Text>
                <Text fontSize="sm" fontWeight="500">
                    {entry.description || t("no_description_available") || "-"}
                </Text>
            </Box>
        </Box>
    );
}
