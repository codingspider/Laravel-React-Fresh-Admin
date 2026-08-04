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
    NumberInput,
    NumberInputField,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { STORE_ACCOUNT } from "../../../routes/apiRoutes";
import { POS_SETTINGS } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";

const ACCOUNT_LIST = "/accounting/accounts";

const AccountCreate = () => {
    const colors = useThemeColors();
    const { register, handleSubmit, reset, watch } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const toast = useToast();
    const navigate = useNavigate();

    const accountType = watch("type");

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

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data, opening_balance: parseFloat(data.opening_balance) || 0 };
            const res = await api.post(STORE_ACCOUNT, payload);
            reset();
            toast({
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(ACCOUNT_LIST);
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
        document.title = `${app_name} | Chart of Accounts`;
    }, []);

    return (
        <Box className="form-dark-surface" bg={colors.bgSubtle} minH="100vh" py={3}>
            <Box mx="auto">
                <Card mb={4} bg={colors.bgCard} shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Breadcrumb fontSize="sm" color={colors.textSecondary}>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    as={ReactRouterLink}
                                    to="/dashboard"
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
                                    {t("dashboard")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    as={ReactRouterLink}
                                    to={ACCOUNT_LIST}
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
                                    {t("accounts")}
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
                                    {t("add_account")}
                                </Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                                    {t("create_new_account")}
                                </Text>
                            </Box>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to={ACCOUNT_LIST}
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
                                        {t("account_code")}
                                    </FormLabel>
                                    <Input
                                        {...register("code", { required: true })}
                                        type="text"
                                        placeholder={t("account_code")}
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
                                        {t("account_name")}
                                    </FormLabel>
                                    <Input
                                        {...register("name", { required: true })}
                                        type="text"
                                        placeholder={t("account_name")}
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
                                        {t("type")}
                                    </FormLabel>
                                    <Select
                                        {...register("type", { required: true })}
                                        placeholder={t("select_type")}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        <option value="asset">{t("asset")}</option>
                                        <option value="liability">{t("liability")}</option>
                                        <option value="equity">{t("equity")}</option>
                                        <option value="income">{t("income")}</option>
                                        <option value="expense">{t("expense")}</option>
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("account_group")}
                                    </FormLabel>
                                    <Select
                                        {...register("account_group", { required: true })}
                                        placeholder={t("select_group")}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        {accountType === "asset" && (
                                            <>
                                                {paymentMethods.map((pm) => (
                                                    <option key={pm.value} value={pm.value}>{pm.label}</option>
                                                ))}
                                                <option value="accounts_receivable">{t("accounts_receivable")}</option>
                                                <option value="inventory">{t("inventory")}</option>
                                            </>
                                        )}
                                        {accountType === "liability" && (
                                            <>
                                                <option value="accounts_payable">{t("accounts_payable")}</option>
                                                <option value="customer_advance">{t("customer_advance")}</option>
                                                <option value="vat_payable">{t("vat_payable")}</option>
                                            </>
                                        )}
                                        {accountType === "income" && (
                                            <>
                                                <option value="food_sales">{t("food_sales")}</option>
                                                <option value="beverage_sales">{t("beverage_sales")}</option>
                                                <option value="delivery_charge">{t("delivery_charge")}</option>
                                                <option value="other_income">{t("other_income")}</option>
                                            </>
                                        )}
                                        {accountType === "expense" && (
                                            <>
                                                <option value="purchase">{t("purchase")}</option>
                                                <option value="salary">{t("salary")}</option>
                                                <option value="rent">{t("rent")}</option>
                                                <option value="electricity">{t("electricity")}</option>
                                                <option value="gas">{t("gas")}</option>
                                                <option value="internet">{t("internet")}</option>
                                                <option value="marketing">{t("marketing")}</option>
                                                <option value="maintenance">{t("maintenance")}</option>
                                                <option value="misc_expense">{t("misc_expense")}</option>
                                            </>
                                        )}
                                        {accountType === "equity" && (
                                            <option value="owner_equity">{t("owner_equity")}</option>
                                        )}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("description")}
                                    </FormLabel>
                                    <Input
                                        {...register("description")}
                                        type="text"
                                        placeholder={t("description")}
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
                                        {t("opening_balance")}
                                    </FormLabel>
                                    <NumberInput min={0} precision={2}>
                                        <NumberInputField
                                            {...register("opening_balance")}
                                            placeholder={t("opening_balance")}
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
                                        {t("status")}
                                    </FormLabel>
                                    <HStack>
                                        <Switch
                                            {...register("status")}
                                            defaultChecked
                                            colorScheme="teal"
                                            value="active"
                                        />
                                        <Text fontSize="sm" color={colors.textSecondary}>
                                            {t("active")}
                                        </Text>
                                    </HStack>
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
                                    to={ACCOUNT_LIST}
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

export default AccountCreate;
