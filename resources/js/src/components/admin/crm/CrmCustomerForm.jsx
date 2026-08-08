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
    Select,
    Textarea,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    useToast,
    Flex,
    Switch,
    VStack,
    Checkbox,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { CRM_CUSTOMERS, CRM_CUSTOMER, CRM_SEGMENTS_ALL } from "../../../routes/apiRoutes";
import {
    DASHBOARD_PATH,
    CRM_DASHBOARD_PATH,
    CRM_CUSTOMER_LIST_PATH,
} from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";

const SOURCE_OPTIONS = ["manual", "pos", "web", "qr", "reservation", "delivery"];
const LEAD_STATUS_OPTIONS = ["new", "contacted", "qualified", "won", "lost"];
const GENDER_OPTIONS = ["male", "female", "other"];

const CrmCustomerForm = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [segmentOptions, setSegmentOptions] = useState([]);
    const colors = useThemeColors();
    const { register, handleSubmit, control, reset, watch, setValue } = useForm({
        defaultValues: {
            name: "", company: "", email: "", phone: "",
            address: "", city: "", country: "", notes: "",
            dob: "", anniversary: "", gender: "", favourite_food: "",
            source: "manual", lead_status: "new", segment_ids: [], is_active: true,
        },
    });

    const selectedSegments = watch("segment_ids") || [];

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | ${isEdit ? "Edit Customer" : "Create Customer"}`;
    }, [isEdit]);

    useEffect(() => {
        api.get(CRM_SEGMENTS_ALL).then((res) => {
            const items = res.data?.data || [];
            setSegmentOptions(items);
        }).catch(() => setSegmentOptions([]));
    }, []);

    useEffect(() => {
        if (!isEdit) return;
        api.get(CRM_CUSTOMER(id)).then((res) => {
            const customer = res.data?.data || res.data || {};
            const segments = Array.isArray(customer.segments) ? customer.segments.map((s) => s.id) : [];
            reset({
                name: customer.name || "",
                company: customer.company || "",
                email: customer.email || "",
                phone: customer.phone || "",
                address: customer.address || "",
                city: customer.city || "",
                country: customer.country || "",
                notes: customer.notes || "",
                dob: customer.dob || "",
                anniversary: customer.anniversary || "",
                gender: customer.gender || "",
                favourite_food: customer.favourite_food || "",
                source: customer.source || "manual",
                lead_status: customer.lead_status || "new",
                segment_ids: segments,
                is_active: customer.is_active !== false,
            });
        }).catch((err) => {
            toast({
                title: t("Failed to load customer"),
                description: err.response?.data?.message || t("Something went wrong"),
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        });
    }, [isEdit, id, reset, toast]);

    const toggleSegment = (segmentId) => {
        const current = watch("segment_ids") || [];
        setValue("segment_ids", current.includes(segmentId)
            ? current.filter((sid) => sid !== segmentId)
            : [...current, segmentId]);
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data };
            if (isEdit) {
                await api.put(CRM_CUSTOMER(id), payload);
            } else {
                await api.post(CRM_CUSTOMERS, payload);
            }
            toast({
                title: isEdit ? t("Customer updated") : t("Customer created"),
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(CRM_CUSTOMER_LIST_PATH);
        } catch (err) {
            const msg = err?.response?.data?.message || t("Something went wrong");
            toast({ title: t("Error"), description: msg, status: "error", duration: 3000, isClosable: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyles = {
        bg: colors.bgInput,
        border: "1px solid",
        borderColor: colors.borderInput,
        borderRadius: "md",
        focusBorderColor: "teal.500",
        _hover: { borderColor: "gray.300" },
        size: "md",
    };

    return (
        <Box py={3}>
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
                                    {t("Dashboard")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    as={ReactRouterLink}
                                    to={CRM_DASHBOARD_PATH}
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
                                    {t("CRM")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    as={ReactRouterLink}
                                    to={CRM_CUSTOMER_LIST_PATH}
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
                                    {t("Customers")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color={colors.textPrimary} fontWeight="bold">
                                    {isEdit ? t("Edit") : t("Add")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={colors.bgCard}>
                    <CardHeader bg={colors.bgCard} borderBottom="1px solid" borderColor={colors.borderSubtle} pb={6}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">
                                    {isEdit ? t("Edit Customer") : t("Add Customer")}
                                </Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                                    {t("Customer 360 profile management")}
                                </Text>
                            </Box>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to={CRM_CUSTOMER_LIST_PATH}
                                variant="outline"
                                display={{ base: "none", md: "inline-flex" }}
                                size="sm"
                                fontWeight="600"
                            >
                                {t("List")}
                            </Button>
                        </Flex>
                    </CardHeader>
                    <CardBody p={8}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Heading size="xs" color={colors.textLabel} fontWeight="bold" mb={4}>
                                {t("Basic Information")}
                            </Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("Name")}
                                    </FormLabel>
                                    <Input {...register("name")} type="text" placeholder={t("Customer name")} {...inputStyles} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("Company")}
                                    </FormLabel>
                                    <Input {...register("company")} type="text" placeholder={t("Company")} {...inputStyles} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("Email")}
                                    </FormLabel>
                                    <Input {...register("email")} type="email" placeholder={t("Email")} {...inputStyles} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("Phone")}
                                    </FormLabel>
                                    <Input {...register("phone")} type="text" placeholder={t("Phone")} {...inputStyles} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("City")}
                                    </FormLabel>
                                    <Input {...register("city")} type="text" placeholder={t("City")} {...inputStyles} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("Country")}
                                    </FormLabel>
                                    <Input {...register("country")} type="text" placeholder={t("Country")} {...inputStyles} />
                                </FormControl>

                                <FormControl gridColumn={{ base: "auto", md: "span 2" }}>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("Address")}
                                    </FormLabel>
                                    <Textarea {...register("address")} placeholder={t("Address")} {...inputStyles} />
                                </FormControl>
                            </SimpleGrid>

                            <Heading size="xs" color={colors.textLabel} fontWeight="bold" mb={4} mt={8}>
                                {t("CRM Information")}
                            </Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("Date of Birth")}
                                    </FormLabel>
                                    <Input {...register("dob")} type="date" {...inputStyles} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("Anniversary")}
                                    </FormLabel>
                                    <Input {...register("anniversary")} type="date" {...inputStyles} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("Gender")}
                                    </FormLabel>
                                    <Select {...register("gender")} placeholder={t("Select gender")} {...inputStyles}>
                                        {GENDER_OPTIONS.map((gender) => (
                                            <option key={gender} value={gender} style={{ textTransform: 'capitalize' }}>
                                                {t(gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'Other')}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("Favourite Food")}
                                    </FormLabel>
                                    <Input {...register("favourite_food")} type="text" placeholder={t("Favourite food")} {...inputStyles} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("Source")}
                                    </FormLabel>
                                    <Select {...register("source")} {...inputStyles}>
                                        {SOURCE_OPTIONS.map((source) => (
                                            <option key={source} value={source} style={{ textTransform: 'capitalize' }}>
                                                {t(source === 'manual' ? 'Manual' : source === 'pos' ? 'POS' : source === 'web' ? 'Web' : source === 'qr' ? 'QR' : source === 'reservation' ? 'Reservation' : 'Delivery')}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("Lead Status")}
                                    </FormLabel>
                                    <Select {...register("lead_status")} {...inputStyles}>
                                        {LEAD_STATUS_OPTIONS.map((status) => (
                                            <option key={status} value={status} style={{ textTransform: 'capitalize' }}>
                                                {t(status === 'new' ? 'New' : status === 'contacted' ? 'Contacted' : status === 'qualified' ? 'Qualified' : status === 'won' ? 'Won' : 'Lost')}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl gridColumn={{ base: "auto", md: "span 2" }}>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("Segments")}
                                    </FormLabel>
                                    {segmentOptions.length === 0 ? (
                                        <Text fontSize="sm" color="gray.500">{t("No segments available")}</Text>
                                    ) : (
                                        <Flex wrap="wrap" gap={3}>
                                            {segmentOptions.map((segment) => (
                                                <Checkbox
                                                    key={segment.id}
                                                    isChecked={selectedSegments.includes(segment.id)}
                                                    onChange={() => toggleSegment(segment.id)}
                                                    colorScheme="teal"
                                                    size="md"
                                                >
                                                    {segment.name}
                                                </Checkbox>
                                            ))}
                                        </Flex>
                                    )}
                                </FormControl>

                                <FormControl gridColumn={{ base: "auto", md: "span 2" }}>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("Notes")}
                                    </FormLabel>
                                    <Textarea {...register("notes")} placeholder={t("Internal notes about this customer")} {...inputStyles} />
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
                                                <Text fontSize="sm" fontWeight="semibold" color={colors.textPrimary}>{t("Active")}</Text>
                                            </Flex>
                                        )}
                                    />
                                </FormControl>
                            </SimpleGrid>

                            <Flex mt={10} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                                <Button
                                    type="button"
                                    as={ReactRouterLink}
                                    to={CRM_CUSTOMER_LIST_PATH}
                                    colorScheme="gray"
                                    variant="outline"
                                    fontWeight="semibold"
                                    px={6}
                                    h={12}
                                    borderRadius="md"
                                    w={{ base: "full", md: "auto" }}
                                >
                                    {t("Cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    loadingText={t("Saving...")}
                                    colorScheme="teal"
                                    bg="teal.500"
                                    color="white"
                                    fontWeight="semibold"
                                    px={8}
                                    h={12}
                                    borderRadius="md"
                                    w={{ base: "full", md: "auto" }}
                                >
                                    {isEdit ? t("Update") : t("Save")}
                                </Button>
                            </Flex>
                        </form>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default CrmCustomerForm;
