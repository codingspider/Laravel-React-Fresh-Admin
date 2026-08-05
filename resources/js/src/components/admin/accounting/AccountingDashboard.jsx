import React, { useEffect, useState, useCallback } from "react";
import {
    Box,
    Grid,
    Text,
    Flex,
    Heading,
    HStack,
    VStack,
    useToast,
} from "@chakra-ui/react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    FileText,
    Wallet,
    Clock,
} from "lucide-react";
import api from "../../../axios";
import PageHeader from "../../ui/PageHeader";
import StatCard from "../../ui/StatCard";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";
import { ACCOUNTING_DASHBOARD } from "../../../routes/apiRoutes";

const COLORS = ["#0D9488", "#F59E0B", "#8B5CF6"];

const CustomTooltip = ({ active, payload, label }) => {
    const colors = useThemeColors();
    if (!active || !payload?.length) return null;
    return (
        <Box
            bg={colors.bgCard}
            p={3}
            borderRadius="lg"
            boxShadow="lg"
            border="1px solid"
            borderColor={colors.borderDefault}
        >
            <Text fontSize="sm" fontWeight="600" mb={1}>{label}</Text>
            {payload.map((entry, i) => (
                <Text key={i} fontSize="xs" color={entry.color}>
                    {entry.name}: {entry.value}
                </Text>
            ))}
        </Box>
    );
};

