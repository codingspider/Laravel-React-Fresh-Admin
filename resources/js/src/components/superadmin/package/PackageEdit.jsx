import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link as ReactRouterLink } from "react-router-dom";
import {
    Box,
    useToast,
    SimpleGrid,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
    Checkbox,
    Text,
    HStack,
    Heading,
    Badge,
    Divider,
    Stack,
    useColorModeValue,
    Spinner,
    Card,
    CardHeader,
    CardBody,
    Flex,
    Button,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import api from "../../../axios";
import { PACKAGE_LIST_PATH, DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import { GET_EDIT_PACKAGE, UPDATE_PACKAGE } from "../../../routes/apiRoutes";

const AVAILABLE_MODULES = [
    "hrm", "crm", "inventory", "pos", "reports", "kitchen", "accounts",
    "purchasing", "orders", "delivery", "marketing", "loyalty", "recipe",
    "reviews", "notification", "accounting", "payroll", "shift", "analytics", "invoices",
];

const PackageEdit = () => {
    const { register, handleSubmit, reset, watch, setValue } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const toast = useToast();
    const { id } = useParams();
    const [selectedModules, setSelectedModules] = useState([]);

    const pageBg = useColorModeValue("gray.50", "gray.900");
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const headerBorderColor = useColorModeValue("gray.100", "gray.700");
    const headingColor = useColorModeValue("gray.800", "gray.100");
    const textColor = useColorModeValue("gray.500", "gray.400");
    const labelColor = useColorModeValue("gray.700", "gray.300");
    const fieldBg = useColorModeValue("gray.50", "gray.700");
    const fieldHoverBorder = useColorModeValue("gray.300", "gray.600");

    const nameValue = watch("name");

    useEffect(() => {
        if (nameValue) {
            const slug = nameValue.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            setValue("slug", slug);
        }
    }, [nameValue, setValue]);

    const handleModuleChange = useCallback((mod) => {
        setSelectedModules((prev) =>
            prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
        );
    }, []);

    useEffect(() => {
        const fetchPackage = async () => {
            try {
                setIsLoadingData(true);
                const res = await api.get(GET_EDIT_PACKAGE(id));
                const pkg = res.data.data;
                reset({
                    name: pkg.name,
                    slug: pkg.slug,
                    description: pkg.description || "",
                    status: pkg.status || "active",
                });
                setSelectedModules(pkg.modules || []);
            } catch (error) {
                toast({
                    position: "bottom-right",
                    title: t("error_loading_package"),
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setIsLoadingData(false);
            }
        };
        if (id) fetchPackage();
    }, [id, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data, modules: selectedModules };
            const res = await api.put(UPDATE_PACKAGE(id), payload);
            toast({
                position: "bottom-right",
                title: res.data.message || t("success"),
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            window.location.href = PACKAGE_LIST_PATH;
        } catch (err) {
            const errorResponse = err?.response?.data;
            if (errorResponse?.errors) {
                const errorMessage = Object.values(errorResponse.errors).flat().join(" ");
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
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Edit Package`;
    }, []);

    if (isLoadingData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
                <Spinner size="xl" color="teal.500" />
            </Box>
        );
    }

    return (
        <Box bg={pageBg} minH="100vh" py={3}>
            <Box mx="auto">
                <Card mb={4} bg={cardBg} shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Breadcrumb fontSize="sm" color={textColor}>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to="/dashboard" fontWeight="medium" _hover={{ color: "teal.500" }}>{t("dashboard")}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to={PACKAGE_LIST_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>{t("packages")}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color={headingColor} fontWeight="bold">{t("edit")}</BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={cardBg}>
                    <CardHeader bg={cardBg} borderBottom="1px solid" borderColor={headerBorderColor} pb={6}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="sm" color={headingColor} fontWeight="bold">{t("edit_package")}</Heading>
                                <Text fontSize="sm" color={textColor} mt={1}>{t("update_package_info")}</Text>
                            </Box>
                            <Button colorScheme="teal" as={ReactRouterLink} to={PACKAGE_LIST_PATH} variant="outline" display={{ base: "none", md: "inline-flex" }} size="sm" fontWeight="600">{t("packages")}</Button>
                        </Flex>
                    </CardHeader>

                    <CardBody p={8}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("name")}</FormLabel>
                                    <Input
                                        {...register("name", { required: true })}
                                        placeholder={t("package_name_placeholder")}
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("slug")}</FormLabel>
                                    <Input
                                        {...register("slug", { required: true })}
                                        placeholder={t("package_slug_placeholder")}
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("description")}</FormLabel>
                                    <Textarea
                                        {...register("description")}
                                        placeholder={t("description_placeholder")}
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

                            <Divider my={8} borderColor={borderColor} />

                            <Box>
                                <Flex justify="space-between" align="center" mb={4}>
                                    <Box>
                                        <Heading size="sm" mb={1} fontWeight="bold" color={headingColor}>
                                            {t("module_access")}
                                        </Heading>
                                        <Text fontSize="sm" color={textColor}>
                                            {t("select_modules_for_package")}
                                        </Text>
                                    </Box>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        colorScheme="teal"
                                        onClick={() =>
                                            selectedModules.length === AVAILABLE_MODULES.length
                                                ? setSelectedModules([])
                                                : setSelectedModules([...AVAILABLE_MODULES])
                                        }
                                    >
                                        {selectedModules.length === AVAILABLE_MODULES.length ? t("unselect_all") : t("select_all")}
                                    </Button>
                                </Flex>

                                <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                                    {AVAILABLE_MODULES.map((mod) => (
                                        <Box
                                            key={mod}
                                            p={4}
                                            border="1px solid"
                                            borderColor={selectedModules.includes(mod) ? "teal.300" : borderColor}
                                            borderRadius="lg"
                                            bg={selectedModules.includes(mod) ? "teal.50" : pageBg}
                                            cursor="pointer"
                                            onClick={() => handleModuleChange(mod)}
                                            transition="all 0.2s"
                                            _hover={{ borderColor: "teal.300", boxShadow: "sm" }}
                                        >
                                            <HStack spacing={3}>
                                                <Checkbox
                                                    isChecked={selectedModules.includes(mod)}
                                                    colorScheme="teal"
                                                    pointerEvents="none"
                                                />
                                                <Text fontWeight="500" fontSize="sm" textTransform="capitalize">
                                                    {mod}
                                                </Text>
                                            </HStack>
                                        </Box>
                                    ))}
                                </SimpleGrid>

                                {selectedModules.length > 0 && (
                                    <HStack spacing={2} mt={4} flexWrap="wrap">
                                        {selectedModules.map((mod) => (
                                            <Badge key={mod} colorScheme="teal" variant="subtle" borderRadius="full" px={2} py={1} textTransform="capitalize">
                                                {mod}
                                            </Badge>
                                        ))}
                                    </HStack>
                                )}
                            </Box>

                            <Flex mt={10} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                                <Button type="button" as={ReactRouterLink} to={PACKAGE_LIST_PATH} colorScheme="gray" variant="outline" fontWeight="semibold" px={6} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: pageBg }}>{t("cancel")}</Button>
                                <Button type="submit" isLoading={isSubmitting} loadingText={t("saving")} colorScheme="teal" bg="teal.500" color="white" fontWeight="semibold" px={8} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "teal.600" }} _active={{ bg: "teal.700" }} boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)">{t("update")}</Button>
                            </Flex>
                        </form>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default PackageEdit;
