import {
    Box, Button, Card, CardHeader, CardBody, Heading, SimpleGrid,
    FormControl, FormLabel, FormErrorMessage, Input, Select, Textarea,
    Switch, Breadcrumb, BreadcrumbItem, BreadcrumbLink, useToast,
    Flex, Text, HStack, Checkbox, CheckboxGroup, VStack, Badge, Image, Skeleton,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { Link as ReactRouterLink, useParams, useNavigate } from "react-router-dom";
import api from "../../axios";

const MenuItemEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [modifierGroups, setModifierGroups] = useState([]);
    const [item, setItem] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm({
        defaultValues: {
            modifier_group_ids: [],
            status: "active",
            is_featured: false,
        },
    });
    const toast = useToast();
    const imageFile = watch("image");

    useEffect(() => {
        if (imageFile && imageFile.length > 0) {
            const file = imageFile[0];
            setImagePreview(URL.createObjectURL(file));
        }
    }, [imageFile]);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const [catRes, modRes, itemRes] = await Promise.all([
                    api.get("/v1/menu/categories", { params: { per_page: 200 } }),
                    api.get("/v1/menu/modifier-groups", { params: { per_page: 200 } }),
                    api.get(`/v1/menu/items/${id}`),
                ]);

                setCategories(catRes.data?.data || []);
                setModifierGroups(modRes.data?.data || []);

                const itemData = itemRes.data?.data;
                setItem(itemData);

                if (itemData?.image_url) {
                    setImagePreview(itemData.image_url);
                }

                reset({
                    name: itemData?.name ?? "",
                    sku: itemData?.sku ?? "",
                    description: itemData?.description ?? "",
                    price: itemData?.price ?? "",
                    cost_price: itemData?.cost_price ?? "",
                    menu_category_id: itemData?.menu_category_id ?? "",
                    preparation_time: itemData?.preparation_time ?? "",
                    status: itemData?.status ?? "active",
                    is_featured: itemData?.is_featured ?? false,
                    modifier_group_ids: itemData?.modifier_groups?.map(g => g.id) ?? [],
                });
            } catch (error) {
                toast({ position: "bottom-right", title: t("error"), status: "error", duration: 3000, isClosable: true });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, t, reset, toast]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("_method", "PUT");

            Object.keys(data).forEach((key) => {
                if (key === "image") {
                    if (data[key] && data[key].length > 0) {
                        formData.append("image", data[key][0]);
                    }
                } else if (key === "modifier_group_ids" && Array.isArray(data[key])) {
                    data[key].forEach((id) => formData.append("modifier_group_ids[]", id));
                } else if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, typeof data[key] === "boolean" ? (data[key] ? 1 : 0) : data[key]);
                }
            });

            const res = await api.post(`/v1/menu/items/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast({ position: "bottom-right", title: res.data.message, status: "success", duration: 3000, isClosable: true });
            reset();
            navigate("/menu/items");
        } catch (err) {
            const errorResponse = err?.response?.data;
            const msg = errorResponse?.errors
                ? Object.values(errorResponse.errors).flat().join(" ")
                : errorResponse?.message || t("error");
            toast({ position: "bottom-right", title: t("error"), description: msg, status: "error", duration: 3000, isClosable: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box bg="gray.50" minH="100vh" py={3}>
            <Box mx="auto">
                <Card mb={4} bg="white" shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Breadcrumb fontSize="sm" color="gray.500">
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to="/dashboard" fontWeight="medium" _hover={{ color: "teal.500" }}>{t("dashboard")}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to="/menu/items" fontWeight="medium" _hover={{ color: "teal.500" }}>{t("list")}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color="gray.800" fontWeight="bold">{t("edit")}</BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg="white">
                    <CardHeader bg="white" borderBottom="1px solid" borderColor="gray.100" pb={6}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="sm" color="gray.800" fontWeight="bold">{t("edit")}</Heading>
                                <Text fontSize="sm" color="gray.500" mt={1}>{item ? `${item.name} - ${t("edit")}` : t("edit_menu_item")}</Text>
                            </Box>
                            <Button colorScheme="teal" as={ReactRouterLink} to="/menu/items" variant="outline" display={{ base: "none", md: "inline-flex" }} size="sm" fontWeight="600">{t("list")}</Button>
                        </Flex>
                    </CardHeader>

                    <CardBody p={8}>
                        {loading ? (
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height="40px" borderRadius="md" />)}
                            </SimpleGrid>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                    <FormControl isRequired isInvalid={errors.name}>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>{t("name")}</FormLabel>
                                        <Input {...register("name", { required: true })} placeholder={t("name")} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="md" focusBorderColor="teal.500" />
                                        <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>{t("sku")}</FormLabel>
                                        <Input {...register("sku")} placeholder={t("sku")} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="md" focusBorderColor="teal.500" />
                                    </FormControl>

                                    <FormControl isRequired isInvalid={errors.menu_category_id}>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>{t("category")}</FormLabel>
                                        <Select {...register("menu_category_id", { required: true })} placeholder={t("select_category")} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="md" focusBorderColor="teal.500">
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </Select>
                                        <FormErrorMessage>{errors.menu_category_id?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isRequired isInvalid={errors.price}>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>{t("price")}</FormLabel>
                                        <Input {...register("price", { required: true, valueAsNumber: true })} type="number" step="0.01" placeholder={t("price")} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="md" focusBorderColor="teal.500" />
                                        <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>{t("cost_price")}</FormLabel>
                                        <Input {...register("cost_price", { valueAsNumber: true })} type="number" step="0.01" placeholder={t("cost_price")} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="md" focusBorderColor="teal.500" />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>{t("preparation_time")}</FormLabel>
                                        <Input {...register("preparation_time", { valueAsNumber: true })} type="number" placeholder={t("preparation_time")} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="md" focusBorderColor="teal.500" />
                                    </FormControl>

                                    <FormControl gridColumn={{ md: "span 2" }}>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>{t("description")}</FormLabel>
                                        <Textarea {...register("description")} placeholder={t("description")} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="md" focusBorderColor="teal.500" rows={3} />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>{t("image")}</FormLabel>
                                        <Input type="file" accept="image/*" {...register("image")} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="md" focusBorderColor="teal.500" p={1} sx={{ "&::file-selector-button": { bg: "gray.100", border: "none", borderRadius: "md", px: 3, py: 1, mr: 3, cursor: "pointer", _hover: { bg: "gray.200" } } }} />
                                        {imagePreview && <Image src={imagePreview} mt={3} maxH="120px" borderRadius="md" objectFit="cover" />}
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>{t("status")}</FormLabel>
                                        <Select {...register("status")} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="md" focusBorderColor="teal.500">
                                            <option value="active">{t("active")}</option>
                                            <option value="inactive">{t("inactive")}</option>
                                        </Select>
                                    </FormControl>

                                    <FormControl>
                                        <HStack spacing={6}>
                                            <Controller
                                                name="is_featured"
                                                control={control}
                                                render={({ field }) => (
                                                    <HStack>
                                                        <Switch isChecked={field.value} onChange={field.onChange} colorScheme="teal" />
                                                        <Text fontSize="sm" fontWeight="semibold" color="gray.700">{t("featured")}</Text>
                                                    </HStack>
                                                )}
                                            />
                                        </HStack>
                                    </FormControl>
                                </SimpleGrid>

                                {modifierGroups.length > 0 && (
                                    <Box mt={8}>
                                        <Text fontWeight="semibold" color="gray.700" mb={3} fontSize="sm">{t("modifier_groups")}</Text>
                                        <Text fontSize="xs" color="gray.500" mb={4}>{t("select_modifier_groups_help")}</Text>
                                        <Controller
                                            name="modifier_group_ids"
                                            control={control}
                                            render={({ field }) => (
                                                <CheckboxGroup value={(field.value || []).map(String)} onChange={(val) => field.onChange(val.map(Number))}>
                                                    <VStack align="start" spacing={3}>
                                                        {modifierGroups.map((group) => (
                                                            <Box key={group.id} p={3} border="1px solid" borderColor="gray.200" borderRadius="md" w="100%" _hover={{ bg: "gray.50" }}>
                                                                <Checkbox value={String(group.id)} colorScheme="teal">
                                                                    <Text fontWeight="semibold" fontSize="sm">{group.name}</Text>
                                                                </Checkbox>
                                                                <Flex mt={1} gap={2} flexWrap="wrap">
                                                                    <Badge size="sm" colorScheme={group.is_required ? "red" : "gray"}>
                                                                        {group.is_required ? t("required") : t("optional")}
                                                                    </Badge>
                                                                    <Badge size="sm" colorScheme="blue">
                                                                        {group.modifiers_count ?? 0} {t("modifiers")}
                                                                    </Badge>
                                                                    {group.min_selections > 0 && (
                                                                        <Badge size="sm" colorScheme="purple">
                                                                            {t("min")}: {group.min_selections}
                                                                            {group.max_selections ? ` / ${t("max")}: ${group.max_selections}` : ""}
                                                                        </Badge>
                                                                    )}
                                                                </Flex>
                                                            </Box>
                                                        ))}
                                                    </VStack>
                                                </CheckboxGroup>
                                            )}
                                        />
                                    </Box>
                                )}

                                <Flex mt={10} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                                    <Button type="button" as={ReactRouterLink} to="/menu/items" colorScheme="gray" variant="outline" fontWeight="semibold" px={6} h={12} borderRadius="md" w={{ base: "full", md: "auto" }}>{t("cancel")}</Button>
                                    <Button type="submit" isLoading={isSubmitting} loadingText={t("saving")} colorScheme="teal" bg="teal.500" color="white" fontWeight="semibold" px={8} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "teal.600" }}>{t("save")}</Button>
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
