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
    Image,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../axios";
import { GET_MENU_ITEM } from "../../routes/apiRoutes";
import useThemeColors from "../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../useCurrencyFormatter";

const MENU_ITEM_LIST = '/menu/items';
const DASHBOARD_PATH = '/dashboard';

const MenuItemView = () => {
    const colors = useThemeColors();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const toast = useToast();
    const { formatAmount } = useCurrencyFormatter();
    const [item, setItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const getItem = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(GET_MENU_ITEM(id));
            setItem(res.data?.data);
        } catch (error) {
            toast({
                title: t("error"),
                description: t("failed_to_load_menu_item"),
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
        document.title = `${app_name} | ${t("menu_item_details")}`;
        getItem();
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

    if (!item) {
        return (
            <Box bg={colors.bgSubtle} minH="100vh" py={3}>
                <Box mx="auto">
                    <Center h="60">
                        <Text color={colors.textSecondary} fontSize="lg">
                            {t("menu_item_not_found")}
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
                                    to={MENU_ITEM_LIST}
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
                        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                            <Flex align="center" gap={4}>
                                {item.image_url ? (
                                    <Image
                                        src={item.image_url}
                                        alt={item.name}
                                        boxSize="64px"
                                        borderRadius="lg"
                                        objectFit="cover"
                                        border="1px solid"
                                        borderColor={colors.borderDefault}
                                    />
                                ) : (
                                    <Box
                                        boxSize="64px"
                                        borderRadius="lg"
                                        bg="gray.100"
                                        _dark={{ bg: "gray.700" }}
                                    />
                                )}
                                <Box>
                                    <Heading size="sm" color={colors.textPrimary} fontWeight="bold">
                                        {item.name}
                                    </Heading>
                                    <HStack mt={2} gap={1} flexWrap="wrap">
                                        {item.status && (
                                            <Badge
                                                colorScheme={item.status === "active" ? "green" : "red"}
                                                variant="subtle"
                                                px={2}
                                                borderRadius="full"
                                            >
                                                {item.status === "active" ? t("active") : t("inactive")}
                                            </Badge>
                                        )}
                                        {item.is_featured && (
                                            <Badge colorScheme="yellow" variant="subtle" px={2} borderRadius="full">
                                                {t("featured")}
                                            </Badge>
                                        )}
                                        {item.is_vegetarian && (
                                            <Badge colorScheme="green" variant="subtle" px={2} borderRadius="full">
                                                {t("vegetarian")}
                                            </Badge>
                                        )}
                                        {item.is_vegan && (
                                            <Badge colorScheme="teal" variant="subtle" px={2} borderRadius="full">
                                                {t("vegan")}
                                            </Badge>
                                        )}
                                        {item.is_gluten_free && (
                                            <Badge colorScheme="orange" variant="subtle" px={2} borderRadius="full">
                                                {t("gluten_free")}
                                            </Badge>
                                        )}
                                        {item.is_combo && (
                                            <Badge colorScheme="purple" variant="subtle" px={2} borderRadius="full">
                                                {t("combo")}
                                            </Badge>
                                        )}
                                    </HStack>
                                </Box>
                            </Flex>
                            <HStack spacing={3}>
                                <Button
                                    as={ReactRouterLink}
                                    to={`/menu/item/edit/${id}`}
                                    colorScheme="teal"
                                    variant="outline"
                                    size="sm"
                                    fontWeight="600"
                                >
                                    {t("edit")}
                                </Button>
                                <Button
                                    as={ReactRouterLink}
                                    to={MENU_ITEM_LIST}
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
                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("name")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {item.name || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("slug")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {item.slug || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("sku")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {item.sku || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("barcode")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {item.barcode || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("category")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {item.category?.name || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("branch")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {item.branch || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("price")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {formatAmount(item.price) || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("cost_price")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {formatAmount(item.cost_price) || "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("preparation_time")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {item.preparation_time ? `${item.preparation_time} ${t("minutes")}` : "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("sort_order")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {item.sort_order ?? "-"}
                                </Text>
                            </Box>

                            <Box gridColumn={{ md: "span 2" }}>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("description")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {item.description || "-"}
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
                                <StatNumber fontSize="lg" color={item.status === "active" ? "green.500" : "red.500"}>
                                    {item.status === "active" ? t("active") : t("inactive")}
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
                                    {t("variants")}
                                </StatLabel>
                                <StatNumber fontSize="lg" color={colors.textPrimary}>
                                    {item.variants?.length ?? 0}
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
                                    {t("modifier_groups")}
                                </StatLabel>
                                <StatNumber fontSize="lg" color={colors.textPrimary}>
                                    {item.modifier_groups?.length ?? 0}
                                </StatNumber>
                            </Stat>
                        </SimpleGrid>

                        {/* Variants */}
                        {item.variants && item.variants.length > 0 && (
                            <>
                                <Divider my={8} borderColor={colors.borderDefault} />
                                <Heading size="sm" color={colors.textPrimary} fontWeight="bold" mb={4}>
                                    {t("variants")}
                                </Heading>
                                <Box
                                    overflowX="auto"
                                    borderRadius="lg"
                                    border="1px solid"
                                    borderColor={colors.borderDefault}
                                >
                                    <Table size="sm" variant="simple">
                                        <Thead bg={colors.bgSubtle}>
                                            <Tr>
                                                <Th color={colors.textSecondary} fontSize="xs" textTransform="uppercase">{t("name")}</Th>
                                                <Th color={colors.textSecondary} fontSize="xs" textTransform="uppercase">{t("sku")}</Th>
                                                <Th color={colors.textSecondary} fontSize="xs" textTransform="uppercase">{t("price")}</Th>
                                                <Th color={colors.textSecondary} fontSize="xs" textTransform="uppercase">{t("cost_price")}</Th>
                                                <Th color={colors.textSecondary} fontSize="xs" textTransform="uppercase">{t("default")}</Th>
                                                <Th color={colors.textSecondary} fontSize="xs" textTransform="uppercase">{t("status")}</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {item.variants.map((variant) => (
                                                <Tr key={variant.id}>
                                                    <Td fontSize="sm" color={colors.textPrimary} fontWeight="medium">{variant.name}</Td>
                                                    <Td fontSize="sm" color={colors.textPrimary}>{variant.sku || "-"}</Td>
                                                    <Td fontSize="sm" color={colors.textPrimary} fontWeight="600">{formatAmount(variant.price)}</Td>
                                                    <Td fontSize="sm" color={colors.textPrimary}>{formatAmount(variant.cost_price) || "-"}</Td>
                                                    <Td>
                                                        {variant.is_default && (
                                                            <Badge colorScheme="teal" variant="subtle" px={2} borderRadius="full">{t("default")}</Badge>
                                                        )}
                                                    </Td>
                                                    <Td>
                                                        <Badge
                                                            colorScheme={variant.status === "active" ? "green" : "gray"}
                                                            variant="subtle"
                                                            px={2}
                                                            borderRadius="full"
                                                        >
                                                            {variant.status === "active" ? t("active") : t("inactive")}
                                                        </Badge>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </>
                        )}

                        {/* Modifier Groups */}
                        {item.modifier_groups && item.modifier_groups.length > 0 && (
                            <>
                                <Divider my={8} borderColor={colors.borderDefault} />
                                <Heading size="sm" color={colors.textPrimary} fontWeight="bold" mb={4}>
                                    {t("modifier_groups")}
                                </Heading>
                                <VStack spacing={4} align="stretch">
                                    {item.modifier_groups.map((group) => (
                                        <Box
                                            key={group.id}
                                            p={4}
                                            border="1px solid"
                                            borderColor={colors.borderDefault}
                                            borderRadius="lg"
                                            bg={colors.bgSubtle}
                                        >
                                            <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                                                <Text fontSize="sm" fontWeight="bold" color={colors.textPrimary}>{group.name}</Text>
                                                <HStack gap={2} flexWrap="wrap">
                                                    <Badge colorScheme={group.is_required ? "red" : "gray"} variant="subtle" px={2} borderRadius="full">
                                                        {group.is_required ? t("required") : t("optional")}
                                                    </Badge>
                                                    {group.min_selections > 0 && (
                                                        <Badge colorScheme="purple" variant="subtle" px={2} borderRadius="full">
                                                            {t("min")}: {group.min_selections}
                                                            {group.max_selections ? ` / ${t("max")}: ${group.max_selections}` : ""}
                                                        </Badge>
                                                    )}
                                                </HStack>
                                            </Flex>
                                            {group.modifiers && group.modifiers.length > 0 && (
                                                <Flex mt={3} gap={2} flexWrap="wrap">
                                                    {group.modifiers.map((mod) => (
                                                        <Badge
                                                            key={mod.id}
                                                            colorScheme="gray"
                                                            variant="outline"
                                                            px={3}
                                                            py={1}
                                                            borderRadius="full"
                                                            fontSize="xs"
                                                            fontWeight="500"
                                                        >
                                                            {mod.name}
                                                            {mod.price > 0 ? ` (+${formatAmount(mod.price)})` : ""}
                                                        </Badge>
                                                    ))}
                                                </Flex>
                                            )}
                                        </Box>
                                    ))}
                                </VStack>
                            </>
                        )}

                        {/* Timestamps */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={8}>
                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("created_at")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {item.created_at ? new Date(item.created_at).toLocaleString() : "-"}
                                </Text>
                            </Box>

                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color={colors.textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1}>
                                    {t("updated_at")}
                                </Text>
                                <Text fontSize="md" color={colors.textPrimary} fontWeight="medium">
                                    {item.updated_at ? new Date(item.updated_at).toLocaleString() : "-"}
                                </Text>
                            </Box>
                        </SimpleGrid>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default MenuItemView;
