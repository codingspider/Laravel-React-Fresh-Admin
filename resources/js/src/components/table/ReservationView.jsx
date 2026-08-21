import {
    Box,
    Button,
    Card,
    CardHeader,
    CardBody,
    Heading,
    SimpleGrid,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    useToast,
    Flex,
    Text,
    Spinner,
    Center,
    Badge,
    HStack,
    Divider,
    Stat,
    StatLabel,
    StatNumber,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../axios";
import { GET_RESERVATION } from "../../routes/apiRoutes";
import useThemeColors from "../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../useCurrencyFormatter";

const RESERVATION_LIST = '/table-management/reservations';
const DASHBOARD_PATH = '/dashboard';

const statusColors = {
    pending: "yellow",
    confirmed: "green",
    seated: "blue",
    completed: "gray",
    cancelled: "red",
    no_show: "orange",
};

const ReservationView = () => {
    const colors = useThemeColors();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const toast = useToast();
    const { formatAmount } = useCurrencyFormatter();
    const [reservation, setReservation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const getReservation = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(GET_RESERVATION(id));
            setReservation(res.data?.data);
        } catch (error) {
            toast({
                title: t("error"),
                description: t("failed_to_load_reservation_data"),
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | ${t("reservation_details")}`;
        getReservation();
    }, [id]);

    if (isLoading) {
        return (
            <Box bg={colors.bgSubtle} minH="100vh" py={3}>
                <Box mx="auto">
                    <Flex justify="center" align="center" h="60">
                        <Spinner size="xl" color="teal.500" />
                    </Flex>
                </Box>
            </Box>
        );
    }

    if (!reservation) {
        return (
            <Box bg={colors.bgSubtle} minH="100vh" py={3}>
                <Box mx="auto">
                    <Center h="60">
                        <Text color={colors.textSecondary} fontSize="lg">
                            {t("reservation_not_found")}
                        </Text>
                    </Center>
                </Box>
            </Box>
        );
    }

    return (
        <Box className="form-dark-surface" bg={colors.bgSubtle} minH="100vh" py={3}>
            <Box mx="auto">

                {/* Modern Breadcrumb */}
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
                                    to={RESERVATION_LIST}
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
                                    {t("list")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color={colors.textPrimary} fontWeight="bold">
                                    {t("view")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                {/* Main View Card */}
                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={colors.bgCard}>
                    <CardHeader
                        bg={colors.bgCard}
                        borderBottom="1px solid"
                        borderColor={colors.borderSubtle}
                        pb={6}
                    >
                        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                            <Box>
                                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">
                                    {reservation.guest_name || t("reservation")}
                                </Heading>
                                <HStack mt={2} flexWrap="wrap">
                                    <Badge
                                        colorScheme={statusColors[reservation.status] || "gray"}
                                        variant="subtle"
                                        px={2}
                                        borderRadius="full"
                                    >
                                        {t(reservation.status || "unknown")}
                                    </Badge>
                                    <Badge
                                        colorScheme="blue"
                                        variant="subtle"
                                        px={2}
                                        borderRadius="full"
                                    >
                                        {reservation.guest_count || "-"} {t("guests")}
                                    </Badge>
                                </HStack>
                            </Box>
                            <HStack spacing={3}>
                                <Button
                                    as={ReactRouterLink}
                                    to={`/table-management/reservation/edit/${id}`}
                                    colorScheme="teal"
                                    variant="outline"
                                    size="sm"
                                    fontWeight="600"
                                >
                                    {t("edit")}
                                </Button>
                                <Button
                                    as={ReactRouterLink}
                                    to={RESERVATION_LIST}
                                    colorScheme="gray"
                                    variant="outline"
                                    size="sm"
                                    fontWeight="600"
                                    display={{ base: "none", md: "inline-flex" }}
                                >
                                    {t("list")}
                                </Button>
                            </HStack>
                        </Flex>
                    </CardHeader>

                    <CardBody p={8}>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("guest_name")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {reservation.guest_name || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("guest_phone")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {reservation.guest_phone || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("guest_email")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {reservation.guest_email || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("guest_count")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {reservation.guest_count ?? "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("reservation_date")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {reservation.reservation_date || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("reservation_time")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {reservation.reservation_time || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("duration")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {reservation.reservation_duration ? `${reservation.reservation_duration} ${t("minutes")}` : "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("table")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {reservation.table?.name || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("table_capacity")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {reservation.table?.capacity ? `${reservation.table.capacity} ${t("seats")}` : "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("floor")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {reservation.table?.floor?.name || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("branch")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {reservation.branch?.name || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("customer")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {reservation.customer?.name || reservation.customer?.first_name || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("deposit_amount")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {formatAmount(reservation.deposit_amount) || "-"}
                                </Text>
                            </Box>

                            <Box gridColumn={{ md: "span 2" }}>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("special_requests")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {reservation.special_requests || "-"}
                                </Text>
                            </Box>

                            <Box gridColumn={{ md: "span 2" }}>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("internal_notes")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {reservation.internal_notes || "-"}
                                </Text>
                            </Box>
                        </SimpleGrid>

                        <Divider my={8} borderColor={colors.borderDefault} />

                        {/* Summary Stats */}
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                            <Stat
                                p={4}
                                bg={colors.bgSubtle}
                                borderRadius="lg"
                                border="1px solid"
                                borderColor={colors.borderDefault}
                            >
                                <StatLabel fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase">
                                    {t("status")}
                                </StatLabel>
                                <StatNumber fontSize="lg" color={colors.textPrimary}>
                                    {t(reservation.status || "unknown")}
                                </StatNumber>
                            </Stat>

                            <Stat
                                p={4}
                                bg={colors.bgSubtle}
                                borderRadius="lg"
                                border="1px solid"
                                borderColor={colors.borderDefault}
                            >
                                <StatLabel fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase">
                                    {t("guests")}
                                </StatLabel>
                                <StatNumber fontSize="lg" color="blue.500">
                                    {reservation.guest_count ?? "-"}
                                </StatNumber>
                            </Stat>

                            <Stat
                                p={4}
                                bg={colors.bgSubtle}
                                borderRadius="lg"
                                border="1px solid"
                                borderColor={colors.borderDefault}
                            >
                                <StatLabel fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase">
                                    {t("created_at")}
                                </StatLabel>
                                <StatNumber fontSize="lg" color={colors.textPrimary}>
                                    {reservation.created_at ? new Date(reservation.created_at).toLocaleDateString() : "-"}
                                </StatNumber>
                            </Stat>
                        </SimpleGrid>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default ReservationView;
