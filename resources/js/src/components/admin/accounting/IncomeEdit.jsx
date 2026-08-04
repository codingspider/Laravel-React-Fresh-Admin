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
    Switch,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    HStack,
    useToast,
    Flex,
    Text,
    Textarea,
    NumberInput,
    NumberInputField,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { GET_INCOME, UPDATE_INCOME, POS_SETTINGS } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";

const INCOME_LIST = "/accounting/income";
const DASHBOARD_PATH = "/dashboard";

const IncomeEdit = () => {
    const colors = useThemeColors();
    const { register, handleSubmit, reset, watch, setValue } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const account = location.state?.income;

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const res = await api.get(POS_SETTINGS);
                const methods = res.data?.data?.payment_methods || res.data?.data?.active_payment_methods || [];
                setPaymentMethods(methods.filter(m => m.enabled !== false));
            } catch (err) {
                setPaymentMethods([
                    { value: "cash", label: "Cash" },
                    { value: "card", label: "Card" },
                    { value: "bkash", label: "bKash" },
                    { value: "nagad", label: "Nagad" },
                    { value: "rocket", label: "Rocket" },
                ]);
            }
        };
        fetchPaymentMethods();
    }, []);

    useEffect(() => {
        if (account) {
            setValue("source", account.source || "manual_income");
            setValue("income_date", account.income_date?.split("T")[0] || "");
            setValue("payment_method", account.payment_method || "");
            setValue("amount", account.amount || 0);
            setValue("category", account.category || "");
            setValue("reference_number", account.reference_number || "");
            setValue("notes", account.notes || "");
            setValue("account_id", account.account_id || null);
            setValue("branch_id", account.branch_id || null);
            setIsLoading(false);
        }
    }, [account, setValue]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data, amount: parseFloat(data.amount) || 0 };
            const res = await api.put(UPDATE_INCOME(id), payload);
            toast({
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(INCOME_LIST);
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
        document.title = `${app_name} | Income`;
    }, []);

    if (isLoading) {
        return (
            <Box bg={colors.bgSubtle} minH="100vh" py={3}>
                <Text textAlign="center" mt={10}>{t("loading")}</Text>
            </Box>
        );
    }

    return (
        <Box className="form-dark-surface" bg={colors.bgSubtle} minH="100vh" py={3}>
            <Box mx="auto">
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
                                    to={INCOME_LIST}
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
                                    {t("income")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color={colors.textPrimary} fontWeight="bold">
                                    {t("edit")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

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
                                    {t("edit_income")}
                                </Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                                    {account?.reference_number}
                                </Text>
                            </Box>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to={INCOME_LIST}
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
                                        {t("income_source")}
                                    </FormLabel>
                                    <Select
                                        {...register("source", { required: true })}
                                        placeholder={t("select_source")}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        <option value="pos_sale">{t("pos_sale")}</option>
                                        <option value="manual_income">{t("manual_income")}</option>
                                        <option value="other_income">{t("other_income")}</option>
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("income_date")}
                                    </FormLabel>
                                    <Input
                                        {...register("income_date")}
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
                                        {t("payment_method")}
                                    </FormLabel>
                                    <Select
                                        {...register("payment_method")}
                                        placeholder={t("select_payment_method")}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        {paymentMethods.map((pm) => (
                                            <option key={pm.value} value={pm.value}>{pm.label}</option>
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
                                        {t("amount")}
                                    </FormLabel>
                                    <NumberInput min={0} precision={2}>
                                        <NumberInputField
                                            {...register("amount", { required: true })}
                                            placeholder={t("amount")}
                                            bg={colors.bgInput}
                                            border="1px solid"
                                            borderColor={colors.borderInput}
                                            borderRadius="md"
                                            focusBorderColor="teal.500"
                                            _hover={{ borderColor: "gray.300" }}
                                            size="md"
                                            transition="all 0.2s"
                                        />
                                    </NumberInput>
                                </FormControl>

                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("income_category")}
                                    </FormLabel>
                                    <Input
                                        {...register("category")}
                                        type="text"
                                        placeholder={t("income_category")}
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
                                        {t("reference_number")}
                                    </FormLabel>
                                    <Input
                                        {...register("reference_number")}
                                        type="text"
                                        placeholder={t("reference_number")}
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
                            </SimpleGrid>

                            <Flex
                                mt={10}
                                justify={{ base: "stretch", md: "flex-end" }}
                                gap={4}
                            >
                                <Button
                                    type="button"
                                    as={ReactRouterLink}
                                    to={INCOME_LIST}
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
                                    {t("update")}
                                </Button>
                            </Flex>
                        </form>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default IncomeEdit;
