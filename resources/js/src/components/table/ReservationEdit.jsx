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
    Textarea,
    Select,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    useToast,
    Flex,
    Text,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../axios";
import useThemeColors from "../../hooks/useThemeColors";

const ReservationEdit = () => {
    const { register, handleSubmit, reset } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [tables, setTables] = useState([]);
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();
    const colors = useThemeColors();

    useEffect(() => {
        api.get("/v1/tables", { params: { per_page: 200 } })
            .then((res) => {
                setTables(res.data.data || []);
            })
            .catch(() => { });
    }, []);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = await api.put(`/v1/reservations/${id}`, data);
            toast({
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate("/table-management/reservations");
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

    const getEditReservation = async () => {
        try {
            setIsLoadingData(true);
            const res = await api.get(`/v1/reservations/${id}`);
            const reservation = res.data.data;
            reset({
                guest_name: reservation.guest_name,
                guest_phone: reservation.guest_phone,
                guest_email: reservation.guest_email,
                guest_count: reservation.guest_count,
                reservation_date: reservation.reservation_date,
                reservation_time: reservation.reservation_time,
                duration: reservation.duration,
                table_id: reservation.table_id,
                status: reservation.status,
                special_requests: reservation.special_requests,
            });
        } catch (error) {
            toast({
                title: t("error"),
                description: t("failed_to_load_reservation_data"),
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Edit Reservation`;
        getEditReservation();
    }, [id]);

    return (
        <Box py={3}>
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
                                    to="/table-management/reservations"
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
                                    {t("list")}
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
                                    {t("edit")}
                                </Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                                    {t("update_reservation_details")}
                                </Text>
                            </Box>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to="/table-management/reservations"
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
                        {isLoadingData ? (
                            <Flex justify="center" align="center" h="40">
                                <Text color={colors.textSecondary}>{t("loading_data")}</Text>
                            </Flex>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                    <FormControl isRequired>
                                        <FormLabel
                                            fontSize="sm"
                                            fontWeight="semibold"
                                            color={colors.textPrimary}
                                            mb={2}
                                        >
                                            {t("guest_name")}
                                        </FormLabel>
                                        <Input
                                            {...register("guest_name", { required: true })}
                                            type="text"
                                            placeholder={t("guest_name")}
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
                                            {t("guest_phone")}
                                        </FormLabel>
                                        <Input
                                            {...register("guest_phone", { required: true })}
                                            type="text"
                                            placeholder={t("guest_phone")}
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
                                            {t("guest_email")}
                                        </FormLabel>
                                        <Input
                                            {...register("guest_email")}
                                            type="email"
                                            placeholder={t("guest_email")}
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
                                            {t("guest_count")}
                                        </FormLabel>
                                        <Input
                                            {...register("guest_count", {
                                                required: true,
                                                valueAsNumber: true,
                                            })}
                                            type="number"
                                            placeholder={t("guest_count")}
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
                                            {t("reservation_date")}
                                        </FormLabel>
                                        <Input
                                            {...register("reservation_date", { required: true })}
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
                                            {t("reservation_time")}
                                        </FormLabel>
                                        <Input
                                            {...register("reservation_time", { required: true })}
                                            type="time"
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
                                            {t("duration")}
                                        </FormLabel>
                                        <Input
                                            {...register("duration", { valueAsNumber: true })}
                                            type="number"
                                            placeholder={t("duration")}
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
                                            {t("table")}
                                        </FormLabel>
                                        <Select
                                            {...register("table_id")}
                                            placeholder={t("select_table")}
                                            bg={colors.bgInput}
                                            border="1px solid"
                                            borderColor={colors.borderInput}
                                            borderRadius="md"
                                            focusBorderColor="teal.500"
                                            _hover={{ borderColor: "gray.300" }}
                                            size="md"
                                            transition="all 0.2s"
                                        >
                                            {tables.map((tbl) => (
                                                <option key={tbl.id} value={tbl.id}>
                                                    {tbl.name} ({tbl.capacity} seats)
                                                </option>
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
                                            {t("status")}
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
                                            <option value="confirmed">{t("confirmed")}</option>
                                            <option value="seated">{t("seated")}</option>
                                            <option value="completed">{t("completed")}</option>
                                            <option value="cancelled">{t("cancelled")}</option>
                                            <option value="no_show">{t("no_show")}</option>
                                        </Select>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel
                                            fontSize="sm"
                                            fontWeight="semibold"
                                            color={colors.textPrimary}
                                            mb={2}
                                        >
                                            {t("special_requests")}
                                        </FormLabel>
                                        <Textarea
                                            {...register("special_requests")}
                                            placeholder={t("special_requests")}
                                            bg={colors.bgInput}
                                            border="1px solid"
                                            borderColor={colors.borderInput}
                                            borderRadius="md"
                                            focusBorderColor="teal.500"
                                            _hover={{ borderColor: "gray.300" }}
                                            size="md"
                                            transition="all 0.2s"
                                            rows={3}
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
                                        to="/table-management/reservations"
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
                        )}
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default ReservationEdit;
