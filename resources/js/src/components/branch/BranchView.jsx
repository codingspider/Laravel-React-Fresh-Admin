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
    VStack,
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
import { GET_BRANCH } from "../../routes/apiRoutes";
import useThemeColors from "../../hooks/useThemeColors";

const BRANCH_LIST = '/branch/list';
const DASHBOARD_PATH = '/dashboard';

const BranchView = () => {
    const colors = useThemeColors();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const toast = useToast();
    const [branch, setBranch] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const getBranch = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(GET_BRANCH(id));
            setBranch(res.data.data);
        } catch (error) {
            toast({
                position: "bottom-right",
                title: t("error"),
                description: t("failed_to_load_branch_data"),
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
        document.title = `${app_name} | Branch Details`;
        getBranch();
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

    if (!branch) {
        return (
            <Box bg={colors.bgSubtle} minH="100vh" py={3}>
                <Box mx="auto">
                    <Center h="60">
                        <Text color={colors.textSecondary} fontSize="lg">
                            {t("branch_not_found")}
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
                                    to={BRANCH_LIST}
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
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">
                                    {branch.name}
                                </Heading>
                                <HStack mt={2}>
                                    <Badge
                                        colorScheme={branch.is_main ? "teal" : "gray"}
                                        variant="subtle"
                                        px={2}
                                        borderRadius="full"
                                    >
                                        {branch.is_main ? t("main_branch") : t("branch")}
                                    </Badge>
                                    <Badge
                                        colorScheme={branch.is_active ? "green" : "red"}
                                        variant="subtle"
                                        px={2}
                                        borderRadius="full"
                                    >
                                        {branch.is_active ? t("active") : t("inactive")}
                                    </Badge>
                                </HStack>
                            </Box>
                            <HStack spacing={3}>
                                <Button
                                    as={ReactRouterLink}
                                    to={`${BRANCH_LIST.replace("/list", "")}/edit/${id}`}
                                    colorScheme="teal"
                                    variant="outline"
                                    size="sm"
                                    fontWeight="600"
                                >
                                    {t("edit")}
                                </Button>
                                <Button
                                    as={ReactRouterLink}
                                    to={BRANCH_LIST}
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
                            {/* Branch Name */}
                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("name")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {branch.name || "-"}
                                </Text>
                            </Box>

                            {/* Slug */}
                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("slug")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {branch.slug || "-"}
                                </Text>
                            </Box>

                            {/* Email */}
                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("email")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {branch.email || "-"}
                                </Text>
                            </Box>

                            {/* Phone */}
                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("phone")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {branch.phone || "-"}
                                </Text>
                            </Box>

                            {/* Address */}
                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("address")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {branch.address || "-"}
                                </Text>
                            </Box>

                            {/* City */}
                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("city")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {branch.city || "-"}
                                </Text>
                            </Box>

                            {/* State */}
                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("state")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {branch.state || "-"}
                                </Text>
                            </Box>

                            {/* Country */}
                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("country")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {branch.country || "-"}
                                </Text>
                            </Box>

                            {/* Zip Code */}
                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("zip_code")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {branch.zip_code || "-"}
                                </Text>
                            </Box>

                            {/* Timezone */}
                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("timezone")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {branch.timezone || "-"}
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
                                <StatNumber fontSize="lg" color={branch.is_active ? "green.500" : "red.500"}>
                                    {branch.is_active ? t("active") : t("inactive")}
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
                                    {t("branch_type")}
                                </StatLabel>
                                <StatNumber fontSize="lg" color={branch.is_main ? "teal.500" : "gray.600"}>
                                    {branch.is_main ? t("main_branch") : t("sub_branch")}
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
                                    {branch.created_at ? new Date(branch.created_at).toLocaleDateString() : "-"}
                                </StatNumber>
                            </Stat>
                        </SimpleGrid>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default BranchView;
