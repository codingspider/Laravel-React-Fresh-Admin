import React, { useState, useEffect } from "react";
import {
    Box,
    Text,
    SimpleGrid,
    useToast,
    Badge,
    Divider,
    VStack,
    Flex,
    Button,
    Skeleton,
    SkeletonText,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Table,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import api from "../../../axios";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";
import { GET_PAYROLL } from "../../../routes/apiRoutes";
import {
    HRM_PAYROLL_LIST_PATH,
    HRM_PAYROLL_EDIT_PATH,
    DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";

const SectionHeader = ({ title, colors }) => (
    <Text fontSize="md" fontWeight="bold" color={colors.textPrimary} mb={4}>
        {title}
    </Text>
);

const DetailRow = ({ label, value, colors, valueColor }) => (
    <Flex justify="space-between" align="center" py={2}>
        <Text fontSize="sm" color={colors.textSecondary}>{label}</Text>
        <Text fontSize="sm" fontWeight="semibold" color={valueColor || colors.textPrimary}>{value}</Text>
    </Flex>
);

export default function PayrollView() {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const navigate = useNavigate();
    const { id } = useParams();
    const toast = useToast();
    const { formatAmount } = useCurrencyFormatter();
    const [payroll, setPayroll] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | ${t("payroll_details")}`;

        api.get(GET_PAYROLL(id))
            .then((res) => {
                const data = res.data?.data || res.data?.data?.data;
                setPayroll(data);
            })
            .catch(() => {
                toast({ title: t("error"), status: "error", duration: 3000, isClosable: true });
            })
            .finally(() => setIsLoading(false));
    }, [id, t, toast]);

    const getStatusColor = (status) => {
        switch (status) {
            case "paid": return "green";
            case "pending": return "yellow";
            case "cancelled": return "red";
            default: return "gray";
        }
    };

    const totalAllowances = parseFloat(payroll?.allowance) || 0;
    const totalDeductions = parseFloat(payroll?.deduction) || 0;
    const overtimePay = (parseFloat(payroll?.overtime_hours) || 0) * (parseFloat(payroll?.overtime_rate) || 0);
    const grossSalary = (parseFloat(payroll?.basic_salary) || 0) + totalAllowances + overtimePay + (parseFloat(payroll?.bonus) || 0);

    const sectionBoxProps = {
        bg: colors.bgCard,
        border: "1px solid",
        borderColor: colors.borderDefault,
        borderRadius: "xl",
        boxShadow: "card",
        overflow: "hidden",
    };

    if (isLoading) {
        return (
            <Box bg={colors.bgSubtle} minH="100vh" py={3}>
                <Box mx="auto">
                    <Box mb={4}>
                        <Skeleton height="40px" width="300px" />
                        <SkeletonText mt={2} noOfLines={1} width="200px" />
                    </Box>
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                        {[1, 2, 3, 4].map((i) => (
                            <Box key={i} {...sectionBoxProps} p={6}>
                                <SkeletonText noOfLines={4} spacing={4} />
                            </Box>
                        ))}
                    </SimpleGrid>
                </Box>
            </Box>
        );
    }

    if (!payroll) {
        return (
            <Box bg={colors.bgSubtle} minH="100vh" py={3}>
                <Box mx="auto">
                    <Box mb={4}>
                        <Text fontSize="xl" fontWeight="bold" color={colors.textPrimary}>{t("payroll_details")}</Text>
                        <Text fontSize="sm" color={colors.textSecondary}>{t("payroll_not_found")}</Text>
                    </Box>
                    <Button as={ReactRouterLink} to={HRM_PAYROLL_LIST_PATH} leftIcon={<ArrowLeft />} colorScheme="teal" variant="outline">
                        {t("back_to_list")}
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box bg={colors.bgSubtle} minH="100vh" py={3}>
            <Box mx="auto">
                {/* Header */}
                <Flex justify="space-between" align="center" mb={4}>
                    <Box>
                        <Text fontSize="xl" fontWeight="bold" color={colors.textPrimary}>
                            {t("payroll_details")}
                        </Text>
                        <Text fontSize="sm" color={colors.textSecondary}>
                            {payroll?.employee?.first_name} {payroll?.employee?.last_name}
                        </Text>
                    </Box>
                    <Flex gap={3}>
                        <Button
                            as={ReactRouterLink}
                            to={HRM_PAYROLL_LIST_PATH}
                            leftIcon={<ArrowLeft />}
                            variant="outline"
                            colorScheme="teal"
                            size="sm"
                        >
                            {t("back_to_list")}
                        </Button>
                        <Button
                            as={ReactRouterLink}
                            to={HRM_PAYROLL_EDIT_PATH(payroll.id)}
                            colorScheme="teal"
                            size="sm"
                        >
                            {t("edit")}
                        </Button>
                    </Flex>
                </Flex>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>

                    {/* Employee & Period */}
                    <Box {...sectionBoxProps}>
                        <Box p={5} borderBottom="1px solid" borderColor={colors.borderDefault}>
                            <SectionHeader title={t("employee_&_period")} colors={colors} />
                        </Box>
                        <Box p={5}>
                            <VStack spacing={0} align="stretch" divider={<Divider borderColor={colors.borderDefault} />}>
                                <DetailRow label={t("employee")} value={`${payroll?.employee?.first_name || ""} ${payroll?.employee?.last_name || ""}`.trim() || "-"} colors={colors} />
                                <DetailRow label={t("employee_id")} value={payroll?.employee?.employee_id || "-"} colors={colors} />
                                <DetailRow label={t("department")} value={payroll?.employee?.department?.name || "-"} colors={colors} />
                                <DetailRow label={t("designation")} value={payroll?.employee?.designation?.name || "-"} colors={colors} />
                                <DetailRow label={t("branch")} value={payroll?.branch?.name || "-"} colors={colors} />
                                <DetailRow label={t("pay_period_start")} value={payroll?.pay_period_start ? new Date(String(payroll.pay_period_start).split("T")[0] + "T00:00:00").toLocaleDateString() : "-"} colors={colors} />
                                <DetailRow label={t("pay_period_end")} value={payroll?.pay_period_end ? new Date(String(payroll.pay_period_end).split("T")[0] + "T00:00:00").toLocaleDateString() : "-"} colors={colors} />
                            </VStack>
                        </Box>
                    </Box>

                    {/* Attendance Summary */}
                    <Box {...sectionBoxProps}>
                        <Box p={5} borderBottom="1px solid" borderColor={colors.borderDefault}>
                            <SectionHeader title={t("attendance_summary")} colors={colors} />
                        </Box>
                        <Box p={5}>
                            <VStack spacing={0} align="stretch" divider={<Divider borderColor={colors.borderDefault} />}>
                                <DetailRow label={t("working_days")} value={payroll?.working_days || 0} colors={colors} />
                                <DetailRow label={t("present_days")} value={payroll?.present_days || 0} colors={colors} />
                                <DetailRow label={t("total_working_hours")} value={parseFloat(payroll?.total_working_hours || 0).toFixed(1)} colors={colors} />
                                <DetailRow label={t("overtime_hours")} value={parseFloat(payroll?.overtime_hours || 0).toFixed(1)} colors={colors} />
                            </VStack>
                        </Box>
                    </Box>

                    {/* Salary Details */}
                    <Box {...sectionBoxProps}>
                        <Box p={5} borderBottom="1px solid" borderColor={colors.borderDefault}>
                            <SectionHeader title={t("salary_details")} colors={colors} />
                        </Box>
                        <Box p={5}>
                            <VStack spacing={0} align="stretch" divider={<Divider borderColor={colors.borderDefault} />}>
                                <DetailRow label={t("basic_salary")} value={formatAmount(payroll?.basic_salary || 0)} colors={colors} />
                                <DetailRow label={t("overtime_rate")} value={formatAmount(payroll?.overtime_rate || 0)} colors={colors} />
                                <DetailRow label={t("overtime_pay")} value={formatAmount(overtimePay)} colors={colors} valueColor="green.500" />
                                <DetailRow label={t("bonus")} value={formatAmount(payroll?.bonus || 0)} colors={colors} valueColor={parseFloat(payroll?.bonus || 0) > 0 ? "green.500" : undefined} />
                                <DetailRow label={t("pf")} value={formatAmount(payroll?.pf || 0)} colors={colors} valueColor={parseFloat(payroll?.pf || 0) > 0 ? "red.500" : undefined} />
                                <DetailRow label={t("tax")} value={formatAmount(payroll?.tax || 0)} colors={colors} valueColor={parseFloat(payroll?.tax || 0) > 0 ? "red.500" : undefined} />
                            </VStack>
                        </Box>
                    </Box>

                    {/* Salary Summary */}
                    <Box {...sectionBoxProps}>
                        <Box p={5} borderBottom="1px solid" borderColor={colors.borderDefault}>
                            <SectionHeader title={t("salary_breakdown")} colors={colors} />
                        </Box>
                        <Box p={5}>
                            <VStack spacing={0} align="stretch" divider={<Divider borderColor={colors.borderDefault} />}>
                                <DetailRow label={t("basic_salary")} value={formatAmount(payroll?.basic_salary || 0)} colors={colors} />
                                <DetailRow label={t("total_allowances")} value={`+${formatAmount(totalAllowances)}`} colors={colors} valueColor="green.500" />
                                {overtimePay > 0 && (
                                    <DetailRow label={t("overtime_pay")} value={`+${formatAmount(overtimePay)}`} colors={colors} valueColor="green.500" />
                                )}
                                {parseFloat(payroll?.bonus || 0) > 0 && (
                                    <DetailRow label={t("bonus")} value={`+${formatAmount(payroll.bonus)}`} colors={colors} valueColor="green.500" />
                                )}
                                <Divider borderColor={colors.borderDefault} />
                                <DetailRow label={t("gross_salary")} value={formatAmount(grossSalary)} colors={colors} />
                                <Divider borderColor={colors.borderDefault} />
                                {totalDeductions > 0 && (
                                    <DetailRow label={t("total_deductions")} value={`-${formatAmount(totalDeductions)}`} colors={colors} valueColor="red.500" />
                                )}
                                {parseFloat(payroll?.pf || 0) > 0 && (
                                    <DetailRow label={t("pf")} value={`-${formatAmount(payroll.pf)}`} colors={colors} valueColor="red.500" />
                                )}
                                {parseFloat(payroll?.tax || 0) > 0 && (
                                    <DetailRow label={t("tax")} value={`-${formatAmount(payroll.tax)}`} colors={colors} valueColor="red.500" />
                                )}
                                <Divider borderColor={colors.borderDefault} />
                                <Flex justify="space-between" align="center" py={3} bg="teal.50" _dark={{ bg: "teal.900" }} px={4} borderRadius="md" mt={2}>
                                    <Text fontSize="md" fontWeight="bold" color="teal.600" _dark={{ color: "teal.300" }}>{t("net_payable")}</Text>
                                    <Text fontSize="lg" fontWeight="bold" color="teal.600" _dark={{ color: "teal.300" }}>{formatAmount(payroll?.net_salary || 0)}</Text>
                                </Flex>
                            </VStack>
                        </Box>
                    </Box>

                    {/* Allowances Detail */}
                    <Box {...sectionBoxProps}>
                        <Box p={5} borderBottom="1px solid" borderColor={colors.borderDefault}>
                            <Flex justify="space-between" align="center">
                                <SectionHeader title={t("allowances")} colors={colors} />
                                <Badge colorScheme="green" fontSize="xs">{(payroll?.allowances || []).length}</Badge>
                            </Flex>
                        </Box>
                        <Box p={5}>
                            {(payroll?.allowances || []).length === 0 ? (
                                <Text fontSize="sm" color={colors.textSecondary} textAlign="center" py={4}>
                                    {t("no_allowances_added")}
                                </Text>
                            ) : (
                                <Box overflowX="auto">
                                    <Table size="sm" variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th color={colors.textSecondary} fontSize="xs">{t("type")}</Th>
                                                <Th color={colors.textSecondary} fontSize="xs" isNumeric>{t("amount")}</Th>
                                                <Th color={colors.textSecondary} fontSize="xs">{t("calculation_type")}</Th>
                                                <Th color={colors.textSecondary} fontSize="xs" isNumeric>{t("calculated")}</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {payroll.allowances.map((a, i) => (
                                                <Tr key={i}>
                                                    <Td fontSize="sm" color={colors.textPrimary}>{a.type}</Td>
                                                    <Td fontSize="sm" color={colors.textPrimary} isNumeric>{formatAmount(a.amount)}</Td>
                                                    <Td fontSize="sm">
                                                        <Badge colorScheme={a.calculation_type === "percentage" ? "blue" : "gray"} fontSize="xs">
                                                            {a.calculation_type === "percentage" ? t("percentage") : t("fixed_amount")}
                                                        </Badge>
                                                    </Td>
                                                    <Td fontSize="sm" fontWeight="semibold" color="green.500" isNumeric>{formatAmount(a.calculated_amount)}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* Deductions Detail */}
                    <Box {...sectionBoxProps}>
                        <Box p={5} borderBottom="1px solid" borderColor={colors.borderDefault}>
                            <Flex justify="space-between" align="center">
                                <SectionHeader title={t("deductions")} colors={colors} />
                                <Badge colorScheme="red" fontSize="xs">{(payroll?.deductions || []).length}</Badge>
                            </Flex>
                        </Box>
                        <Box p={5}>
                            {(payroll?.deductions || []).length === 0 ? (
                                <Text fontSize="sm" color={colors.textSecondary} textAlign="center" py={4}>
                                    {t("no_deductions_added")}
                                </Text>
                            ) : (
                                <Box overflowX="auto">
                                    <Table size="sm" variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th color={colors.textSecondary} fontSize="xs">{t("type")}</Th>
                                                <Th color={colors.textSecondary} fontSize="xs" isNumeric>{t("amount")}</Th>
                                                <Th color={colors.textSecondary} fontSize="xs">{t("calculation_type")}</Th>
                                                <Th color={colors.textSecondary} fontSize="xs" isNumeric>{t("calculated")}</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {payroll.deductions.map((d, i) => (
                                                <Tr key={i}>
                                                    <Td fontSize="sm" color={colors.textPrimary}>{d.type}</Td>
                                                    <Td fontSize="sm" color={colors.textPrimary} isNumeric>{formatAmount(d.amount)}</Td>
                                                    <Td fontSize="sm">
                                                        <Badge colorScheme={d.calculation_type === "percentage" ? "blue" : "gray"} fontSize="xs">
                                                            {d.calculation_type === "percentage" ? t("percentage") : t("fixed_amount")}
                                                        </Badge>
                                                    </Td>
                                                    <Td fontSize="sm" fontWeight="semibold" color="red.500" isNumeric>{formatAmount(d.calculated_amount)}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* Payment Info */}
                    <Box {...sectionBoxProps}>
                        <Box p={5} borderBottom="1px solid" borderColor={colors.borderDefault}>
                            <SectionHeader title={t("payment_info")} colors={colors} />
                        </Box>
                        <Box p={5}>
                            <VStack spacing={0} align="stretch" divider={<Divider borderColor={colors.borderDefault} />}>
                                <Flex justify="space-between" align="center" py={2}>
                                    <Text fontSize="sm" color={colors.textSecondary}>{t("status")}</Text>
                                    <Badge colorScheme={getStatusColor(payroll?.status)} variant="subtle" borderRadius="full" px={3} py={1} fontSize="sm">
                                        {t(payroll?.status || "pending")}
                                    </Badge>
                                </Flex>
                                <DetailRow label={t("paid_date")} value={payroll?.paid_date ? new Date(String(payroll.paid_date).split("T")[0] + "T00:00:00").toLocaleDateString() : "-"} colors={colors} />
                                <DetailRow label={t("notes")} value={payroll?.notes || "-"} colors={colors} />
                                <DetailRow label={t("created_at")} value={payroll?.created_at ? new Date(payroll.created_at).toLocaleString() : "-"} colors={colors} />
                                <DetailRow label={t("updated_at")} value={payroll?.updated_at ? new Date(payroll.updated_at).toLocaleString() : "-"} colors={colors} />
                            </VStack>
                        </Box>
                    </Box>

                </SimpleGrid>
            </Box>
        </Box>
    );
}
