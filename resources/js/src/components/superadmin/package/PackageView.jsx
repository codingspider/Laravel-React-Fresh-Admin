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
    Spinner,
    Center,
    Divider,
    Card,
    CardHeader,
    CardBody,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Heading,
    Flex,
    Tag,
    TagLabel,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { Link as ChakraLink } from "@chakra-ui/react";
import api from "../../../axios";
import { PACKAGE_EDIT_PATH, DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";

const LIST_PATH = "/package/list";

const MODULE_COLORS = {
    hrm: "purple", crm: "blue", inventory: "orange", pos: "green",
    reports: "cyan", kitchen: "red", accounts: "teal", purchasing: "yellow",
    orders: "pink", delivery: "indigo", marketing: "purple", loyalty: "gold",
    recipe: "orange", reviews: "green", notification: "gray", accounting: "teal",
    payroll: "purple", shift: "blue", analytics: "cyan", invoices: "pink",
};

export default function PackageView() {
    const { t } = useTranslation();
    const { id } = useParams();
    const toast = useToast();
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const colors = useThemeColors();

    const pageBg = colors.bgPage;
    const bg = colors.bgCard;
    const cardBg = colors.bgCard;
    const borderColor = colors.borderDefault;
    const headerBorderColor = colors.borderSubtle;
    const headingColor = colors.textPrimary;
    const textColor = colors.textSecondary;
    const labelColor = colors.textSecondary;
    const valueColor = colors.textPrimary;

    useEffect(() => {
        const fetchPackage = async () => {
            try {
                const res = await api.get(`/v1/packages/${id}`);
                setPkg(res.data?.data || res.data);
            } catch {
                toast({
                    position: "bottom-right",
                    title: t("error_loading_package"),
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchPackage();
    }, [id]);

    if (loading) {
        return (
            <Center py={20}>
                <Spinner size="xl" color="teal.500" />
            </Center>
        );
    }

    if (!pkg) {
        return (
            <Center py={20}>
                <Text>{t("package_not_found")}</Text>
            </Center>
        );
    }

    const modules = pkg.modules || [];

    return (
        <Box bg={pageBg} minH="100vh" py={3}>
            <Box mx="auto">
                <Card mb={4} bg={cardBg} shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Breadcrumb fontSize="sm" color={textColor}>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to="/dashboard" fontWeight="medium" _hover={{ color: "teal.500" }}>
                                    {t("dashboard")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to={LIST_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>
                                    {t("packages")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color={headingColor} fontWeight="bold">
                                    {pkg.name}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={cardBg}>
                    <CardHeader bg={cardBg} borderBottom="1px solid" borderColor={headerBorderColor} pb={6}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="sm" color={headingColor} fontWeight="bold">
                                    {t("package_details")}
                                </Heading>
                                <Text fontSize="sm" color={textColor} mt={1}>
                                    {t("view_package_information")}
                                </Text>
                            </Box>
                            <HStack spacing={3}>
                                <Button
                                    as={ReactRouterLink}
                                    to={LIST_PATH}
                                    variant="outline"
                                    colorScheme="gray"
                                    size="sm"
                                    fontWeight="600"
                                >
                                    {t("back_to_list")}
                                </Button>
                                <Button
                                    as={ReactRouterLink}
                                    to={PACKAGE_EDIT_PATH.replace(":id", id)}
                                    leftIcon={<EditIcon />}
                                    colorScheme="teal"
                                    size="sm"
                                    fontWeight="600"
                                >
                                    {t("edit")}
                                </Button>
                            </HStack>
                        </Flex>
                    </CardHeader>

                    <CardBody p={8}>
                        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
                            <Box
                                bg={bg}
                                borderRadius="xl"
                                border="1px solid"
                                borderColor={borderColor}
                                p={6}
                                gridColumn={{ lg: "span 1" }}
                            >
                                <VStack spacing={4} align="center">
                                    <Box
                                        w="80px"
                                        h="80px"
                                        borderRadius="xl"
                                        bg="teal.500"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Text color="white" fontSize="2xl" fontWeight="bold">
                                            {pkg.name?.charAt(0)?.toUpperCase()}
                                        </Text>
                                    </Box>
                                    <Text fontWeight="700" fontSize="xl" color={valueColor}>
                                        {pkg.name}
                                    </Text>
                                    <Badge
                                        colorScheme={pkg.status === "active" ? "green" : "red"}
                                        textTransform="capitalize"
                                        size="lg"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                    >
                                        {t(pkg.status)}
                                    </Badge>
                                    <Text color={labelColor} fontSize="sm">
                                        {pkg.slug}
                                    </Text>
                                </VStack>
                            </Box>

                            <Box
                                bg={bg}
                                borderRadius="xl"
                                border="1px solid"
                                borderColor={borderColor}
                                p={6}
                                gridColumn={{ lg: "span 2" }}
                            >
                                <Text fontWeight="600" fontSize="lg" mb={4} color={valueColor}>
                                    {t("information")}
                                </Text>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    <Box>
                                        <Text fontSize="sm" color={labelColor} mb={1}>
                                            {t("status")}
                                        </Text>
                                        <Badge
                                            colorScheme={pkg.status === "active" ? "green" : "red"}
                                            textTransform="capitalize"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                        >
                                            {t(pkg.status)}
                                        </Badge>
                                    </Box>
                                </SimpleGrid>

                                {pkg.description && (
                                    <>
                                        <Divider my={4} borderColor={borderColor} />
                                        <Text fontSize="sm" color={labelColor} mb={1}>
                                            {t("description")}
                                        </Text>
                                        <Text color={valueColor}>{pkg.description}</Text>
                                    </>
                                )}

                                <Divider my={4} borderColor={borderColor} />

                                <Text fontWeight="600" mb={3} color={valueColor}>
                                    {t("module_access")} ({modules.length})
                                </Text>

                                {modules.length > 0 ? (
                                    <Wrap spacing={3}>
                                        {modules.map((mod) => (
                                            <WrapItem key={mod}>
                                                <Tag
                                                    size="lg"
                                                    colorScheme={MODULE_COLORS[mod] || "gray"}
                                                    borderRadius="full"
                                                    px={4}
                                                    py={2}
                                                    textTransform="capitalize"
                                                    fontWeight="500"
                                                >
                                                    <TagLabel>{mod}</TagLabel>
                                                </Tag>
                                            </WrapItem>
                                        ))}
                                    </Wrap>
                                ) : (
                                    <Text fontSize="sm" color={labelColor}>
                                        {t("no_modules_assigned")}
                                    </Text>
                                )}
                            </Box>
                        </SimpleGrid>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
}
