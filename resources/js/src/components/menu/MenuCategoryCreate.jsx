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
    FormErrorMessage,
    Input,
    Select,
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
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../axios";
import useThemeColors from "../../hooks/useThemeColors";

const MenuCategoryCreate = () => {
    const colors = useThemeColors();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [parentCategories, setParentCategories] = useState([]);
    const toast = useToast();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = await api.post("/v1/menu/categories", data);
            reset();
            toast({
                position: "bottom-right",
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            window.location.href = "/menu/categories";
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

    useEffect(() => {
        api.get("/v1/menu/categories", { params: { per_page: 100 } }).then((res) => {
            setParentCategories(res.data.data || []);
        });
    }, []);

    return (
        <Box bg={colors.bgSubtle} minH="100vh" py={3}>
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
                                    to="/menu/categories"
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
                                    {t("list")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color={colors.textPrimary} fontWeight="bold">
                                    {t("add")}
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
                                    {t("add")}
                                </Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                                    {t("create_new_menu_category")}
                                </Text>
                            </Box>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to="/menu/categories"
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
                                <FormControl isRequired isInvalid={errors.name}>
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
                                    <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("slug")}
                                    </FormLabel>
                                    <Input
                                        {...register("slug")}
                                        type="text"
                                        placeholder={t("slug")}
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
                                        {t("parent_category")}
                                    </FormLabel>
                                    <Select
                                        {...register("parent_id")}
                                        placeholder={t("none_top_level")}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        {parentCategories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
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

                                <FormControl gridColumn={{ md: "span 2" }}>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
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

                            <Flex mt={10} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                                <Button
                                    type="button"
                                    as={ReactRouterLink}
                                    to="/menu/categories"
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
                                    loadingText={t("saving")}
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
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default MenuCategoryCreate;
