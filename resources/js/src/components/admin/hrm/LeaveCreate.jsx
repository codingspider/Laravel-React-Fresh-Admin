import React, { useState, useEffect } from "react";
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
    Textarea,
    Select,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    useToast,
    Flex,
    Text,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import {
    STORE_LEAVE,
    GET_LEAVE,
    UPDATE_LEAVE,
    LIST_EMPLOYEE,
} from "../../../routes/apiRoutes";
import {
    HRM_LEAVE_LIST_PATH,
    DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";

export default function LeaveCreate() {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const navigate = useNavigate();
    const toast = useToast();
    const { id } = useParams();
    const isEdit = !!id;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [employees, setEmployees] = useState([]);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            employee_id: "",
            type: "annual",
            start_date: "",
            end_date: "",
            reason: "",
            status: "pending",
        },
    });

    useEffect(() => {
        document.title = `${localStorage.getItem("app_name") || ""} | ${t(
            isEdit ? "edit_leave_request" : "add_leave_request"
        )}`;
    }, [t, isEdit]);

    useEffect(() => {
        api.get(LIST_EMPLOYEE, { params: { per_page: 200, status: "active" } })
            .then((res) => setEmployees(res.data?.data?.data || res.data?.data || []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (isEdit) {
            api.get(GET_LEAVE(id))
                .then((res) => {
                    const leave = res.data?.data || res.data?.data?.data;
                    reset({
                        employee_id: leave?.employee_id || "",
                        type: leave?.type || "annual",
                        start_date: leave?.start_date || "",
                        end_date: leave?.end_date || "",
                        reason: leave?.reason || "",
                        status: leave?.status || "pending",
                    });
                })
                .catch(() => {});
        }
    }, [id, isEdit, reset]);

    const onSubmit = async (values) => {
        setIsSubmitting(true);
        try {
            const res = isEdit
                ? await api.put(UPDATE_LEAVE(id), values)
                : await api.post(STORE_LEAVE, values);
            toast({
                title: res.data.message || t(isEdit ? "leave_request_updated" : "leave_request_created"),
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(HRM_LEAVE_LIST_PATH);
        } catch (err) {
            const errorResponse = err?.response?.data;
            const message =
                errorResponse?.errors
                    ? Object.values(errorResponse.errors).flat().join(" ")
                    : errorResponse?.message || t("something_went_wrong");
            toast({
                title: t("error"),
                description: message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
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
                                    to={HRM_LEAVE_LIST_PATH}
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
                                    {t("leave_requests")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color={colors.textPrimary} fontWeight="bold">
                                    {t(isEdit ? "edit_leave_request" : "add_leave_request")}
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
                                    {t(isEdit ? "edit_leave_request" : "add_leave_request")}
                                </Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                                    {t(isEdit ? "update_leave_details" : "create_new_leave_request")}
                                </Text>
                            </Box>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to={HRM_LEAVE_LIST_PATH}
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
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                <FormControl isRequired>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("employee")}
                                    </FormLabel>
                                    <Select
                                        {...register("employee_id", {
                                            required: t("employee_required"),
                                        })}
                                        placeholder={t("select_employee")}
                                        isDisabled={isEdit}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        {employees.map((e) => (
                                            <option key={e.id} value={e.id}>
                                                {e.full_name || e.name}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("type")}
                                    </FormLabel>
                                    <Select
                                        {...register("type", {
                                            required: t("type_required"),
                                        })}
                                        placeholder={t("select_leave_type")}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        <option value="annual">{t("annual")}</option>
                                        <option value="sick">{t("sick")}</option>
                                        <option value="casual">{t("casual")}</option>
                                        <option value="maternity">{t("maternity")}</option>
                                        <option value="paternity">{t("paternity")}</option>
                                        <option value="unpaid">{t("unpaid")}</option>
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("start_date")}
                                    </FormLabel>
                                    <Input
                                        {...register("start_date", {
                                            required: t("start_date_required"),
                                        })}
                                        type="date"
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("end_date")}
                                    </FormLabel>
                                    <Input
                                        {...register("end_date", {
                                            required: t("end_date_required"),
                                        })}
                                        type="date"
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("status")}
                                    </FormLabel>
                                    <Select
                                        {...register("status")}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        <option value="pending">{t("pending")}</option>
                                        <option value="approved">{t("approved")}</option>
                                        <option value="rejected">{t("rejected")}</option>
                                    </Select>
                                </FormControl>

                                <FormControl gridColumn={{ base: "auto", md: "span 2" }}>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("reason")}
                                    </FormLabel>
                                    <Textarea
                                        {...register("reason")}
                                        placeholder={t("reason")}
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
                                    to={HRM_LEAVE_LIST_PATH}
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
                                    {t(isEdit ? "update" : "save")}
                                </Button>
                            </Flex>
                        </form>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
}