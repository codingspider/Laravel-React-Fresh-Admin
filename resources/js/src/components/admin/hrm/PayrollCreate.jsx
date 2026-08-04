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
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import {
    HRM_PAYROLL_LIST_PATH,
    HRM_PAYROLL_CREATE_PATH,
    DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";
import {
    STORE_PAYROLL,
    GET_PAYROLL,
    UPDATE_PAYROLL,
    LIST_EMPLOYEE,
} from "../../../routes/apiRoutes";
import api from "../../../axios";
import useThemeColors from "../../../hooks/useThemeColors";

const PayrollCreate = () => {
    const colors = useThemeColors();
    const { register, handleSubmit, reset } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [employees, setEmployees] = useState([]);
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    useEffect(() => {
        api.get(LIST_EMPLOYEE, { params: { per_page: 500 } })
            .then((res) => {
                setEmployees(res.data?.data?.data || res.data?.data || []);
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
                            pay_period_start: payroll?.pay_period_start || "",
                            pay_period_end: payroll?.pay_period_end || "",
                            basic_salary: payroll?.basic_salary || "",
                            working_days: payroll?.working_days || "",
                            present_days: payroll?.present_days || "",
                            overtime_hours: payroll?.overtime_hours || "",
                            overtime_rate: payroll?.overtime_rate || "",
                            bonus: payroll?.bonus || "",
                            allowance: payroll?.allowance || "",
                            deduction: payroll?.deduction || "",
                            pf: payroll?.pf || "",
                            tax: payroll?.tax || "",
                            status: payroll?.status || "pending",
                            paid_date: payroll?.paid_date || "",
                            notes: payroll?.notes || "",
                        });
                    }
                })
                .catch(() => {});
        }
    }, [id, isEdit, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = isEdit
                ? await api.put(UPDATE_PAYROLL(id), data)
                : await api.post(STORE_PAYROLL, data);
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
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("employee")}
                                    </FormLabel>
                                    <Select
                                        {...register("employee_id", { required: true })}
                                        placeholder={t("select_employee")}
                                        {...inputProps}
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

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("basic_salary")}
                                    </FormLabel>
                                    <Input
                                        {...register("basic_salary", { required: true })}
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
                                        {...register("working_days", { required: true })}
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        {...inputProps}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("present_days")}
                                    </FormLabel>
                                    <Input
                                        {...register("present_days")}
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        {...inputProps}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("overtime_hours")}
                                    </FormLabel>
                                    <Input
                                        {...register("overtime_hours")}
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        placeholder="0"
                                        {...inputProps}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("overtime_rate")}
                                    </FormLabel>
                                    <Input
                                        {...register("overtime_rate")}
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
                                        {...register("bonus")}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...inputProps}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("allowance")}
                                    </FormLabel>
                                    <Input
                                        {...register("allowance")}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...inputProps}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("deduction")}
                                    </FormLabel>
                                    <Input
                                        {...register("deduction")}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...inputProps}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("pf")}
                                    </FormLabel>
                                    <Input
                                        {...register("pf")}
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
                                        {...register("tax")}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...inputProps}
                                    />
                                </FormControl>

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

                                <FormControl gridColumn={{ base: "auto", md: "span 3" }}>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("notes")}
                                    </FormLabel>
                                    <Textarea
                                        {...register("notes")}
                                        placeholder={t("notes")}
                                        rows={3}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        transition="all 0.2s"
                                    />
                                </FormControl>
                            </SimpleGrid>

                            {/* Action Buttons */}
                            <Flex
                                mt={10}
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
