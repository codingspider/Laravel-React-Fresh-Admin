import {
    Box,
    Button,
    Card,
    CardHeader,
    CardBody,
    Heading,
    SimpleGrid,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    useToast,
    Flex,
    Text,
    IconButton,
    Divider,
    VStack,
    HStack,
    Badge,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm, useFieldArray } from "react-hook-form";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import {
    HRM_PAYROLL_LIST_PATH,
    DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";
import {
    STORE_PAYROLL,
    GET_PAYROLL,
    UPDATE_PAYROLL,
    LIST_EMPLOYEE,
    LIST_ATTENDANCE,
} from "../../../routes/apiRoutes";
import api from "../../../axios";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

const ALLOWANCE_TYPES = [
    "House Rent",
    "Medical",
    "Transport",
    "Food",
    "Mobile",
    "Performance Bonus",
    "Other",
];

const DEDUCTION_TYPES = [
    "Tax",
    "PF",
    "Loan",
    "Advance",
    "Late Fine",
    "Absence",
    "Insurance",
    "Other",
];

const createEmptyAllowance = () => ({
    type: "",
    amount: 0,
    calculation_type: "fixed",
    notes: "",
});

const createEmptyDeduction = () => ({
    type: "",
    amount: 0,
    calculation_type: "fixed",
    notes: "",
});

const PayrollCreate = () => {
    const colors = useThemeColors();
    const { t } = useTranslation();
    const { id } = useParams();
    const isEdit = !!id;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const toast = useToast();
    const navigate = useNavigate();
    const { formatAmount } = useCurrencyFormatter();

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
    } = useForm({
        defaultValues: {
            employee_id: "",
            branch_id: "",
            pay_period_start: "",
            pay_period_end: "",
            basic_salary: 0,
            working_days: 26,
            present_days: 0,
            total_working_hours: 0,
            overtime_hours: 0,
            overtime_rate: 0,
            bonus: 0,
            allowances: [],
            deductions: [],
            pf: 0,
            tax: 0,
            status: "pending",
            paid_date: "",
            notes: "",
        },
    });

    const {
        fields: allowanceFields,
        append: appendAllowance,
        remove: removeAllowance,
        replace: replaceAllowances,
    } = useFieldArray({ control, name: "allowances" });

    const {
        fields: deductionFields,
        append: appendDeduction,
        remove: removeDeduction,
        replace: replaceDeductions,
    } = useFieldArray({ control, name: "deductions" });

    const watchBasicSalary = watch("basic_salary");
    const watchAllowances = watch("allowances");
    const watchDeductions = watch("deductions");
    const watchOvertimeHours = watch("overtime_hours");
    const watchOvertimeRate = watch("overtime_rate");
    const watchBonus = watch("bonus");
    const watchPf = watch("pf");
    const watchTax = watch("tax");

    useEffect(() => {
        api.get(LIST_EMPLOYEE, { params: { per_page: 500 } })
            .then((res) => {
                const items = res.data?.data?.data || res.data?.data || [];
                setEmployees(items);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | ${isEdit ? "Payroll Update" : "Payroll Create"}`;
    }, [isEdit]);

    useEffect(() => {
        if (isEdit) {
            api.get(GET_PAYROLL(id))
                .then((res) => {
                    const payroll = res.data?.data || res.data?.data?.data;
                    if (payroll) {
                        reset({
                            employee_id: payroll?.employee_id || "",
                            branch_id: payroll?.branch_id || "",
                            pay_period_start: payroll?.pay_period_start?.split("T")[0] || "",
                            pay_period_end: payroll?.pay_period_end?.split("T")[0] || "",
                            basic_salary: payroll?.basic_salary || 0,
                            working_days: payroll?.working_days || 26,
                            present_days: payroll?.present_days || 0,
                            total_working_hours: payroll?.total_working_hours || 0,
                            overtime_hours: payroll?.overtime_hours || 0,
                            overtime_rate: payroll?.overtime_rate || 0,
                            bonus: payroll?.bonus || 0,
                            allowances: payroll?.allowances?.map((a) => ({
                                type: a.type || "",
                                amount: a.amount || 0,
                                calculation_type: a.calculation_type || "fixed",
                                notes: a.notes || "",
                            })) || [],
                            deductions: payroll?.deductions?.map((d) => ({
                                type: d.type || "",
                                amount: d.amount || 0,
                                calculation_type: d.calculation_type || "fixed",
                                notes: d.notes || "",
                            })) || [],
                            pf: payroll?.pf || 0,
                            tax: payroll?.tax || 0,
                            status: payroll?.status || "pending",
                            paid_date: payroll?.paid_date?.split("T")[0] || "",
                            notes: payroll?.notes || "",
                        });
                    }
                })
                .catch(() => {});
        }
    }, [id, isEdit, reset]);

    useEffect(() => {
        if (selectedEmployee) {
            setValue("basic_salary", parseFloat(selectedEmployee.salary) || 0);
            setValue("overtime_rate", parseFloat(selectedEmployee.overtime_rate) || 0);
            setValue("pf", parseFloat(selectedEmployee.pf) || 0);
            setValue("tax", parseFloat(selectedEmployee.tax) || 0);
            if (selectedEmployee.branch_id) {
                setValue("branch_id", selectedEmployee.branch_id);
            }
        }
    }, [selectedEmployee, setValue]);

    const watchPayPeriodStart = watch("pay_period_start");
    const watchPayPeriodEnd = watch("pay_period_end");
    const watchEmployeeId = watch("employee_id");

    useEffect(() => {
        if (watchEmployeeId && watchPayPeriodStart && watchPayPeriodEnd) {
            api.get(LIST_ATTENDANCE, {
                params: {
                    employee_id: watchEmployeeId,
                    date_from: watchPayPeriodStart,
                    date_to: watchPayPeriodEnd,
                    per_page: 500,
                },
            })
                .then((res) => {
                    const records = res.data?.data?.data || res.data?.data || [];
                    const totalDays = records.length;
                    const presentDays = records.filter(
                        (r) => r.status === "present" || r.status === "late"
                    ).length;
                    const totalOvertime = records.reduce(
                        (sum, r) => sum + (parseFloat(r.overtime_hours) || 0),
                        0
                    );
                    const totalWorkHours = records.reduce(
                        (sum, r) => sum + (parseFloat(r.work_hours) || 0),
                        0
                    );
                    setValue("working_days", totalDays);
                    setValue("present_days", presentDays);
                    setValue("total_working_hours", totalWorkHours);
                    setValue("overtime_hours", totalOvertime);
                })
                .catch(() => {});
        }
    }, [watchEmployeeId, watchPayPeriodStart, watchPayPeriodEnd, setValue]);

    const salaryBreakdown = useMemo(() => {
        const basic = parseFloat(watchBasicSalary) || 0;
        const otHours = parseFloat(watchOvertimeHours) || 0;
        const otRate = parseFloat(watchOvertimeRate) || 0;
        const bonusVal = parseFloat(watchBonus) || 0;
        const pfVal = parseFloat(watchPf) || 0;
        const taxVal = parseFloat(watchTax) || 0;

        const totalAllowances = (watchAllowances || []).reduce((sum, a) => {
            if (a.calculation_type === "percentage") {
                return sum + (basic * (parseFloat(a.amount) || 0)) / 100;
            }
            return sum + (parseFloat(a.amount) || 0);
        }, 0);

        const totalDeductions = (watchDeductions || []).reduce((sum, d) => {
            if (d.calculation_type === "percentage") {
                return sum + (basic * (parseFloat(d.amount) || 0)) / 100;
            }
            return sum + (parseFloat(d.amount) || 0);
        }, 0);

        const overtimePay = otHours * otRate;
        const grossSalary = basic + totalAllowances + overtimePay + bonusVal;
        const totalDeductionsAndTax = totalDeductions + pfVal + taxVal;
        const netPayable = grossSalary - totalDeductionsAndTax;

        return {
            basic,
            totalAllowances,
            overtimePay,
            bonusVal,
            grossSalary,
            totalDeductions,
            pfVal,
            taxVal,
            totalDeductionsAndTax,
            netPayable,
        };
    }, [
        watchBasicSalary,
        watchAllowances,
        watchDeductions,
        watchOvertimeHours,
        watchOvertimeRate,
        watchBonus,
        watchPf,
        watchTax,
    ]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const submitData = {
                ...data,
                allowance: salaryBreakdown.totalAllowances,
                deduction: salaryBreakdown.totalDeductions,
            };

            const res = isEdit
                ? await api.put(UPDATE_PAYROLL(id), submitData)
                : await api.post(STORE_PAYROLL, submitData);
            reset();
            toast({
                title: res.data.message || t(isEdit ? "payroll_updated" : "payroll_created"),
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(HRM_PAYROLL_LIST_PATH);
        } catch (err) {
            const errorResponse = err?.response?.data;
            if (errorResponse?.errors) {
                const errorMessage = Object.values(errorResponse.errors)
                    .flat()
                    .join(" ");
                toast({
                    title: t("error"),
                    description: errorMessage,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } else if (errorResponse?.message) {
                toast({
                    title: t("error"),
                    description: errorResponse.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputProps = {
        bg: colors.bgInput,
        border: "1px solid",
        borderColor: colors.borderInput,
        borderRadius: "md",
        focusBorderColor: "teal.500",
        _hover: { borderColor: "gray.300" },
        size: "md",
        transition: "all 0.2s",
    };

    const sectionBoxProps = {
        bg: colors.bgSubtle,
        border: "1px solid",
        borderColor: colors.borderSubtle,
        borderRadius: "lg",
        p: 5,
    };

    return (
        <Box className="form-dark-surface" bg={colors.bgSubtle} minH="100vh" py={3}>
            <Box mx="auto">
                {/* Breadcrumb */}
                <Card mb={4} bg={colors.bgCard} shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Breadcrumb fontSize="sm" color={colors.textSecondary}>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    as={ReactRouterLink}
                                    to={DASHBOARD_PATH}
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
                                    {t("dashboard")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    as={ReactRouterLink}
                                    to={HRM_PAYROLL_LIST_PATH}
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
                                    {t("payroll")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color={colors.textPrimary} fontWeight="bold">
                                    {t(isEdit ? "edit_payroll" : "add_payroll")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                {/* Main Form Card */}
                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={colors.bgCard}>
                    <CardHeader
                        bg={colors.bgCard}
                        borderBottom="1px solid"
                        borderColor={colors.borderSubtle}
                        pb={6}
                    >
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">
                                    {t(isEdit ? "edit_payroll" : "add_payroll")}
                                </Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                                    {t(isEdit ? "update_payroll_record" : "create_new_payroll_record")}
                                </Text>
                            </Box>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to={HRM_PAYROLL_LIST_PATH}
                                variant="outline"
                                display={{ base: "none", md: "inline-flex" }}
                                size="sm"
                                fontWeight="600"
                            >
                                {t("list")}
                            </Button>
                        </Flex>
                    </CardHeader>

                    <CardBody p={8}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Employee & Period */}
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("employee")}
                                    </FormLabel>
                                    <Select
                                        {...register("employee_id", { required: true })}
                                        placeholder={t("select_employee")}
                                        {...inputProps}
                                        onChange={(e) => {
                                            const emp = employees.find((x) => String(x.id) === String(e.target.value));
                                            setSelectedEmployee(emp || null);
                                            register("employee_id").onChange(e);
                                        }}
                                    >
                                        {employees.map((emp) => (
                                            <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("pay_period_start")}
                                    </FormLabel>
                                    <Input
                                        {...register("pay_period_start", { required: true })}
                                        type="date"
                                        {...inputProps}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("pay_period_end")}
                                    </FormLabel>
                                    <Input
                                        {...register("pay_period_end", { required: true })}
                                        type="date"
                                        {...inputProps}
                                    />
                                </FormControl>
                            </SimpleGrid>

                            {/* Salary & Attendance */}
                            <SimpleGrid columns={{ base: 1, md: 5 }} spacing={6} mb={8}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("basic_salary")}
                                    </FormLabel>
                                    <Input
                                        {...register("basic_salary", { required: true, valueAsNumber: true })}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...inputProps}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("working_days")}
                                    </FormLabel>
                                    <Input
                                        {...register("working_days", { required: true, valueAsNumber: true })}
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        readOnly
                                        bg={colors.bgSubtle}
                                        _hover={{ borderColor: colors.borderInput }}
                                        cursor="default"
                                        {...inputProps}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("present_days")}
                                    </FormLabel>
                                    <Input
                                        {...register("present_days", { valueAsNumber: true })}
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        readOnly
                                        bg={colors.bgSubtle}
                                        _hover={{ borderColor: colors.borderInput }}
                                        cursor="default"
                                        {...inputProps}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("total_working_hours")}
                                    </FormLabel>
                                    <Input
                                        {...register("total_working_hours", { valueAsNumber: true })}
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        placeholder="0"
                                        readOnly
                                        bg={colors.bgSubtle}
                                        _hover={{ borderColor: colors.borderInput }}
                                        cursor="default"
                                        {...inputProps}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("overtime_hours")}
                                    </FormLabel>
                                    <Input
                                        {...register("overtime_hours", { valueAsNumber: true })}
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        placeholder="0"
                                        readOnly
                                        bg={colors.bgSubtle}
                                        _hover={{ borderColor: colors.borderInput }}
                                        cursor="default"
                                        {...inputProps}
                                    />
                                </FormControl>
                            </SimpleGrid>

                            {/* Overtime Rate & Bonus */}
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("overtime_rate")}
                                    </FormLabel>
                                    <Input
                                        {...register("overtime_rate", { valueAsNumber: true })}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...inputProps}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("bonus")}
                                    </FormLabel>
                                    <Input
                                        {...register("bonus", { valueAsNumber: true })}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...inputProps}
                                    />
                                </FormControl>
                            </SimpleGrid>

                            <Divider mb={8} />

                            {/* Allowances Section */}
                    <Box {...sectionBoxProps} mb={8}>
                        <Flex justify="space-between" align="center" mb={4}>
                            <HStack>
                                <Text fontWeight="bold" fontSize="md" color={colors.textPrimary}>
                                    {t("allowances")}
                                </Text>
                                <Badge colorScheme="green" fontSize="xs">
                                    {allowanceFields.length}
                                </Badge>
                            </HStack>
                            <Button
                                size="sm"
                                colorScheme="teal"
                                variant="outline"
                                leftIcon={<FiPlus />}
                                onClick={() => appendAllowance(createEmptyAllowance())}
                                fontWeight="semibold"
                                _hover={{ bg: "teal.50" }}
                            >
                                {t("add_allowance")}
                            </Button>
                        </Flex>

                        {allowanceFields.length === 0 ? (
                            <Text fontSize="sm" color={colors.textSecondary} textAlign="center" py={4}>
                                {t("no_allowances_added")}
                            </Text>
                        ) : (
                            <VStack spacing={3} align="stretch">
                                {allowanceFields.map((field, index) => (
                                    <HStack
                                        key={field.id}
                                        spacing={3}
                                        bg={colors.bgCard}
                                        border="1px solid"
                                        borderColor={colors.borderSubtle}
                                        borderRadius="md"
                                        p={3}
                                    >
                                        <FormControl flex={2} isRequired>
                                            <Select
                                                {...register(`allowances.${index}.type`, { required: true })}
                                                placeholder={t("select_type")}
                                                {...inputProps}
                                                size="sm"
                                            >
                                                {ALLOWANCE_TYPES.map((type) => (
                                                    <option key={type} value={type}>{t(type.toLowerCase().replace(/\s/g, "_"))}</option>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl flex={1.5} isRequired>
                                            <Input
                                                {...register(`allowances.${index}.amount`, {
                                                    required: true,
                                                    valueAsNumber: true,
                                                })}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...inputProps}
                                                size="sm"
                                            />
                                        </FormControl>

                                        <FormControl flex={1.5} isRequired>
                                            <Select
                                                {...register(`allowances.${index}.calculation_type`, { required: true })}
                                                {...inputProps}
                                                size="sm"
                                            >
                                                <option value="fixed">{t("fixed_amount")}</option>
                                                <option value="percentage">{t("percentage")}</option>
                                            </Select>
                                        </FormControl>

                                        <Text fontSize="sm" fontWeight="semibold" color={colors.textPrimary} minW="80px" textAlign="right">
                                            {formatAmount(
                                                watchAllowances?.[index]?.calculation_type === "percentage"
                                                    ? ((parseFloat(watchBasicSalary) || 0) * (parseFloat(watchAllowances?.[index]?.amount) || 0)) / 100
                                                    : (parseFloat(watchAllowances?.[index]?.amount) || 0)
                                            )}
                                        </Text>

                                        <IconButton
                                            icon={<FiTrash2 />}
                                            size="sm"
                                            colorScheme="red"
                                            variant="ghost"
                                            onClick={() => removeAllowance(index)}
                                            aria-label="Remove allowance"
                                        />
                                    </HStack>
                                ))}
                            </VStack>
                        )}
                    </Box>

                    {/* Deductions Section */}
                    <Box {...sectionBoxProps} mb={8}>
                        <Flex justify="space-between" align="center" mb={4}>
                            <HStack>
                                <Text fontWeight="bold" fontSize="md" color={colors.textPrimary}>
                                    {t("deductions")}
                                </Text>
                                <Badge colorScheme="red" fontSize="xs">
                                    {deductionFields.length}
                                </Badge>
                            </HStack>
                            <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                leftIcon={<FiPlus />}
                                onClick={() => appendDeduction(createEmptyDeduction())}
                                fontWeight="semibold"
                                _hover={{ bg: "red.50" }}
                            >
                                {t("add_deduction")}
                            </Button>
                        </Flex>

                        {deductionFields.length === 0 ? (
                            <Text fontSize="sm" color={colors.textSecondary} textAlign="center" py={4}>
                                {t("no_deductions_added")}
                            </Text>
                        ) : (
                            <VStack spacing={3} align="stretch">
                                {deductionFields.map((field, index) => (
                                    <HStack
                                        key={field.id}
                                        spacing={3}
                                        bg={colors.bgCard}
                                        border="1px solid"
                                        borderColor={colors.borderSubtle}
                                        borderRadius="md"
                                        p={3}
                                    >
                                        <FormControl flex={2} isRequired>
                                            <Select
                                                {...register(`deductions.${index}.type`, { required: true })}
                                                placeholder={t("select_type")}
                                                {...inputProps}
                                                size="sm"
                                            >
                                                {DEDUCTION_TYPES.map((type) => (
                                                    <option key={type} value={type}>{t(type.toLowerCase().replace(/\s/g, "_"))}</option>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl flex={1.5} isRequired>
                                            <Input
                                                {...register(`deductions.${index}.amount`, {
                                                    required: true,
                                                    valueAsNumber: true,
                                                })}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...inputProps}
                                                size="sm"
                                            />
                                        </FormControl>

                                        <FormControl flex={1.5} isRequired>
                                            <Select
                                                {...register(`deductions.${index}.calculation_type`, { required: true })}
                                                {...inputProps}
                                                size="sm"
                                            >
                                                <option value="fixed">{t("fixed_amount")}</option>
                                                <option value="percentage">{t("percentage")}</option>
                                            </Select>
                                        </FormControl>

                                        <Text fontSize="sm" fontWeight="semibold" color={colors.textPrimary} minW="80px" textAlign="right">
                                            {formatAmount(
                                                watchDeductions?.[index]?.calculation_type === "percentage"
                                                    ? ((parseFloat(watchBasicSalary) || 0) * (parseFloat(watchDeductions?.[index]?.amount) || 0)) / 100
                                                    : (parseFloat(watchDeductions?.[index]?.amount) || 0)
                                            )}
                                        </Text>

                                        <IconButton
                                            icon={<FiTrash2 />}
                                            size="sm"
                                            colorScheme="red"
                                            variant="ghost"
                                            onClick={() => removeDeduction(index)}
                                            aria-label="Remove deduction"
                                        />
                                    </HStack>
                                ))}
                            </VStack>
                        )}
                    </Box>

                            {/* PF & Tax */}
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("pf")}
                                    </FormLabel>
                                    <Input
                                        {...register("pf", { valueAsNumber: true })}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...inputProps}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("tax")}
                                    </FormLabel>
                                    <Input
                                        {...register("tax", { valueAsNumber: true })}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...inputProps}
                                    />
                                </FormControl>
                            </SimpleGrid>

                            <Divider mb={8} />

                            {/* Salary Breakdown */}
                            <Box {...sectionBoxProps} mb={8}>
                                <Text fontWeight="bold" fontSize="md" color={colors.textPrimary} mb={4}>
                                    {t("salary_breakdown")}
                                </Text>
                                <VStack spacing={2} align="stretch">
                                    <Flex justify="space-between">
                                        <Text fontSize="sm" color={colors.textSecondary}>{t("basic_salary")}</Text>
                                        <Text fontSize="sm" fontWeight="semibold" color={colors.textPrimary}>{formatAmount(salaryBreakdown.basic)}</Text>
                                    </Flex>
                                    <Flex justify="space-between">
                                        <Text fontSize="sm" color={colors.textSecondary}>{t("total_allowances")}</Text>
                                        <Text fontSize="sm" fontWeight="semibold" color="green.500">+{formatAmount(salaryBreakdown.totalAllowances)}</Text>
                                    </Flex>
                                    {salaryBreakdown.overtimePay > 0 && (
                                        <Flex justify="space-between">
                                            <Text fontSize="sm" color={colors.textSecondary}>{t("overtime_pay")}</Text>
                                            <Text fontSize="sm" fontWeight="semibold" color="green.500">+{formatAmount(salaryBreakdown.overtimePay)}</Text>
                                        </Flex>
                                    )}
                                    {salaryBreakdown.bonusVal > 0 && (
                                        <Flex justify="space-between">
                                            <Text fontSize="sm" color={colors.textSecondary}>{t("bonus")}</Text>
                                            <Text fontSize="sm" fontWeight="semibold" color="green.500">+{formatAmount(salaryBreakdown.bonusVal)}</Text>
                                        </Flex>
                                    )}
                                    <Divider />
                                    <Flex justify="space-between">
                                        <Text fontSize="sm" fontWeight="bold" color={colors.textPrimary}>{t("gross_salary")}</Text>
                                        <Text fontSize="sm" fontWeight="bold" color={colors.textPrimary}>{formatAmount(salaryBreakdown.grossSalary)}</Text>
                                    </Flex>
                                    <Divider />
                                    {(watchDeductions || []).map((d, i) => {
                                        const amount = d.calculation_type === "percentage"
                                            ? (salaryBreakdown.basic * (parseFloat(d.amount) || 0)) / 100
                                            : (parseFloat(d.amount) || 0);
                                        if (amount <= 0) return null;
                                        return (
                                            <Flex key={i} justify="space-between">
                                                <Text fontSize="sm" color={colors.textSecondary} pl={4}>{d.type || t("deduction")}</Text>
                                                <Text fontSize="sm" fontWeight="semibold" color="red.500">-{formatAmount(amount)}</Text>
                                            </Flex>
                                        );
                                    })}
                                    {salaryBreakdown.pfVal > 0 && (
                                        <Flex justify="space-between">
                                            <Text fontSize="sm" color={colors.textSecondary}>{t("pf")}</Text>
                                            <Text fontSize="sm" fontWeight="semibold" color="red.500">-{formatAmount(salaryBreakdown.pfVal)}</Text>
                                        </Flex>
                                    )}
                                    {salaryBreakdown.taxVal > 0 && (
                                        <Flex justify="space-between">
                                            <Text fontSize="sm" color={colors.textSecondary}>{t("tax")}</Text>
                                            <Text fontSize="sm" fontWeight="semibold" color="red.500">-{formatAmount(salaryBreakdown.taxVal)}</Text>
                                        </Flex>
                                    )}
                                    {salaryBreakdown.totalDeductionsAndTax > 0 && (
                                        <>
                                            <Divider />
                                            <Flex justify="space-between">
                                                <Text fontSize="sm" fontWeight="bold" color={colors.textPrimary}>{t("total_deductions")}</Text>
                                                <Text fontSize="sm" fontWeight="bold" color="red.500">-{formatAmount(salaryBreakdown.totalDeductionsAndTax)}</Text>
                                            </Flex>
                                        </>
                                    )}
                                    <Divider />
                                    <Flex justify="space-between" bg="teal.50" _dark={{ bg: "teal.900" }} p={3} borderRadius="md">
                                        <Text fontSize="md" fontWeight="bold" color="teal.600" _dark={{ color: "teal.300" }}>{t("net_payable")}</Text>
                                        <Text fontSize="md" fontWeight="bold" color="teal.600" _dark={{ color: "teal.300" }}>{formatAmount(salaryBreakdown.netPayable)}</Text>
                                    </Flex>
                                </VStack>
                            </Box>

                            <Divider mb={8} />

                            {/* Status & Notes */}
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("status")}
                                    </FormLabel>
                                    <Select
                                        {...register("status")}
                                        {...inputProps}
                                    >
                                        <option value="pending">{t("pending")}</option>
                                        <option value="paid">{t("paid")}</option>
                                        <option value="cancelled">{t("cancelled")}</option>
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("paid_date")}
                                    </FormLabel>
                                    <Input
                                        {...register("paid_date")}
                                        type="date"
                                        {...inputProps}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("notes")}
                                    </FormLabel>
                                    <Input
                                        {...register("notes")}
                                        placeholder={t("notes")}
                                        {...inputProps}
                                    />
                                </FormControl>
                            </SimpleGrid>

                            {/* Action Buttons */}
                            <Flex
                                mt={6}
                                justify={{ base: "stretch", md: "flex-end" }}
                                gap={4}
                            >
                                <Button
                                    type="button"
                                    as={ReactRouterLink}
                                    to={HRM_PAYROLL_LIST_PATH}
                                    colorScheme="gray"
                                    variant="outline"
                                    fontWeight="semibold"
                                    px={6}
                                    h={12}
                                    borderRadius="md"
                                    w={{ base: "full", md: "auto" }}
                                    _hover={{ bg: "gray.50" }}
                                >
                                    {t("cancel")}
                                </Button>

                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    loadingText={t("saving_data")}
                                    colorScheme="teal"
                                    bg="teal.500"
                                    color="white"
                                    fontWeight="semibold"
                                    px={8}
                                    h={12}
                                    borderRadius="md"
                                    w={{ base: "full", md: "auto" }}
                                    _hover={{ bg: "teal.600" }}
                                    _active={{ bg: "teal.700" }}
                                    boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)"
                                >
                                    {t("save")}
                                </Button>
                            </Flex>
                        </form>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default PayrollCreate;
