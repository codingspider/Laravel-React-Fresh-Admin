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
    useToast,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Flex,
    Text,
    IconButton,
    HStack,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm, useFieldArray } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { GET_JOURNAL, UPDATE_JOURNAL, JOURNAL_CREATE_DATA, LIST_JOURNAL } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { Plus, Trash2 } from "lucide-react";

const JOURNAL_LIST = "/accounting/journal";
const DASHBOARD_PATH = "/dashboard";

const JournalEntryEdit = () => {
    const colors = useThemeColors();
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [accounts, setAccounts] = useState([]);

    const { register, handleSubmit, reset, control, watch, setValue } = useForm({
        defaultValues: {
            entry_date: "",
            reference_id: "",
            description: "",
            entries: [],
        },
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "entries",
    });

    useEffect(() => {
        document.title = `${localStorage.getItem("app_name")} | ${t("edit_journal_entry")}`;
    }, [t]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const accountsRes = await api.get(JOURNAL_CREATE_DATA);
                setAccounts(accountsRes.data?.data?.accounts || []);

                const journalRes = await api.get(GET_JOURNAL(id));
                const voucher = journalRes.data?.data?.voucher_number;
                const entryDate = journalRes.data?.data?.entry_date;
                const referenceId = journalRes.data?.data?.reference_number;
                const description = journalRes.data?.data?.description;

                const entriesRes = await api.get(LIST_JOURNAL, {
                    params: { voucher_number: voucher, per_page: 100 },
                });
                const allEntries = entriesRes.data?.data?.data || entriesRes.data?.data || [];

                const journalEntries = allEntries
                    .filter(e => e.voucher_number === voucher)
                    .map(e => ({
                        account_id: e.account?.id || e.account_id,
                        entry_type: e.entry_type,
                        amount: e.amount,
                        description: e.description || "",
                    }));

                reset({
                    entry_date: entryDate ? entryDate.split("T")[0] : new Date().toISOString().split("T")[0],
                    reference_id: referenceId || "",
                    description: description || "",
                    entries: journalEntries.length > 0 ? journalEntries : [{ account_id: "", entry_type: "debit", amount: "", description: "" }],
                });
            } catch (err) {
                console.error("fetchData error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, reset, t]);

    const addEntry = () => {
        append({ account_id: "", entry_type: "debit", amount: "", description: "" });
    };

    const onSubmit = async (data) => {
        let debitTotal = 0;
        let creditTotal = 0;
        data.entries.forEach((entry) => {
            const amt = parseFloat(entry.amount) || 0;
            if (entry.entry_type === "debit") debitTotal += amt;
            if (entry.entry_type === "credit") creditTotal += amt;
        });

        if (Math.abs(debitTotal - creditTotal) > 0.01) {
            toast({
                title: t("error"),
                description: t("balance_mismatch"),
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                entry_date: data.entry_date,
                reference_id: data.reference_id,
                description: data.description,
                entries: data.entries.map((entry) => ({
                    account_id: entry.account_id,
                    entry_type: entry.entry_type,
                    amount: parseFloat(entry.amount) || 0,
                    description: entry.description,
                })),
            };

            const res = await api.put(UPDATE_JOURNAL(id), payload);
            toast({
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(JOURNAL_LIST);
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

    if (isLoading) {
        return <Box p={8}>{t("loading")}...</Box>;
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
                                    to={JOURNAL_LIST}
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
                                    {t("journal_entries")}
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
                                    {t("edit_journal_entry")}
                                </Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                                    {t("create_balanced_journal")}
                                </Text>
                            </Box>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to={JOURNAL_LIST}
                                variant="outline"
                                size="sm"
                                fontWeight="600"
                                display={{ base: "none", md: "inline-flex" }}
                            >
                                {t("list")}
                            </Button>
                        </Flex>
                    </CardHeader>

                    <CardBody p={8}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("entry_date")}
                                    </FormLabel>
                                    <Input
                                        {...register("entry_date", { required: true })}
                                        type="date"
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("voucher_number")}
                                    </FormLabel>
                                    <Input
                                        {...register("reference_id")}
                                        type="text"
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                    />
                                </FormControl>

                                <FormControl style={{ gridColumn: "1 / -1" }}>
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
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                    />
                                </FormControl>
                            </SimpleGrid>

                            <Box mt={8}>
                                <Flex justify="space-between" align="center" mb={4}>
                                    <Heading size="sm" color={colors.textPrimary} fontWeight="bold">
                                        {t("entries")}
                                    </Heading>
                                    <Button
                                        leftIcon={<Plus size={16} />}
                                        onClick={addEntry}
                                        colorScheme="teal"
                                        size="sm"
                                        fontWeight="600"
                                    >
                                        {t("add_entry")}
                                    </Button>
                                </Flex>

                                <Box overflowX="auto">
                                    <Table variant="simple" width="100%">
                                        <Thead bg={colors.bgSubtle}>
                                            <Tr>
                                                <Th>{t("account_name")}</Th>
                                                <Th width="120px">{t("entry_type")}</Th>
                                                <Th width="120px">{t("debit")}</Th>
                                                <Th width="120px">{t("credit")}</Th>
                                                <Th>{t("description")}</Th>
                                                <Th width="50px">{t("actions")}</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {fields.map((field, index) => (
                                                <Tr key={field.id}>
                                                    <Td>
                                                        <Select
                                                            {...register(`entries.${index}.account_id`, { required: true })}
                                                            bg={colors.bgInput}
                                                            border="1px solid"
                                                            borderColor={colors.borderInput}
                                                            borderRadius="md"
                                                            focusBorderColor="teal.500"
                                                            size="sm"
                                                        >
                                                            <option value="">{t("select_account")}</option>
                                                            {accounts.map((acc) => (
                                                                <option key={acc.id} value={acc.id}>
                                                                    {acc.code} - {acc.name}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                    </Td>
                                                    <Td>
                                                        <Select
                                                            {...register(`entries.${index}.entry_type`)}
                                                            bg={colors.bgInput}
                                                            border="1px solid"
                                                            borderColor={colors.borderInput}
                                                            borderRadius="md"
                                                            focusBorderColor="teal.500"
                                                            size="sm"
                                                        >
                                                            <option value="debit">{t("debit")}</option>
                                                            <option value="credit">{t("credit")}</option>
                                                        </Select>
                                                    </Td>
                                                    <Td>
                                                        {watch(`entries.${index}.entry_type`) === "debit" && (
                                                            <Input
                                                                {...register(`entries.${index}.amount`)}
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                placeholder="0.00"
                                                                bg={colors.bgInput}
                                                                border="1px solid"
                                                                borderColor={colors.borderInput}
                                                                borderRadius="md"
                                                                focusBorderColor="teal.500"
                                                                size="sm"
                                                            />
                                                        )}
                                                    </Td>
                                                    <Td>
                                                        {watch(`entries.${index}.entry_type`) === "credit" && (
                                                            <Input
                                                                {...register(`entries.${index}.amount`)}
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                placeholder="0.00"
                                                                bg={colors.bgInput}
                                                                border="1px solid"
                                                                borderColor={colors.borderInput}
                                                                borderRadius="md"
                                                                focusBorderColor="teal.500"
                                                                size="sm"
                                                            />
                                                        )}
                                                    </Td>
                                                    <Td>
                                                        <Input
                                                            {...register(`entries.${index}.description`)}
                                                            type="text"
                                                            placeholder={t("description")}
                                                            bg={colors.bgInput}
                                                            border="1px solid"
                                                            borderColor={colors.borderInput}
                                                            borderRadius="md"
                                                            focusBorderColor="teal.500"
                                                            size="sm"
                                                        />
                                                    </Td>
                                                    <Td>
                                                        {fields.length > 1 && (
                                                            <IconButton
                                                                aria-label={t("delete")}
                                                                icon={<Trash2 size={16} />}
                                                                onClick={() => remove(index)}
                                                                colorScheme="red"
                                                                variant="outline"
                                                                size="sm"
                                                            />
                                                        )}
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </Box>

                            <Box mt={8} bg={colors.bgSubtle} borderRadius="lg" p={4}>
                                <HStack justify="flex-end" spacing={8}>
                                    <Flex justify="space-between" minW="150px">
                                        <Text fontWeight="semibold" color={colors.textPrimary}>{t("debit")}:</Text>
                                        <Text fontWeight="bold" color="green.500">
                                            {watch("entries").reduce((sum, f) => sum + (f.entry_type === "debit" ? parseFloat(f.amount) || 0 : 0), 0).toFixed(2)}
                                        </Text>
                                    </Flex>
                                    <Flex justify="space-between" minW="150px">
                                        <Text fontWeight="semibold" color={colors.textPrimary}>{t("credit")}:</Text>
                                        <Text fontWeight="bold" color="blue.500">
                                            {watch("entries").reduce((sum, f) => sum + (f.entry_type === "credit" ? parseFloat(f.amount) || 0 : 0), 0).toFixed(2)}
                                        </Text>
                                    </Flex>
                                </HStack>
                            </Box>

                            <Flex mt={10} justify="flex-end" gap={4}>
                                <Button
                                    type="button"
                                    as={ReactRouterLink}
                                    to={JOURNAL_LIST}
                                    colorScheme="gray"
                                    variant="outline"
                                    fontWeight="semibold"
                                    px={6}
                                    h={12}
                                    borderRadius="md"
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
                                    _hover={{ bg: "teal.600" }}
                                    _active={{ bg: "teal.700" }}
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

export default JournalEntryEdit;
