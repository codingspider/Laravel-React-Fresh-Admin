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

const FloorEdit = () => {
    const { register, handleSubmit, reset } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();
    const colors = useThemeColors();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = await api.put(`/v1/floors/${id}`, data);
            toast({
                position: "bottom-right",
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate("/table-management/floors");
        } catch (err) {
            const errorResponse = err?.response?.data;
            if (errorResponse?.errors) {
                const errorMessage = Object.values(errorResponse.errors)
                    .flat()
                    .join(" ");
                toast({
                    position: "bottom-right",
                    title: t("error"),
                    description: errorMessage,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } else if (errorResponse?.message) {
                toast({
                    position: "bottom-right",
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

    const getEditFloor = async () => {
        try {
            setIsLoadingData(true);
            const res = await api.get(`/v1/floors/${id}`);
            const floor = res.data.data;
            reset({
                name: floor.name,
                sort_order: floor.sort_order,
                description: floor.description,
            });
        } catch (error) {
            toast({
                title: t("error"),
                description: t("failed_to_load_floor_data"),
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
        document.title = `${app_name} | Edit Floor`;
        getEditFloor();
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
                                    to="/table-management/floors"
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
                                    {t("update_floor_details")}
                                </Text>
                            </Box>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to="/table-management/floors"
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
                                            {t("name")}
                                        </FormLabel>
                                        <Input
                                            {...register("name", { required: true })}
                                            type="text"
                                            placeholder={t("name")}
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
                                            {t("sort_order")}
                                        </FormLabel>
                                        <Input
                                            {...register("sort_order", { valueAsNumber: true })}
                                            type="number"
                                            placeholder={t("sort_order")}
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
                                        to="/table-management/floors"
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

export default FloorEdit;
