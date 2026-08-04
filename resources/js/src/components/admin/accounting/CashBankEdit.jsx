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
    Switch,
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
import { GET_CASH_BANK, UPDATE_CASH_BANK, CASH_BANK_ACCOUNTS } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";

const LIST_PATH = "/accounting/cash-bank";

const CashBankEdit = () => {
    const colors = useThemeColors();
    const { register, handleSubmit, setValue } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [cashAccounts, setCashAccounts] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [allAccounts, setAllAccounts] = useState([]);
    const [txnType, setTxnType] = useState("");
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const txn = location.state?.transaction;

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const [cashRes, bankRes, allRes] = await Promise.all([
                    api.get(`${CASH_BANK_ACCOUNTS}?type=cash`),
                    api.get(`${CASH_BANK_ACCOUNTS}?type=bank`),
                    api.get(`${CASH_BANK_ACCOUNTS}?type=all`),
                ]);
                setCashAccounts(cashRes.data?.data || []);
                setBankAccounts(bankRes.data?.data || []);
                setAllAccounts(allRes.data?.data || []);
            } catch (err) {
                console.error("fetch error:", err);
            }
        };
        fetchAccounts();
    }, []);

    useEffect(() => {
        if (txn) {
            setTxnType(txn.type || "");
            setValue("type", txn.type || "");
            setValue("transaction_date", txn.transaction_date?.split("T")[0] || "");
            setValue("account_id", txn.account_id || "");
            setValue("from_account_id", txn.from_account_id || "");
            setValue("to_account_id", txn.to_account_id || "");
            setValue("amount", txn.amount || 0);
            setValue("reference_number", txn.reference_number || "");
            setValue("payment_method", txn.payment_method || "");
            setValue("notes", txn.notes || "");
            setValue("status", txn.status || "completed");
            setIsLoading(false);
        }
    }, [txn, setValue]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data, amount: parseFloat(data.amount) || 0 };
            const res = await api.put(`${UPDATE_CASH_BANK(id)}`, payload);
            toast({ title: res.data.message, status: "success", duration: 3000, isClosable: true });
            navigate(LIST_PATH);
        } catch (err) {
            const errorResponse = err?.response?.data;
            if (errorResponse?.errors) {
                toast({ title: t("error"), description: Object.values(errorResponse.errors).flat().join(" "), status: "error", duration: 3000, isClosable: true });
            } else if (errorResponse?.message) {
                toast({ title: t("error"), description: errorResponse.message, status: "error", duration: 3000, isClosable: true });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Cash & Bank`;
    }, []);

    if (isLoading) {
        return <Box bg={colors.bgSubtle} minH="100vh" py={3}><Text textAlign="center" mt={10}>{t("loading")}</Text></Box>;
    }

    const getAccountOptions = () => {
        if (["cash_deposit", "cash_withdraw"].includes(txnType)) return cashAccounts;
        if (["bank_deposit", "bank_withdraw"].includes(txnType)) return bankAccounts;
        return [];
    };

    return (
        <Box className="form-dark-surface" bg={colors.bgSubtle} minH="100vh" py={3}>
            <Box mx="auto">
                <Card mb={4} bg={colors.bgCard} shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Breadcrumb fontSize="sm" color={colors.textSecondary}>
                            <BreadcrumbItem><BreadcrumbLink as={ReactRouterLink} to="/dashboard" fontWeight="medium" _hover={{ color: "teal.500" }}>{t("dashboard")}</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbItem><BreadcrumbLink as={ReactRouterLink} to={LIST_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>{t("cash_bank")}</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage><BreadcrumbLink color={colors.textPrimary} fontWeight="bold">{t("edit")}</BreadcrumbLink></BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={colors.bgCard}>
                    <CardHeader bg={colors.bgCard} borderBottom="1px solid" borderColor={colors.borderSubtle} pb={6}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">{t("edit_transaction")}</Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>{txn?.reference_number || t("update_expense_record")}</Text>
                            </Box>
                            <Button colorScheme="teal" as={ReactRouterLink} to={LIST_PATH} variant="outline" display={{ base: "none", md: "inline-flex" }} size="sm" fontWeight="600">{t("list")}</Button>
                        </Flex>
                    </CardHeader>

                    <CardBody p={8}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("transaction_type")}</FormLabel>
                                    <Select {...register("type")} placeholder={t("select_transaction_type")} bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md" transition="all 0.2s" onChange={(e) => setTxnType(e.target.value)}>
                                        <option value="cash_deposit">{t("cash_deposit")}</option>
                                        <option value="cash_withdraw">{t("cash_withdraw")}</option>
                                        <option value="bank_deposit">{t("bank_deposit")}</option>
                                        <option value="bank_withdraw">{t("bank_withdraw")}</option>
                                        <option value="transfer">{t("transfer")}</option>
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("transaction_date")}</FormLabel>
                                    <Input {...register("transaction_date")} type="date" bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md" transition="all 0.2s" />
                                </FormControl>

                                {txnType === "transfer" ? (
                                    <>
                                        <FormControl isRequired>
                                            <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("from_account")}</FormLabel>
                                            <Select {...register("from_account_id")} placeholder={t("from_account")} bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md" transition="all 0.2s">
                                                {allAccounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>)}
                                            </Select>
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("to_account")}</FormLabel>
                                            <Select {...register("to_account_id")} placeholder={t("to_account")} bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md" transition="all 0.2s">
                                                {allAccounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>)}
                                            </Select>
                                        </FormControl>
                                    </>
                                ) : (
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("account")}</FormLabel>
                                        <Select {...register("account_id")} placeholder={t("select_account")} bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md" transition="all 0.2s">
                                            {getAccountOptions().map((acc) => <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>)}
                                        </Select>
                                    </FormControl>
                                )}

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("transaction_amount")}</FormLabel>
                                    <NumberInput min={0} precision={2}>
                                        <NumberInputField {...register("amount")} placeholder={t("amount")} bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md" transition="all 0.2s" />
                                    </NumberInput>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("transaction_reference")}</FormLabel>
                                    <Input {...register("reference_number")} type="text" placeholder={t("transaction_reference")} bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md" transition="all 0.2s" />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("payment_method")}</FormLabel>
                                    <Input {...register("payment_method")} type="text" placeholder={t("payment_method")} bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md" transition="all 0.2s" />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("notes")}</FormLabel>
                                    <Textarea {...register("notes")} placeholder={t("notes")} bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md" transition="all 0.2s" />
                                </FormControl>
                            </SimpleGrid>

                            <Flex mt={10} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                                <Button type="button" as={ReactRouterLink} to={LIST_PATH} colorScheme="gray" variant="outline" fontWeight="semibold" px={6} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "gray.50" }}>{t("cancel")}</Button>
                                <Button type="submit" isLoading={isSubmitting} loadingText={t("saving_data")} colorScheme="teal" bg="teal.500" color="white" fontWeight="semibold" px={8} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "teal.600" }}                                 _active={{ bg: "teal.700" }} boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)">{t("update")}</Button>
                            </Flex>
                        </form>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default CashBankEdit;
