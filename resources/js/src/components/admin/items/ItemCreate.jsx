import {
    Box,
    Button,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Text,
    SimpleGrid,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    Checkbox,
    Flex,
    IconButton,
    Tag,
    useDisclosure,
    useToast,
    Switch,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link as ReactRouterLink } from "react-router-dom";
import VariationModal from "./VariationModal";
import AddonModal from "./AddonModal";
import { useEffect, useState } from "react";
import api from "../../../axios";
import { GET_BRANCH_ADDONS, GET_BRANCH_VARIATIONS, STORE_INVENTORY_ITEM } from "../../../routes/apiRoutes";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";
import { useBranches } from "../../../hooks/useBranches";
import { useVariations } from "../../../hooks/useVariations";
import { useCategories } from "../../../hooks/useCategories";
import useThemeColors from "../../../hooks/useThemeColors";

const LIST_PATH = "/items";
const DASHBOARD_PATH = "/dashboard";

export default function ItemCreate() {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const itemCardBorder = colors.borderInput;
    const [addonData, setAddonData] = useState([]);
    const [variationData, setVariationData] = useState([]);
    const { formatAmount } = useCurrencyFormatter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            category_id: "",
            branch_id: "",
            sequence_index: "",
            sku: "",
            subtitle: "",
            description: "",
            main_image: null,
            is_active: 1,
            additional_images: [],
            item_available_for: [],
            variations: [],
            addons: [],
        },
    });

    const { fields: variationFields, append: variationAppend, remove: variationRemove } = useFieldArray({ control, name: "variations" });
    const { fields: addonFields, append: addonAppend, remove: addonRemove } = useFieldArray({ control, name: "addons" });

    const variationModal = useDisclosure();
    const addonModal = useDisclosure();
    const toast = useToast();
    const { branches } = useBranches();
    const { categories } = useCategories();
    const { variations } = useVariations();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("description", data.description);
            formData.append("category_id", data.category_id);
            formData.append("branch_id", data.branch_id);
            formData.append("featured_item", data.featured_item);
            formData.append("sequence_index", data.sequence_index);
            formData.append("sku", data.sku);
            formData.append("subtitle", data.subtitle);
            formData.append("is_active", data.is_active);

            data.variations.forEach((v) => {
                formData.append("variations[]", v.variation_id);
            });
            data.addons.forEach((a) => {
                formData.append("addons[]", a.addon_id);
            });
            data.item_available_for.forEach((v) => {
                formData.append("item_available_for[]", v);
            });
            if (data.main_image?.[0]) {
                formData.append("main_image", data.main_image[0]);
            }

            const res = await api.post(STORE_INVENTORY_ITEM, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            reset();
            toast({
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (err) {
            const errorResponse = err?.response?.data;
            const description = errorResponse?.errors
                ? Object.values(errorResponse.errors).flat().join(" ")
                : errorResponse?.message ?? "Something went wrong";
            toast({
                title: "Error",
                description,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchAddons = async () => {
        try {
            const res = await api.get(GET_BRANCH_ADDONS);
            setAddonData(res.data.data);
        } catch (err) {
            console.error("fetchAddons error:", err);
        }
    };

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Item Create`;
        fetchAddons();
    }, []);

    useEffect(() => {
        setVariationData(variations);
    }, [variations]);

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
                                    {t("add")}
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
                                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">{t("add")}</Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>{t("create_new_item")}</Text>
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("branch")}</FormLabel>
                                    <Select
                                        {...register("branch_id")}
                                        placeholder={t("select_branch")}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("category")}</FormLabel>
                                    <Select
                                        {...register("category_id")}
                                        placeholder={t("select_category")}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("title")}</FormLabel>
                                    <Input
                                        {...register("name")}
                                        placeholder={t("enter_title")}
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

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("sequence_index")}</FormLabel>
                                    <Input
                                        {...register("sequence_index")}
                                        type="number"
                                        placeholder="01"
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("sku")}</FormLabel>
                                    <Input
                                        {...register("sku")}
                                        placeholder={t("enter_sku")}
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("subtitle")}</FormLabel>
                                    <Input
                                        {...register("subtitle")}
                                        placeholder={t("enter_subtitle")}
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("description")}</FormLabel>
                                    <Textarea
                                        {...register("description")}
                                        placeholder={t("enter_description")}
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

                            {/* Availability */}
                            <Box mt={6}>
                                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("item_available_for")}</FormLabel>
                                <Flex gap={4}>
                                    <Checkbox {...register("item_available_for[]")} value="dine_in" defaultChecked colorScheme="teal">{t("dine_in")}</Checkbox>
                                    <Checkbox {...register("item_available_for[]")} value="pickup" defaultChecked colorScheme="teal">{t("pickup")}</Checkbox>
                                    <Checkbox {...register("item_available_for[]")} value="delivery" defaultChecked colorScheme="teal">{t("delivery")}</Checkbox>
                                </Flex>
                                <Box mt={4}>
                                    <Checkbox {...register("use_for[]")} value="online_orders" defaultChecked colorScheme="teal">{t("online_orders")}</Checkbox>
                                    <Checkbox {...register("use_for[]")} value="pos_orders" ml={5} defaultChecked colorScheme="teal">{t("pos_orders")}</Checkbox>
                                </Box>
                                <Box mt={4}>
                                    <Checkbox {...register("featured_item")} value={1} colorScheme="teal">{t("featured_item")}</Checkbox>
                                </Box>
                            </Box>

                            {/* Images */}
                            <Box mt={6}>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                    <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("main_image")}</FormLabel>
                                        <Input
                                            type="file"
                                            {...register("main_image")}
                                            bg={colors.bgInput}
                                            border="1px solid"
                                            borderColor={colors.borderInput}
                                            borderRadius="md"
                                            focusBorderColor="teal.500"
                                            _hover={{ borderColor: "gray.300" }}
                                            size="md"
                                            transition="all 0.2s"
                                            p={1}
                                        />
                                    </FormControl>
                                </SimpleGrid>
                            </Box>

                            {/* Variations */}
                            <Box mt={6}>
                                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("variations")}</FormLabel>
                                <Flex gap={4} flexWrap="wrap">
                                    {variationFields.map((v, index) => {
                                        const parentVariation = variationData.find((variation) => variation.id === v.variation_id);
                                        return (
                                            <Box key={v.id} minW="200px" flex="1" maxW="300px">
                                                <Flex
                                                    p={3}
                                                    border="1px solid"
                                                    borderColor={itemCardBorder}
                                                    rounded="md"
                                                    direction="column"
                                                    gap={2}
                                                >
                                                    <Flex justify="space-between" align="center">
                                                        <Box fontWeight="bold" color={colors.textPrimary}>{parentVariation?.name}</Box>
                                                        <IconButton
                                                            icon={<DeleteIcon />}
                                                            colorScheme="red"
                                                            size="sm"
                                                            onClick={() => variationRemove(index)}
                                                        />
                                                    </Flex>
                                                    {parentVariation?.variation_items?.map((item) => (
                                                        <Flex key={item.id} justify="space-between">
                                                            <Box color={colors.textPrimary}>{item.name}</Box>
                                                            <Tag>{formatAmount(item.price)}</Tag>
                                                        </Flex>
                                                    ))}
                                                </Flex>
                                            </Box>
                                        );
                                    })}
                                </Flex>
                                <Button mt={4} leftIcon={<AddIcon />} colorScheme="teal" onClick={variationModal.onOpen}>
                                    {t("add_variation")}
                                </Button>
                            </Box>

                            {/* Addons */}
                            <Box mt={6}>
                                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("addons")}</FormLabel>
                                <Flex gap={4} flexWrap="wrap">
                                    {addonFields.map((a, index) => {
                                        const parentAddon = addonData.find((addon) => addon.id === a.addon_id);
                                        return (
                                            <Box key={a.id} minW="200px" flex="1" maxW="300px">
                                                <Flex
                                                    p={3}
                                                    border="1px solid"
                                                    borderColor={itemCardBorder}
                                                    rounded="md"
                                                    direction="column"
                                                    gap={2}
                                                >
                                                    <Flex justify="space-between" align="center">
                                                        <Box fontWeight="bold" color={colors.textPrimary}>{parentAddon?.name}</Box>
                                                        <IconButton
                                                            icon={<DeleteIcon />}
                                                            colorScheme="red"
                                                            size="sm"
                                                            onClick={() => addonRemove(index)}
                                                        />
                                                    </Flex>
                                                    <Tag>{formatAmount(parentAddon?.price)}</Tag>
                                                </Flex>
                                            </Box>
                                        );
                                    })}
                                </Flex>
                                <Button mt={4} leftIcon={<AddIcon />} colorScheme="teal" onClick={addonModal.onOpen}>
                                    {t("add_addon")}
                                </Button>
                                <FormControl display="flex" mt={4} isRequired alignItems="center">
                                    <FormLabel mb="0" fontSize="sm" fontWeight="semibold" color={colors.textPrimary}>{t("is_active")}</FormLabel>
                                    <Controller
                                        name="is_active"
                                        control={control}
                                        defaultValue={1}
                                        render={({ field }) => (
                                            <Switch
                                                colorScheme="teal"
                                                isChecked={field.value === 1}
                                                onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Box>

                            <VariationModal variationData={variationData} variationModal={variationModal} onSubmit={(data) => variationAppend(data)} />
                            <AddonModal addonData={addonData} addonModal={addonModal} onSubmit={(data) => addonAppend(data)} />

                            <Flex mt={10} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                                <Button type="button" as={ReactRouterLink} to={LIST_PATH} colorScheme="gray" variant="outline" fontWeight="semibold" px={6} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "gray.50" }}>
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
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
}