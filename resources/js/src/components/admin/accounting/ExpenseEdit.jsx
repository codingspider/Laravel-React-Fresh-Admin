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
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    HStack,
    useToast,
    Flex,
    Text,
    Textarea,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { UPDATE_EXPENSE, POS_SETTINGS } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";

const EXPENSE_LIST = "/accounting/expenses";
const DASHBOARD_PATH = "/dashboard";

const ExpenseEdit = () => {
    const colors = useThemeColors();
    const { register, handleSubmit, reset, watch, setValue } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const expense = location.state?.expense;
    const accountType = watch("type");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accRes, catRes, supRes, posRes] = await Promise.all([
                    api.get("/accounts"),
                    api.get("/expense-categories"),
                    api.get("/suppliers"),
                    api.get(POS_SETTINGS),
                ]);
                const accData = accRes.data?.data?.data || accRes.data?.data || [];
                setAccounts(accData);
                const catData = catRes.data?.data?.data || catRes.data?.data || [];
                setCategories(catData);
                const supData = supRes.data?.data?.data || supRes.data?.data || [];
                setSuppliers(supData);
                const posData = posRes.data?.data?.payment_methods || posRes.data?.data?.active_payment_methods || [];
                setPaymentMethods(posData.filter(m => m.enabled !== false));
            } catch (err) {
                console.error("fetch error:", err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (expense) {
            setValue("accounting_expense_category_id", expense.accounting_expense_category_id || "");
            setValue("account_id", expense.account_id || "");
            setValue("supplier_id", expense.supplier_id || "");
            setValue("reference_number", expense.reference_number || "");
            setValue("payment_method", expense.payment_method || "");
            setValue("amount", expense.amount || 0);
            setValue("expense_date", expense.expense_date?.split("T")[0] || "");
            setValue("notes", expense.notes || "");
            setValue("status", expense.status || "pending");
            setIsLoading(false);
        }
    }, [expense, setValue]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data, amount: parseFloat(data.amount) || 0 };
            const res = await api.put(UPDATE_EXPENSE(id), payload);
            toast({
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(EXPENSE_LIST);
        } catch (err) {
            const errorResponse = err?.response?.data;
            if (errorResponse?.errors) {
                const errorMessage = Object.values(errorResponse.errors).flat().join(" ");
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
        document.title = `${app_name} | Expenses`;
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
                                    to={EXPENSE_LIST}
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
                                    {t("expenses")}
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
                                    {t("edit_expense")}
                                </Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                                    {t("update_expense_record")}
                                </Text>
                            </Box>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to={EXPENSE_LIST}
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
                                        {t("expense_category")}
                                    </FormLabel>
                                    <Select
                                        {...register("accounting_expense_category_id", { required: true })}
                                        placeholder={t("select_expense_category")}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("account")}
                                    </FormLabel>
                                    <Select
                                        {...register("account_id")}
                                        placeholder={t("select_account")}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        {accounts.map((acc) => (
                                            <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("supplier")}
                                    </FormLabel>
                                    <Select
                                        {...register("supplier_id")}
                                        placeholder={t("select_supplier")}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        {suppliers.map((sup) => (
                                            <option key={sup.id} value={sup.id}>{sup.name}</option>
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
                                        {t("payment_method")}
                                    </FormLabel>
                                    <Select
                                        {...register("payment_method", { required: true })}
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
                                    <Input
                                        {...register("amount", { required: true })}
                                        type="number"
                                        step="0.01"
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
                                </FormControl>

                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("expense_date")}
                                    </FormLabel>
                                    <Input
                                        {...register("expense_date")}
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
                                        {t("expense_reference_number")}
                                    </FormLabel>
                                    <Input
                                        {...register("reference_number")}
                                        type="text"
                                        placeholder={t("expense_reference_number")}
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
                                        {t("expense_status")}
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

                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("expense_notes")}
                                    </FormLabel>
                                    <Textarea
                                        {...register("notes")}
                                        placeholder={t("expense_notes")}
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
                                    to={EXPENSE_LIST}
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

export default ExpenseEdit;
