import {
    Box,
    Button,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Text,
    SimpleGrid,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    useToast,
    Flex,
    Switch,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { STORE_CUSTOMER } from "../../../routes/apiRoutes";
import { DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { usePermission } from "../../../context/PermissionContext";

const LIST_PATH = "/inventory/customers";

const CustomerCreate = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const navigate = useNavigate();
    const { user } = usePermission();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const colors = useThemeColors();
    const { register, handleSubmit, control } = useForm({
        defaultValues: {
            name: "", company: "", email: "", phone: "",
            address: "", city: "", country: "", notes: "", is_active: true,
        },
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data, restaurant_id: user?.restaurant_id };
            const res = await api.post(STORE_CUSTOMER, payload);
            toast({ title: res.data.message || t("customer_created"), status: "success", duration: 3000, isClosable: true });
            navigate(LIST_PATH);
        } catch (err) {
            const msg = err?.response?.data?.message || t("error");
            toast({ title: t("error"), description: msg, status: "error", duration: 3000, isClosable: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Customer Create`;
    }, []);

    return (
        <Box py={3}>
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
                                    to={LIST_PATH}
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
                                    {t("list")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color={colors.textPrimary} fontWeight="bold">
                                    {t("add")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                {/* Main Form Card */}
                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={colors.bgCard}>
                    <CardHeader bg={colors.bgCard} borderBottom="1px solid" borderColor={colors.borderSubtle} pb={6}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">{t("add")}</Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>{t("create_new_customer")}</Text>
                            </Box>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to={LIST_PATH}
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("name")}
                                    </FormLabel>
                                    <Input
                                        {...register("name")}
                                        type="text"
                                        placeholder={t("name")}
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("company")}
                                    </FormLabel>
                                    <Input
                                        {...register("company")}
                                        type="text"
                                        placeholder={t("company")}
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("email")}
                                    </FormLabel>
                                    <Input
                                        {...register("email")}
                                        type="email"
                                        placeholder={t("email")}
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("phone")}
                                    </FormLabel>
                                    <Input
                                        {...register("phone")}
                                        type="text"
                                        placeholder={t("phone")}
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("city")}
                                    </FormLabel>
                                    <Input
                                        {...register("city")}
                                        type="text"
                                        placeholder={t("city")}
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("country")}
                                    </FormLabel>
                                    <Input
                                        {...register("country")}
                                        type="text"
                                        placeholder={t("country")}
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("address")}
                                    </FormLabel>
                                    <Textarea
                                        {...register("address")}
                                        placeholder={t("address")}
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("notes")}
                                    </FormLabel>
                                    <Textarea
                                        {...register("notes")}
                                        placeholder={t("notes")}
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
                                    <Controller
                                        name="is_active"
                                        control={control}
                                        render={({ field }) => (
                                            <Flex alignItems="center" gap={3}>
                                                <Switch
                                                    colorScheme="teal"
                                                    isChecked={!!field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                />
                                                <Text fontSize="sm" fontWeight="semibold" color={colors.textPrimary}>{t("is_active")}</Text>
                                            </Flex>
                                        )}
                                    />
                                </FormControl>
                            </SimpleGrid>

                            <Flex mt={10} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                                <Button
                                    type="button"
                                    as={ReactRouterLink}
                                    to={LIST_PATH}
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

export default CustomerCreate;
