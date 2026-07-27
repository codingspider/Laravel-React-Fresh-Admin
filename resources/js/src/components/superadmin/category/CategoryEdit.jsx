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
    HStack,
    useToast,
    Flex,
    Text,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { CATEGORY_LIST_PATH, DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import { GET_EDIT_CATEGORY, UPDATE_CATEGORY } from "../../../routes/apiRoutes";

const CategoryEdit = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("description", data.description);
            if (data.image && data.image.length > 0) {
                formData.append("image", data.image[0]);
            }

            formData.append("_method", "PUT");

            const res = await api.post(UPDATE_CATEGORY(id), formData);
            toast({
                position: "bottom-right",
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(CATEGORY_LIST_PATH);
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

    const getEditCategory = async () => {
        try {
            setIsLoadingData(true);
            const res = await api.get(GET_EDIT_CATEGORY(id));
            const category = res.data.data;
            reset({
                name: category.name,
                description: category.description
            });
        } catch (error) {
            toast({
                title: t("error"),
                description: t("failed_to_load_category_data"),
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
        document.title = `${app_name} | Edit Category`;
        getEditCategory();
    }, [id]);

    return (
        <Box className="form-dark-surface" bg="gray.50" minH="100vh" py={3}>
            {/* Container for max width and centering */}
            <Box mx="auto">
                
                {/* Modern Breadcrumb */}
                <Card mb={4} bg="white" shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Breadcrumb fontSize="sm" color="gray.500">
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
                                    to={CATEGORY_LIST_PATH}
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
                                    {t("list")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color="gray.800" fontWeight="bold">
                                    {t("edit")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                {/* Main Form Card */}
                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg="white">
                    <CardHeader
                        bg="white"
                        borderBottom="1px solid"
                        borderColor="gray.100"
                        pb={6}
                    >
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="sm" color="gray.800" fontWeight="bold">
                                    {t("edit")}
                                </Heading>
                                <Text fontSize="sm" color="gray.500" mt={1}>
                                    Update category details for your platform
                                </Text>
                            </Box>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to={CATEGORY_LIST_PATH}
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
                                <Text color="gray.500">{t("loading_data")}</Text>
                            </Flex>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                    <FormControl isRequired isInvalid={!!errors.name}>
                                        <FormLabel 
                                            fontSize="sm" 
                                            fontWeight="semibold" 
                                            color="gray.700"
                                            mb={2}
                                        >
                                            {t("name")}
                                        </FormLabel>
                                        <Input
                                            {...register("name", { required: true })}
                                            type="text"
                                            placeholder={t("name")}
                                            bg="gray.50"
                                            border="1px solid"
                                            borderColor="gray.200"
                                            borderRadius="md"
                                            focusBorderColor="teal.500"
                                            _hover={{ borderColor: "gray.300" }}
                                            size="md"
                                            transition="all 0.2s"
                                        />
                                    </FormControl>

                                    <FormControl isRequired isInvalid={!!errors.description}>
                                        <FormLabel 
                                            fontSize="sm" 
                                            fontWeight="semibold"
                                            color="gray.700"
                                            mb={2}
                                        >
                                            {t("description")}
                                        </FormLabel>
                                        <Input
                                            {...register("description", { required: false })}
                                            type="text"
                                            placeholder={t("description")}
                                            bg="gray.50"
                                            border="1px solid"
                                            borderColor="gray.200"
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
                                        color="gray.700"
                                        mb={2}
                                    >
                                        {t("image")}
                                    </FormLabel>
                                    <Input
                                        {...register("image", { required: false })}
                                        type="file"
                                        placeholder={t("image")}
                                        bg="gray.50"
                                        border="1px solid"
                                        borderColor="gray.200"
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    />
                                </FormControl>
                                </SimpleGrid>

                                {/* Action Buttons */}
                                <Flex 
                                    mt={10} 
                                    justify={{ base: "stretch", md: "flex-end" }} 
                                    gap={4}
                                >
                                    <Button
                                        type="button"
                                        as={ReactRouterLink}
                                        to={CATEGORY_LIST_PATH}
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

export default CategoryEdit;
