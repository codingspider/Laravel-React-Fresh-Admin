import React, { useEffect, useState } from "react";
import { useParams, Link as ReactRouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Box,
    Button,
    SimpleGrid,
    VStack,
    HStack,
    Text,
    Badge,
    useToast,
    useColorModeValue,
    Spinner,
    Card,
    CardHeader,
    CardBody,
    Flex,
    Heading,
    Wrap,
    WrapItem,
    Divider,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import api from "../../../axios";
import { PLAN_LIST_PATH, PLAN_EDIT_PATH, DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

const MODULE_COLORS = {
    hrm: "purple", crm: "blue", inventory: "orange", pos: "green",
    reports: "cyan", kitchen: "red", accounts: "teal", purchasing: "yellow",
    orders: "pink", delivery: "indigo", marketing: "purple", loyalty: "gold",
    recipe: "orange", reviews: "green", notification: "gray", accounting: "teal",
    payroll: "purple", shift: "blue", analytics: "cyan", invoices: "pink",
};

const CYCLE_COLORS = { monthly: "blue", yearly: "green", weekly: "orange", daily: "purple" };

export default function PlanView() {
    const { t } = useTranslation();
    const { id } = useParams();
    const toast = useToast();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const { formatAmount } = useCurrencyFormatter();

    const pageBg = useColorModeValue("gray.50", "gray.900");
    const bg = useColorModeValue("white", "gray.800");
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const headerBorderColor = useColorModeValue("gray.100", "gray.700");
    const headingColor = useColorModeValue("gray.800", "gray.100");
    const textColor = useColorModeValue("gray.500", "gray.400");
    const labelColor = useColorModeValue("gray.500", "gray.400");
    const valueColor = useColorModeValue("gray.800", "gray.100");
    const fieldBg = useColorModeValue("gray.50", "gray.700");
    const fieldHoverBorder = useColorModeValue("gray.300", "gray.600");

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await api.get(`/v1/plans/${id}`);
                setPlan(res.data?.data || res.data);
            } catch {
                toast({ position: "bottom-right", title: t("error_loading_plan"), status: "error", duration: 3000, isClosable: true });
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchPlan();
    }, [id]);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | ${t("plan_details")}`;
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
                <Spinner size="xl" color="teal.500" />
            </Box>
        );
    }

    if (!plan) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
                <Text color={textColor}>{t("plan_not_found")}</Text>
            </Box>
        );
    }

    const isActive = plan.is_active || plan.status === "active";

    return (
        <Box bg={pageBg} minH="100vh" py={3}>
            <Box mx="auto">
                <Card mb={4} bg={cardBg} shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Flex justify="space-between" align="center">
                            <HStack spacing={2}>
                                <Heading size="md" color={headingColor} fontWeight="bold">{plan.name}</Heading>
                                <Badge
                                    colorScheme={isActive ? "green" : "gray"}
                                    variant="subtle"
                                    borderRadius="full"
                                    px={2.5}
                                    py={0.5}
                                    fontSize="xs"
                                    fontWeight="600"
                                >
                                    {isActive ? t("active") : t("inactive")}
                                </Badge>
                            </HStack>
                            <HStack spacing={3}>
                                <Button
                                    as={ReactRouterLink}
                                    to={PLAN_EDIT_PATH.replace(":id", id)}
                                    leftIcon={<EditIcon />}
                                    colorScheme="teal"
                                    size="sm"
                                    fontWeight="600"
                                >
                                    {t("edit")}
                                </Button>
                                <Button
                                    as={ReactRouterLink}
                                    to={PLAN_LIST_PATH}
                                    colorScheme="gray"
                                    variant="outline"
                                    size="sm"
                                    fontWeight="600"
                                >
                                    {t("back_to_list")}
                                </Button>
                            </HStack>
                        </Flex>
                    </CardBody>
                </Card>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                    <Card bg={bg} shadow="xl" borderRadius="xl" border="1px solid" borderColor={borderColor}>
                        <CardHeader pb={0}>
                            <Heading size="sm" color={valueColor} fontWeight="bold">{t("plan_information")}</Heading>
                        </CardHeader>
                        <CardBody pt={4}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                <Box>
                                    <Text fontSize="sm" color={labelColor} mb={1}>{t("name")}</Text>
                                    <Text fontWeight="600" fontSize="lg" color={valueColor}>{plan.name}</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="sm" color={labelColor} mb={1}>{t("slug")}</Text>
                                    <Text fontWeight="600" fontSize="lg" color={valueColor}>{plan.slug || "-"}</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="sm" color={labelColor} mb={1}>{t("price")}</Text>
                                    <Text fontWeight="600" fontSize="lg" color="teal.500">{formatAmount(plan.price)}</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="sm" color={labelColor} mb={1}>{t("billing_cycle")}</Text>
                                    <Badge colorScheme={CYCLE_COLORS[plan.billing_cycle] || "gray"} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" textTransform="capitalize">
                                        {plan.billing_cycle}
                                    </Badge>
                                </Box>
                                <Box gridColumn={{ md: "span 2" }}>
                                    <Text fontSize="sm" color={labelColor} mb={1}>{t("description")}</Text>
                                    <Text fontWeight="500" fontSize="md" color={valueColor}>{plan.description || "-"}</Text>
                                </Box>
                            </SimpleGrid>
                        </CardBody>
                    </Card>

                    <Card bg={bg} shadow="xl" borderRadius="xl" border="1px solid" borderColor={borderColor}>
                        <CardHeader pb={0}>
                            <Heading size="sm" color={valueColor} fontWeight="bold">{t("limits_and_status")}</Heading>
                        </CardHeader>
                        <CardBody pt={4}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                <Box>
                                    <Text fontSize="sm" color={labelColor} mb={1}>{t("branch_limit")}</Text>
                                    <Text fontWeight="600" fontSize="lg" color={valueColor}>{plan.branch_limit ?? "-"}</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="sm" color={labelColor} mb={1}>{t("user_limit")}</Text>
                                    <Text fontWeight="600" fontSize="lg" color={valueColor}>{plan.user_limit ?? "-"}</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="sm" color={labelColor} mb={1}>{t("invoice_limit")}</Text>
                                    <Text fontWeight="600" fontSize="lg" color={valueColor}>{plan.invoice_limit ?? "-"}</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="sm" color={labelColor} mb={1}>{t("status")}</Text>
                                    <Badge
                                        colorScheme={isActive ? "green" : "gray"}
                                        variant="subtle"
                                        borderRadius="full"
                                        px={2.5}
                                        py={0.5}
                                        fontSize="xs"
                                        fontWeight="600"
                                    >
                                        {isActive ? t("active") : t("inactive")}
                                    </Badge>
                                </Box>
                            </SimpleGrid>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                <Card bg={bg} shadow="xl" borderRadius="xl" border="1px solid" borderColor={borderColor} mt={6}>
                    <CardHeader pb={0}>
                        <Heading size="sm" color={valueColor} fontWeight="bold">{t("assigned_packages")}</Heading>
                    </CardHeader>
                    <CardBody pt={4}>
                        {plan.packages && plan.packages.length > 0 ? (
                            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
                                {plan.packages.map((pkg) => (
                                    <Box
                                        key={pkg.id}
                                        p={4}
                                        border="1px solid"
                                        borderColor={borderColor}
                                        borderRadius="lg"
                                        bg={fieldBg}
                                    >
                                        <Text fontWeight="600" fontSize="md" color={valueColor} mb={2}>{pkg.name}</Text>
                                        <Text fontSize="sm" color={labelColor} mb={3} noOfLines={2}>{pkg.description || "-"}</Text>
                                        {pkg.modules && pkg.modules.length > 0 && (
                                            <Wrap spacing={1}>
                                                {pkg.modules.map((mod, i) => (
                                                    <WrapItem key={i}>
                                                        <Badge
                                                            colorScheme={MODULE_COLORS[mod] || "gray"}
                                                            variant="subtle"
                                                            borderRadius="full"
                                                            px={2}
                                                            py={0.5}
                                                            fontSize="xs"
                                                            textTransform="capitalize"
                                                        >
                                                            {mod}
                                                        </Badge>
                                                    </WrapItem>
                                                ))}
                                            </Wrap>
                                        )}
                                    </Box>
                                ))}
                            </SimpleGrid>
                        ) : (
                            <Text fontSize="sm" color={textColor}>{t("no_packages_assigned")}</Text>
                        )}
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
}
