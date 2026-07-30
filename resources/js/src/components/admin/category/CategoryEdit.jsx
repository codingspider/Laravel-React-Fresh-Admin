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
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    useToast,
    Flex,
    Image
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { ADMIN_DASHBOARD_PATH, CATEGORY_LIST_PATH } from "../../../routes/adminRoutes";
import { UPDATE_CATEGORY } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";

const LIST_PATH = CATEGORY_LIST_PATH;
const DASHBOARD_PATH = ADMIN_DASHBOARD_PATH;

const CategoryEdit = () => {
    const colors = useThemeColors();
    const location = useLocation();
    const category = location.state?.category;

    const { register, handleSubmit, reset } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", data.name ?? "");
            formData.append("order_number", data.order_number ?? "");
            if (data.image?.length) {
                formData.append("image", data.image[0]);
            }
            formData.append("_method", "PUT");

            const res = await api.post(UPDATE_CATEGORY(category.id), formData);
            reset();

            toast({
                position: "bottom-right",
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(`${LIST_PATH}`);
        } catch (err) {
            const errorResponse = err?.response?.data;
            if (errorResponse?.errors) {
                const errorMessage = Object.values(errorResponse.errors)
                    .flat()
                    .join(" ");
                toast({
                    position: "bottom-right",
                    title: "Error",
                    description: errorMessage,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } else if (errorResponse?.message) {
                toast({
                    position: "bottom-right",
                    title: "Error",
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
        document.title = `${app_name} | Category Update`;

        reset({
            name: category.name,
            order_number: category.order_number,
        })
    }, []);

    return (
        <Box py={3}>
            <Box mx="auto">
                {/* Breadcrumb */}
                <Card mb={4} bg={colors.bgCard} shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Breadcrumb fontSize="sm" color={colors.textSecondary}>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to={DASHBOARD_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>
                                    {t("dashboard")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to={LIST_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>
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

                {/* Main Form Card */}
                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={colors.bgCard}>
                    <CardHeader bg={colors.bgCard} borderBottom="1px solid" borderColor={colors.borderSubtle} pb={6}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">{t("edit")}</Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>{t("update_category_details")}</Text>
                            </Box>
                            <Button colorScheme="teal" as={ReactRouterLink} to={LIST_PATH} variant="outline" display={{ base: "none", md: "inline-flex" }} size="sm" fontWeight="600">
                                {t("list")}
                            </Button>
                        </Flex>
                    </CardHeader>
                    <CardBody p={8}>
                        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("image")}
                                    </FormLabel>
                                    <Input
                                        {...register("image")}
                                        type="file"
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    />
                                    {category.image && (
                                        <Image mt={3} boxSize="40px" objectFit="cover" src={category.image} borderRadius="md" />
                                    )}
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("order_number")}
                                    </FormLabel>
                                    <Input
                                        {...register("order_number", { required: true })}
                                        type="number"
                                        placeholder={t("order_number")}
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

                            <Flex mt={10} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                                <Button type="button" as={ReactRouterLink} to={LIST_PATH} colorScheme="gray" variant="outline" fontWeight="semibold" px={6} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "gray.50" }}>
                                    {t("cancel")}
                                </Button>
                                <Button type="submit" isLoading={isSubmitting} loadingText={t("saving_data")} colorScheme="teal" bg="teal.500" color="white" fontWeight="semibold" px={8} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "teal.600" }} _active={{ bg: "teal.700" }} boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)">
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

export default CategoryEdit;
