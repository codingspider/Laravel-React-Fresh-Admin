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
    HStack,
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
    HRM_DEPARTMENT_LIST_PATH,
    DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";
import {
    STORE_DEPARTMENT,
    GET_DEPARTMENT,
    UPDATE_DEPARTMENT,
} from "../../../routes/apiRoutes";
import api from "../../../axios";
import useThemeColors from "../../../hooks/useThemeColors";

const DepartmentCreate = () => {
    const colors = useThemeColors();
    const { register, handleSubmit, reset } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = isEdit
                ? await api.put(UPDATE_DEPARTMENT(id), data)
                : await api.post(STORE_DEPARTMENT, data);
            reset();
            toast({
                title: res.data.message || t(isEdit ? "department_updated" : "department_created"),
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(HRM_DEPARTMENT_LIST_PATH);
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

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | ${isEdit ? "Department Update" : "Department Create"}`;
    }, [isEdit]);

    useEffect(() => {
        if (isEdit) {
            api.get(GET_DEPARTMENT(id))
                .then((res) => {
                    const dept = res.data?.data || res.data?.data?.data;
                    if (dept) {
                        reset({
                            name: dept?.name || "",
                            slug: dept?.slug || "",
                            description: dept?.description || "",
                            status: dept?.status || "active",
                        });
                    }
                })
                .catch(() => {});
        }
    }, [id, isEdit, reset]);

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
                                    to={HRM_DEPARTMENT_LIST_PATH}
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
                                    {t("departments")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color={colors.textPrimary} fontWeight="bold">
                                    {t(isEdit ? "edit_department" : "add_department")}
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
                                    {t(isEdit ? "edit_department" : "add_department")}
                                </Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                                    {t(isEdit ? "update_department_details" : "create_new_department")}
                                </Text>
                            </Box>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to={HRM_DEPARTMENT_LIST_PATH}
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
                                        {t("name")}
                                    </FormLabel>
                                    <Input
                                        {...register("name", { required: true })}
                                        type="text"
                                        placeholder={t("department_name")}
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
                                        {t("slug")}
                                    </FormLabel>
                                    <Input
                                        {...register("slug")}
                                        type="text"
                                        placeholder={t("slug")}
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

                                <FormControl gridColumn={{ base: "auto", md: "span 2" }}>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("description")}
                                    </FormLabel>
                                    <Textarea
                                        {...register("description")}
                                        placeholder={t("description")}
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

                                <FormControl isRequired>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("status")}
                                    </FormLabel>
                                    <Select
                                        {...register("status", { required: true })}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        <option value="active">{t('active')}</option>
                                        <option value="inactive">{t('inactive')}</option>
                                    </Select>
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
                                    to={HRM_DEPARTMENT_LIST_PATH}
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

export default DepartmentCreate;