export default function AccountingDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();
    const toast = useToast();
    const bg = colors.bgCard;
    const borderColor = colors.borderDefault;

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(ACCOUNTING_DASHBOARD);
            setDashboard(res.data?.data || null);
        } catch (err) {
            console.error("fetchData error:", err);
            toast({
                title: t("error_fetching_data"),
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    }, [t, toast]);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Accounting Dashboard`;
        fetchData();
    }, [fetchData]);

    const stats = dashboard ? [
        {
            title: t("today_sales"),
            value: formatAmount(parseFloat(dashboard.today?.sales || 0)),
            change: "",
            trend: dashboard.today?.sales >= 0 ? "up" : "down",
            icon: DollarSign,
            iconColor: "green.600",
            iconBg: "green.50",
        },
        {
            title: t("today_expenses"),
            value: formatAmount(parseFloat(dashboard.today?.expenses || 0)),
            change: "",
            trend: dashboard.today?.expenses >= 0 ? "down" : "up",
            icon: ShoppingCart,
            iconColor: "red.600",
            iconBg: "red.50",
        },
        {
            title: t("today_profit"),
            value: formatAmount(parseFloat(dashboard.today?.profit || 0)),
            change: "",
            trend: dashboard.today?.profit >= 0 ? "up" : "down",
            icon: dashboard.today?.profit >= 0 ? TrendingUp : TrendingDown,
            iconColor: dashboard.today?.profit >= 0 ? "green.600" : "red.600",
            iconBg: dashboard.today?.profit >= 0 ? "green.50" : "red.50",
        },
        {
            title: t("cash_bank_balance"),
            value: formatAmount(parseFloat(dashboard.cash_bank_balance || 0)),
            change: "",
            trend: dashboard.cash_bank_balance >= 0 ? "up" : "down",
            icon: Wallet,
            iconColor: "blue.600",
            iconBg: "blue.50",
        },
    ] : [
        { title: t("today_sales"), value: "---", change: "", trend: "up", icon: DollarSign, iconColor: "green.600", iconBg: "green.50" },
        { title: t("today_expenses"), value: "---", change: "", trend: "down", icon: ShoppingCart, iconColor: "red.600", iconBg: "red.50" },
        { title: t("today_profit"), value: "---", change: "", trend: "up", icon: TrendingUp, iconColor: "green.600", iconBg: "green.50" },
        { title: t("cash_bank_balance"), value: "---", change: "", trend: "up", icon: Wallet, iconColor: "blue.600", iconBg: "blue.50" },
    ];

    return (
        <Box>
            <PageHeader
                title={t("accounting_dashboard")}
                subtitle={t("manage_reports")}
                breadcrumbs={[
                    { label: t("dashboard"), path: "/dashboard" },
                    { label: t("accounting_dashboard"), isCurrent: true },
                ]}
            />

            {/* Stats Grid */}
            <Grid
                templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }}
                gap={{ base: 4, md: 6 }}
                mb={{ base: 6, md: 8 }}
            >
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </Grid>

            {/* Charts Row 1 */}
            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={{ base: 4, md: 6 }} mb={{ base: 6, md: 8 }}>
                <Box bg={bg} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={borderColor}>
                    <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
                        <Box>
                            <Heading size="md" fontWeight="bold" color={colors.textHeading}>
                                {t("sales_trend")}
                            </Heading>
                            <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                                {t("last_7_days")}
                            </Text>
                        </Box>
                    </Flex>
                    <Box h={{ base: "250px", md: "300px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dashboard?.sales_trend?.map((d) => ({ ...d, date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) })) || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke={colors.borderDefault} vertical={false} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: "#9ca3af" }} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: "#9ca3af" }} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="sales" stroke="#0d9488" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: "#0d9488", stroke: "white", strokeWidth: 2 }} />
                                <Line type="monotone" dataKey="profit" stroke="#8B5CF6" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: "#8B5CF6", stroke: "white", strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </Box>

                <Box bg={bg} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={borderColor}>
                    <Flex justify="space-between" align="center" mb={6} wrap="truncate">
                        <Heading size="md" fontWeight="bold" color={colors.textHeading}>
                            {t("account_balances")}
                        </Heading>
                    </Flex>
                    <VStack spacing={4} align="stretch">
                        <Flex justify="space-between" align="center" p={3} bg={colors.bgSubtle} borderRadius="lg">
                            <HStack spacing={2.5}>
                                <Box w={3} h={3} borderRadius="full" bg="green.500" />
                                <Text fontSize="sm" fontWeight="500">{t("today_profit")}</Text>
                            </HStack>
                            <Text fontSize="sm" fontWeight="bold" color={colors.textLabel}>
                                {dashboard ? formatAmount(parseFloat(dashboard.today?.profit || 0)) : "---"}
                            </Text>
                        </Flex>
                        <Flex justify="space-between" align="center" p={3} bg={colors.bgSubtle} borderRadius="lg">
                            <HStack spacing={2.5}>
                                <Box w={3} h={3} borderRadius="full" bg="blue.500" />
                                <Text fontSize="sm" fontWeight="500">{t("cash_bank_balance")}</Text>
                            </HStack>
                            <Text fontSize="sm" fontWeight="bold" color={colors.textLabel}>
                                {dashboard ? formatAmount(parseFloat(dashboard.cash_bank_balance || 0)) : "---"}
                            </Text>
                        </Flex>
                        <Flex justify="space-between" align="center" p={3} bg={colors.bgSubtle} borderRadius="lg">
                            <HStack spacing={2.5}>
                                <Box w={3} h={3} borderRadius="full" bg="orange.500" />
                                <Text fontSize="sm" fontWeight="500">{t("accounts_receivable")}</Text>
                            </HStack>
                            <Text fontSize="sm" fontWeight="bold" color={colors.textLabel}>
                                {dashboard ? formatAmount(parseFloat(dashboard.accounts_receivable || 0)) : "---"}
                            </Text>
                        </Flex>
                        <Flex justify="space-between" align="center" p={3} bg={colors.bgSubtle} borderRadius="lg">
                            <HStack spacing={2.5}>
                                <Box w={3} h={3} borderRadius="full" bg="purple.500" />
                                <Text fontSize="sm" fontWeight="500">{t("accounts_payable")}</Text>
                            </HStack>
                            <Text fontSize="sm" fontWeight="bold" color={colors.textLabel}>
                                {dashboard ? formatAmount(parseFloat(dashboard.accounts_payable || 0)) : "---"}
                            </Text>
                        </Flex>
                    </VStack>
                </Box>
            </Grid>

            {/* Monthly Summary */}
            <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={{ base: 4, md: 6 }} mb={6}>
                <Box bg={bg} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={borderColor}>
                    <Text fontSize="xs" color={colors.textSecondary} mb={2}>{t("month_total_sales")}</Text>
                    <Text fontSize="2xl" fontWeight="700" color="green.500">
                        {dashboard ? formatAmount(parseFloat(dashboard.month?.sales || 0)) : "---"}
                    </Text>
                </Box>
                <Box bg={bg} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={borderColor}>
                    <Text fontSize="xs" color={colors.textSecondary} mb={2}>{t("month_total_expenses")}</Text>
                    <Text fontSize="2xl" fontWeight="700" color="red.500">
                        {dashboard ? formatAmount(parseFloat(dashboard.month?.expenses || 0)) : "---"}
                    </Text>
                </Box>
                <Box bg={bg} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={borderColor}>
                    <Text fontSize="xs" color={colors.textSecondary} mb={2}>{t("month_net_profit")}</Text>
                    <Text fontSize="2xl" fontWeight="700" color={dashboard && dashboard.month?.profit >= 0 ? "green.500" : "red.500"}>
                        {dashboard ? formatAmount(parseFloat(dashboard.month?.profit || 0)) : "---"}
                    </Text>
                </Box>
            </Grid>

            {/* Sales Chart */}
            <Box bg={bg} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={borderColor}>
                <Heading size="md" fontWeight="bold" mb={4} color={colors.textHeading}>
                    {t("daily_sales_vs_expenses")}
                </Heading>
                <Text fontSize="sm" color={colors.textSecondary} mb={4}>
                    {t("last_7_days") || "Last 7 days"}
                </Text>
                <Box h={{ base: "250px", md: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboard?.sales_trend?.map((d) => ({ ...d, date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) })) || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke={colors.borderDefault} vertical={false} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: "#9ca3af" }} />
                            <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: "#9ca3af" }} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Bar dataKey="sales" fill="#0d9488" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Box>
        </Box>
    );
}
