import React, { useState, useEffect, useCallback } from "react";
import { Link as ReactRouterLink } from "react-router-dom";
import {
    Box,
    useToast,
    SimpleGrid,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
    Text,
    Spinner,
    Card,
    CardHeader,
    CardBody,
    Flex,
    Heading,
    Button,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import api from "../../../axios";
import {
    DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";
import {
    STORE_SUBSCRIPTION,
    LIST_RESTAURANT,
    LIST_PLAN,
} from "../../../routes/apiRoutes";

const LIST_PATH = "/subscription/list";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";
import useThemeColors from "../../../hooks/useThemeColors";

const SubscriptionCreate = () => {
    const { register, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: {
            payment_status: "pending",
            payment_method: "offline",
            status: "active",
        },
    });
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [restaurants, setRestaurants] = useState([]);
    const [plans, setPlans] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const toast = useToast();
    const { formatAmount } = useCurrencyFormatter();
    const colors = useThemeColors();

    const cardBg = colors.bgCard;
    const borderColor = colors.borderInput;
    const headerBorderColor = colors.borderSubtle;
    const headingColor = colors.textPrimary;
    const textColor = colors.textSecondary;
    const labelColor = colors.textLabel;
    const fieldBg = colors.bgInput;
    const fieldHoverBorder = "gray.300";

    const selectedPlanId = watch("plan_id");
    const startsAt = watch("starts_at");

    const selectedPlan = plans.find(
        (p) => String(p.id) === String(selectedPlanId)
    );

    const autoCalculateEndsAt = useCallback(
        (planId, start) => {
            const plan = plans.find((p) => String(p.id) === String(planId));
            if (!plan || !start) return;

            const startDate = new Date(start);
            let endDate;
            if (plan.billing_cycle === "monthly") {
                endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + 1);
            } else if (plan.billing_cycle === "yearly") {
                endDate = new Date(startDate);
                endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
                endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + 1);
            }

            setValue("ends_at", endDate.toISOString().split("T")[0]);

            if (plan.trial_days && plan.trial_days > 0) {
                const trialEnd = new Date(startDate);
                trialEnd.setDate(trialEnd.getDate() + plan.trial_days);
                setValue("trial_ends_at", trialEnd.toISOString().split("T")[0]);
                setValue("is_trial", true);
            } else {
                setValue("trial_ends_at", "");
                setValue("is_trial", false);
            }
        },
        [plans, setValue]
    );

    useEffect(() => {
        if (selectedPlanId && startsAt) {
            autoCalculateEndsAt(selectedPlanId, startsAt);
        }
    }, [selectedPlanId, startsAt, autoCalculateEndsAt]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingData(true);
                const [restaurantRes, planRes] = await Promise.all([
                    api.get(LIST_RESTAURANT, { params: { per_page: 9999 } }),
                    api.get(LIST_PLAN, { params: { per_page: 9999 } }),
                ]);
                setRestaurants(restaurantRes.data?.data?.data || restaurantRes.data?.data || []);
                setPlans(planRes.data?.data?.data || planRes.data?.data || []);
            } catch (err) {
                console.error("fetchData error:", err);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = await api.post(STORE_SUBSCRIPTION, data);
            reset();
            toast({
                title: res.data.message || t("success"),
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            window.location.href = LIST_PATH;
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
        document.title = `${app_name} | Create Subscription`;
    }, []);

    if (isLoadingData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
                <Spinner size="xl" color="teal.500" />
            </Box>
        );
    }

    return (
        <Box py={3}>
            <Box mx="auto">
                <Card mb={4} bg={cardBg} shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Breadcrumb fontSize="sm" color={textColor}>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to="/dashboard" fontWeight="medium" _hover={{ color: "teal.500" }}>{t("dashboard")}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to={LIST_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>{t("subscriptions")}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color={headingColor} fontWeight="bold">{t("add")}</BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={cardBg}>
                    <CardHeader bg={cardBg} borderBottom="1px solid" borderColor={headerBorderColor} pb={6}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="sm" color={headingColor} fontWeight="bold">{t("add_subscription")}</Heading>
                                <Text fontSize="sm" color={textColor} mt={1}>{t("create_new_subscription")}</Text>
                            </Box>
                            <Button colorScheme="teal" as={ReactRouterLink} to={LIST_PATH} variant="outline" display={{ base: "none", md: "inline-flex" }} size="sm" fontWeight="600">{t("subscriptions")}</Button>
                        </Flex>
                    </CardHeader>

                    <CardBody p={8}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("restaurant")}</FormLabel>
                                    <Select
                                        {...register("restaurant_id", { required: true })}
                                        placeholder={t("select_restaurant")}
                                        bg={fieldBg}
                                        border="1px solid"
                                        borderColor={borderColor}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: fieldHoverBorder }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        {restaurants.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.name}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("plan")}</FormLabel>
                                    <Select
                                        {...register("plan_id", { required: true })}
                                        placeholder={t("select_plan")}
                                        bg={fieldBg}
                                        border="1px solid"
                                        borderColor={borderColor}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: fieldHoverBorder }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        {plans.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} - {formatAmount(p.price)} ({p.billing_cycle})
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                {selectedPlan && (
                                    <Box gridColumn={{ md: "span 2" }} p={4} bg={fieldBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
                                        <Text fontSize="sm" fontWeight="600" mb={2} color={headingColor}>{t("selected_plan_details")}</Text>
                                        <Text fontSize="sm" color={textColor}>
                                            {t("name")}: {selectedPlan.name} | {t("price")}: {formatAmount(selectedPlan.price)} | {t("billing_cycle")}: {selectedPlan.billing_cycle}
                                        </Text>
                                        {selectedPlan.branch_limit && (
                                            <Text fontSize="sm" color={textColor} mt={1}>
                                                {t("branch_limit")}: {selectedPlan.branch_limit} | {t("user_limit")}: {selectedPlan.user_limit} | {t("invoice_limit")}: {selectedPlan.invoice_limit}
                                            </Text>
                                        )}
                                    </Box>
                                )}

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("starts_at")}</FormLabel>
                                    <Input
                                        {...register("starts_at", { required: true })}
                                        type="date"
                                        bg={fieldBg}
                                        border="1px solid"
                                        borderColor={borderColor}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: fieldHoverBorder }}
                                        size="md"
                                        transition="all 0.2s"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("ends_at")}</FormLabel>
                                    <Input
                                        {...register("ends_at", { required: true })}
                                        type="date"
                                        bg={fieldBg}
                                        border="1px solid"
                                        borderColor={borderColor}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: fieldHoverBorder }}
                                        size="md"
                                        transition="all 0.2s"
                                    />
                                    <Text fontSize="xs" color={textColor} mt={1}>
                                        {t("auto_calculated_from_plan")}
                                    </Text>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("trial_ends_at")}</FormLabel>
                                    <Input
                                        {...register("trial_ends_at")}
                                        type="date"
                                        bg={fieldBg}
                                        border="1px solid"
                                        borderColor={borderColor}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: fieldHoverBorder }}
                                        size="md"
                                        transition="all 0.2s"
                                    />
                                    <Text fontSize="xs" color={textColor} mt={1}>
                                        {t("auto_calculated_from_plan_trial")}
                                    </Text>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("payment_status")}</FormLabel>
                                    <Select
                                        {...register("payment_status")}
                                        bg={fieldBg}
                                        border="1px solid"
                                        borderColor={borderColor}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: fieldHoverBorder }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        <option value="pending">{t("pending")}</option>
                                        <option value="paid">{t("paid")}</option>
                                        <option value="failed">{t("failed")}</option>
                                        <option value="refunded">{t("refunded")}</option>
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("payment_method")}</FormLabel>
                                    <Select
                                        {...register("payment_method")}
                                        bg={fieldBg}
                                        border="1px solid"
                                        borderColor={borderColor}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: fieldHoverBorder }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        <option value="offline">{t("offline")}</option>
                                        <option value="bank_transfer">{t("bank_transfer")}</option>
                                        <option value="cash">{t("cash")}</option>
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("payment_amount")}</FormLabel>
                                    <Input
                                        {...register("payment_amount")}
                                        type="number"
                                        step="0.01"
                                        placeholder={t("payment_amount_placeholder")}
                                        bg={fieldBg}
                                        border="1px solid"
                                        borderColor={borderColor}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: fieldHoverBorder }}
                                        size="md"
                                        transition="all 0.2s"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("payment_date")}</FormLabel>
                                    <Input
                                        {...register("payment_date")}
                                        type="date"
                                        bg={fieldBg}
                                        border="1px solid"
                                        borderColor={borderColor}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: fieldHoverBorder }}
                                        size="md"
                                        transition="all 0.2s"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("payment_reference")}</FormLabel>
                                    <Input
                                        {...register("payment_reference")}
                                        placeholder={t("payment_reference_placeholder")}
                                        bg={fieldBg}
                                        border="1px solid"
                                        borderColor={borderColor}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: fieldHoverBorder }}
                                        size="md"
                                        transition="all 0.2s"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("status")}</FormLabel>
                                    <Select
                                        {...register("status")}
                                        bg={fieldBg}
                                        border="1px solid"
                                        borderColor={borderColor}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: fieldHoverBorder }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        <option value="active">{t("active")}</option>
                                        <option value="inactive">{t("inactive")}</option>
                                    </Select>
                                </FormControl>

                                <FormControl gridColumn={{ md: "span 2" }}>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("notes")}</FormLabel>
                                    <Textarea
                                        {...register("notes")}
                                        placeholder={t("notes_placeholder")}
                                        rows={3}
                                        bg={fieldBg}
                                        border="1px solid"
                                        borderColor={borderColor}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: fieldHoverBorder }}
                                        size="md"
                                        transition="all 0.2s"
                                    />
                                </FormControl>
                            </SimpleGrid>

                            <Flex mt={10} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                                <Button type="button" as={ReactRouterLink} to={LIST_PATH} colorScheme="gray" variant="outline" fontWeight="semibold" px={6} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "gray.50" }}>{t("cancel")}</Button>
                                <Button type="submit" isLoading={isSubmitting} loadingText={t("saving")} colorScheme="teal" bg="teal.500" color="white" fontWeight="semibold" px={8} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "teal.600" }} _active={{ bg: "teal.700" }} boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)">{t("save")}</Button>
                            </Flex>
                        </form>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default SubscriptionCreate;
