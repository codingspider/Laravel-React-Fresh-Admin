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
    Switch,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    useToast,
    Flex,
    Text,
    HStack,
    Spinner,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../axios";

const MenuItemEdit = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [categories, setCategories] = useState([]);
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = await api.put(`/v1/menu/items/${id}`, data);
            toast({
                position: "bottom-right",
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate("/menu/items");
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
        Promise.all([
            api.get("/v1/menu/categories", { params: { per_page: 200 } }),
            api.get(`/v1/menu/items/${id}`),
        ]).then(([catRes, dataRes]) => {
            setCategories(catRes.data.data || []);
            const data = dataRes.data.data;
            reset({
                name: data.name,
                sku: data.sku,
                menu_category_id: data.menu_category_id,
                price: data.price,
                cost_price: data.cost_price,
                preparation_time: data.preparation_time,
                description: data.description,
                tags: data.tags,
                is_vegetarian: data.is_vegetarian,
                is_vegan: data.is_vegan,
                is_gluten_free: data.is_gluten_free,
                is_featured: data.is_featured,
                is_available: data.is_available,
            });
        }).catch(() => {
            toast({
                title: t("error"),
                description: t("failed_to_load_item_data"),
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }).finally(() => {
            setIsLoadingData(false);
        });
    }, [id]);

    return (
        <Box bg="gray.50" minH="100vh" py={3}>
            <Box mx="auto">
                <Card mb={4} bg="white" shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Breadcrumb fontSize="sm" color="gray.500">
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
                                    to="/menu/items"
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
                                    {t("update_menu_item_details")}
                                </Text>
                            </Box>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to="/menu/items"
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
                                <Spinner size="lg" color="teal.500" />
                            </Flex>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                    <FormControl isRequired isInvalid={errors.name}>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
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
                                        <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                            {t("sku")}
                                        </FormLabel>
                                        <Input
                                            {...register("sku")}
                                            type="text"
                                            placeholder={t("sku")}
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

                                    <FormControl isRequired isInvalid={errors.menu_category_id}>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                            {t("category")}
                                        </FormLabel>
                                        <Select
                                            {...register("menu_category_id", { required: true })}
                                            placeholder={t("select_category")}
                                            bg="gray.50"
                                            border="1px solid"
                                            borderColor="gray.200"
                                            borderRadius="md"
                                            focusBorderColor="teal.500"
                                            _hover={{ borderColor: "gray.300" }}
                                            size="md"
                                            transition="all 0.2s"
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </Select>
                                        <FormErrorMessage>{errors.menu_category_id?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isRequired isInvalid={errors.price}>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                            {t("price")}
                                        </FormLabel>
                                        <Input
                                            {...register("price", { required: true, valueAsNumber: true })}
                                            type="number"
                                            step="0.01"
                                            placeholder={t("price")}
                                            bg="gray.50"
                                            border="1px solid"
                                            borderColor="gray.200"
                                            borderRadius="md"
                                            focusBorderColor="teal.500"
                                            _hover={{ borderColor: "gray.300" }}
                                            size="md"
                                            transition="all 0.2s"
                                        />
                                        <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                            {t("cost_price")}
                                        </FormLabel>
                                        <Input
                                            {...register("cost_price", { valueAsNumber: true })}
                                            type="number"
                                            step="0.01"
                                            placeholder={t("cost_price")}
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
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                            {t("preparation_time")}
                                        </FormLabel>
                                        <Input
                                            {...register("preparation_time", { valueAsNumber: true })}
                                            type="number"
                                            placeholder={t("preparation_time")}
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

                                    <FormControl gridColumn={{ md: "span 2" }}>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                            {t("description")}
                                        </FormLabel>
                                        <Textarea
                                            {...register("description")}
                                            placeholder={t("description")}
                                            bg="gray.50"
                                            border="1px solid"
                                            borderColor="gray.200"
                                            borderRadius="md"
                                            focusBorderColor="teal.500"
                                            _hover={{ borderColor: "gray.300" }}
                                            size="md"
                                            transition="all 0.2s"
                                            rows={3}
                                        />
                                    </FormControl>

                                    <FormControl gridColumn={{ md: "span 2" }}>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                            {t("tags")}
                                        </FormLabel>
                                        <Input
                                            {...register("tags")}
                                            type="text"
                                            placeholder={t("comma_separated_tags")}
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
                                        <HStack spacing={6}>
                                            <HStack>
                                                <Switch {...register("is_vegetarian")} colorScheme="teal" />
                                                <Text fontSize="sm" fontWeight="semibold" color="gray.700">{t("vegetarian")}</Text>
                                            </HStack>
                                            <HStack>
                                                <Switch {...register("is_vegan")} colorScheme="teal" />
                                                <Text fontSize="sm" fontWeight="semibold" color="gray.700">{t("vegan")}</Text>
                                            </HStack>
                                            <HStack>
                                                <Switch {...register("is_gluten_free")} colorScheme="teal" />
                                                <Text fontSize="sm" fontWeight="semibold" color="gray.700">{t("gluten_free")}</Text>
                                            </HStack>
                                        </HStack>
                                    </FormControl>

                                    <FormControl>
                                        <HStack spacing={6}>
                                            <HStack>
                                                <Switch {...register("is_featured")} colorScheme="teal" />
                                                <Text fontSize="sm" fontWeight="semibold" color="gray.700">{t("featured")}</Text>
                                            </HStack>
                                            <HStack>
                                                <Switch {...register("is_available")} defaultChecked colorScheme="teal" />
                                                <Text fontSize="sm" fontWeight="semibold" color="gray.700">{t("available")}</Text>
                                            </HStack>
                                        </HStack>
                                    </FormControl>
                                </SimpleGrid>

                                <Flex mt={10} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                                    <Button
                                        type="button"
                                        as={ReactRouterLink}
                                        to="/menu/items"
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
                        )}
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default MenuItemEdit;
