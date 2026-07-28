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
    Checkbox,
    Text,
    HStack,
    Badge,
    Divider,
    useColorModeValue,
    Spinner,
    Flex,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Button,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import api from "../../../axios";
import { PLAN_LIST_PATH, DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import { STORE_PLAN, LIST_PACKAGE } from "../../../routes/apiRoutes";

const PlanCreate = () => {
    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            is_active: "1",
            status: "active",
            billing_cycle: "monthly",
        },
    });
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [packages, setPackages] = useState([]);
    const [selectedPackages, setSelectedPackages] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const toast = useToast();

    const pageBg = useColorModeValue("gray.50", "gray.900");
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const headerBorderColor = useColorModeValue("gray.100", "gray.700");
    const headingColor = useColorModeValue("gray.800", "gray.100");
    const textColor = useColorModeValue("gray.500", "gray.400");
    const labelColor = useColorModeValue("gray.700", "gray.300");
    const fieldBg = useColorModeValue("gray.50", "gray.700");
    const fieldHoverBorder = useColorModeValue("gray.300", "gray.600");

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setIsLoadingData(true);
                const res = await api.get(LIST_PACKAGE, { params: { per_page: 9999 } });
                setPackages(res.data?.data?.data || res.data?.data || []);
            } catch (err) {
                console.error("fetchPackages error:", err);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchPackages();
    }, []);

    const handlePackageToggle = useCallback((pkgId) => {
        setSelectedPackages((prev) =>
            prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]
        );
    }, []);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data, package_ids: selectedPackages };
            const res = await api.post(STORE_PLAN, payload);
            reset();
            setSelectedPackages([]);
            toast({
                position: "bottom-right",
                title: res.data.message || t("success"),
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            window.location.href = PLAN_LIST_PATH;
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
        document.title = `${app_name} | Create Plan`;
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
                                <BreadcrumbLink as={ReactRouterLink} to={PLAN_LIST_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>{t("plans")}</BreadcrumbLink>
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
                                <Heading size="sm" color={headingColor} fontWeight="bold">{t("add_plan")}</Heading>
                                <Text fontSize="sm" color={textColor} mt={1}>{t("create_new_plan")}</Text>
                            </Box>
                            <Button colorScheme="teal" as={ReactRouterLink} to={PLAN_LIST_PATH} variant="outline" display={{ base: "none", md: "inline-flex" }} size="sm" fontWeight="600">{t("plans")}</Button>
                        </Flex>
                    </CardHeader>

                    <CardBody p={8}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("name")}</FormLabel>
                                    <Input
                                        {...register("name", { required: true })}
                                        placeholder={t("plan_name_placeholder")}
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
                                        placeholder={t("plan_slug_placeholder")}
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("price")}</FormLabel>
                                    <Input
                                        {...register("price", { required: true })}
                                        type="number"
                                        step="0.01"
                                        placeholder={t("price_placeholder")}
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("billing_cycle")}</FormLabel>
                                    <Select
                                        {...register("billing_cycle")}
                                        bg={fieldBg}
                                        border="1px solid"
                                        borderColor={borderColor}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: fieldHoverBorder }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        <option value="monthly">{t("monthly")}</option>
                                        <option value="yearly">{t("yearly")}</option>
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("branch_limit")}</FormLabel>
                                    <Input
                                        {...register("branch_limit", { required: true })}
                                        type="number"
                                        placeholder={t("branch_limit")}
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("user_limit")}</FormLabel>
                                    <Input
                                        {...register("user_limit", { required: true })}
                                        type="number"
                                        placeholder={t("user_limit")}
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("invoice_limit")}</FormLabel>
                                    <Input
                                        {...register("invoice_limit", { required: true })}
                                        type="number"
                                        placeholder={t("invoice_limit")}
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
                                        <Text fontWeight="bold" fontSize="md" color={headingColor}>{t("package_selection")}</Text>
                                        <Text fontSize="sm" color={textColor}>{t("select_packages_for_plan")}</Text>
                                    </Box>
                                    <Badge colorScheme="teal" borderRadius="full" px={3} py={1}>
                                        {selectedPackages.length} {t("selected")}
                                    </Badge>
                                </Flex>

                                {packages.length === 0 ? (
                                    <Text fontSize="sm" color={textColor}>{t("no_packages_available")}</Text>
                                ) : (
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                        {packages.map((pkg) => {
                                            const isSelected = selectedPackages.includes(pkg.id);
                                            return (
                                                <Box
                                                    key={pkg.id}
                                                    p={4}
                                                    border="1px solid"
                                                    borderColor={isSelected ? "teal.300" : borderColor}
                                                    borderRadius="lg"
                                                    bg={isSelected ? "teal.50" : pageBg}
                                                    cursor="pointer"
                                                    onClick={() => handlePackageToggle(pkg.id)}
                                                    transition="all 0.2s"
                                                    _hover={{ borderColor: "teal.300", boxShadow: "sm" }}
                                                >
                                                    <HStack spacing={3} mb={2}>
                                                        <Checkbox
                                                            isChecked={isSelected}
                                                            colorScheme="teal"
                                                            pointerEvents="none"
                                                        />
                                                        <Text fontWeight="600" fontSize="sm">
                                                            {pkg.name}
                                                        </Text>
                                                    </HStack>
                                                    {pkg.modules && pkg.modules.length > 0 && (
                                                        <HStack spacing={1} flexWrap="wrap" mt={2}>
                                                            {pkg.modules.slice(0, 4).map((mod, i) => (
                                                                <Badge key={i} colorScheme="gray" variant="outline" borderRadius="full" px={1.5} py={0.5} fontSize="xs" textTransform="capitalize">
                                                                    {mod}
                                                                </Badge>
                                                            ))}
                                                            {pkg.modules.length > 4 && (
                                                                <Badge colorScheme="gray" variant="outline" borderRadius="full" px={1.5} py={0.5} fontSize="xs">
                                                                    +{pkg.modules.length - 4}
                                                                </Badge>
                                                            )}
                                                        </HStack>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                    </SimpleGrid>
                                )}
                            </Box>

                            <Flex mt={10} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                                <Button type="button" as={ReactRouterLink} to={PLAN_LIST_PATH} colorScheme="gray" variant="outline" fontWeight="semibold" px={6} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: pageBg }}>{t("cancel")}</Button>
                                <Button type="submit" isLoading={isSubmitting} loadingText={t("saving")} colorScheme="teal" bg="teal.500" color="white" fontWeight="semibold" px={8} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "teal.600" }} _active={{ bg: "teal.700" }} boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)">{t("save")}</Button>
                            </Flex>
                        </form>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default PlanCreate;
