import {
    Box, Button, Card, CardHeader, CardBody, Heading, SimpleGrid,
    FormControl, FormLabel, FormErrorMessage, Input, Select, Textarea,
    Switch, Breadcrumb, BreadcrumbItem, BreadcrumbLink, useToast,
    Flex, Text, HStack, Checkbox, CheckboxGroup, VStack, Badge, Image,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../axios";
import useThemeColors from "../../hooks/useThemeColors";

const MenuItemCreate = () => {
    const colors = useThemeColors();
    const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm({
        defaultValues: {
            modifier_group_ids: [],
            status: "active",
            is_featured: false,
        },
    });
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [modifierGroups, setModifierGroups] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const toast = useToast();
    const imageFile = watch("image");

    useEffect(() => {
        if (imageFile && imageFile.length > 0) {
            const file = imageFile[0];
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(null);
        }
    }, [imageFile]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
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

            const res = await api.post("/v1/menu/items", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            reset();
            toast({ title: res.data.message, status: "success", duration: 3000, isClosable: true });
            window.location.href = "/menu/items";
        } catch (err) {
            const errorResponse = err?.response?.data;
            const msg = errorResponse?.errors
                ? Object.values(errorResponse.errors).flat().join(" ")
                : errorResponse?.message || t("error");
            toast({ title: t("error"), description: msg, status: "error", duration: 3000, isClosable: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        Promise.all([
            api.get("/v1/menu/categories", { params: { per_page: 200 } }),
            api.get("/v1/menu/modifier-groups", { params: { per_page: 200 } }),
        ]).then(([catRes, modRes]) => {
            setCategories(catRes.data?.data || []);
            setModifierGroups(modRes.data?.data || []);
        });
    }, []);

    return (
        <Box className="form-dark-surface" bg={colors.bgSubtle} minH="100vh" py={3}>
            <Box mx="auto">
                <Card mb={4} bg={colors.bgCard} shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Breadcrumb fontSize="sm" color={colors.textSecondary}>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to="/dashboard" fontWeight="medium" _hover={{ color: "teal.500" }}>{t("dashboard")}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to="/menu/items" fontWeight="medium" _hover={{ color: "teal.500" }}>{t("list")}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color={colors.textPrimary} fontWeight="bold">{t("add")}</BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={colors.bgCard}>
                    <CardHeader bg={colors.bgCard} borderBottom="1px solid" borderColor={colors.borderSubtle} pb={6}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">{t("add")}</Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>{t("create_new_menu_item")}</Text>
                            </Box>
                            <Button colorScheme="teal" as={ReactRouterLink} to="/menu/items" variant="outline" display={{ base: "none", md: "inline-flex" }} size="sm" fontWeight="600">{t("list")}</Button>
                        </Flex>
                    </CardHeader>

                    <CardBody p={8}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                <FormControl isRequired isInvalid={errors.name}>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("name")}</FormLabel>
                                    <Input {...register("name", { required: true })} placeholder={t("name")} bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md" transition="all 0.2s" />
                                    <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("sku")}</FormLabel>
                                    <Input {...register("sku")} placeholder={t("sku")} bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md" transition="all 0.2s" />
                                </FormControl>

                                <FormControl isRequired isInvalid={errors.menu_category_id}>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("category")}</FormLabel>
                                    <Select {...register("menu_category_id", { required: true })} placeholder={t("select_category")} bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md" transition="all 0.2s">
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </Select>
                                    <FormErrorMessage>{errors.menu_category_id?.message}</FormErrorMessage>
                                </FormControl>

                                <FormControl isRequired isInvalid={errors.price}>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("price")}</FormLabel>
                                    <Input {...register("price", { required: true, valueAsNumber: true })} type="number" step="0.01" placeholder={t("price")} bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md" transition="all 0.2s" />
                                    <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("cost_price")}</FormLabel>
                                    <Input {...register("cost_price", { valueAsNumber: true })} type="number" step="0.01" placeholder={t("cost_price")} bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md" transition="all 0.2s" />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("preparation_time")}</FormLabel>
                                    <Input {...register("preparation_time", { valueAsNumber: true })} type="number" placeholder={t("preparation_time")} bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md" transition="all 0.2s" />
                                </FormControl>

                                <FormControl gridColumn={{ md: "span 2" }}>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("description")}</FormLabel>
                                    <Textarea {...register("description")} placeholder={t("description")} bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md" transition="all 0.2s" rows={3} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("image")}</FormLabel>
                                    <Input type="file" accept="image/*" {...register("image")} bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md" transition="all 0.2s" p={1} sx={{ "&::file-selector-button": { bg: "gray.100", border: "none", borderRadius: "md", px: 3, py: 1, mr: 3, cursor: "pointer", _hover: { bg: "gray.200" } } }} />
                                    {imagePreview && <Image src={imagePreview} mt={3} maxH="120px" borderRadius="md" objectFit="cover" />}
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("status")}</FormLabel>
                                    <Select {...register("status")} bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md" transition="all 0.2s">
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
                                                    <Text fontSize="sm" fontWeight="semibold" color={colors.textPrimary}>{t("featured")}</Text>
                                                </HStack>
                                            )}
                                        />
                                    </HStack>
                                </FormControl>
                            </SimpleGrid>

                            {modifierGroups.length > 0 && (
                                <Box mt={8}>
                                    <Text fontWeight="semibold" color={colors.textPrimary} mb={3} fontSize="sm">{t("modifier_groups")}</Text>
                                        <Text fontSize="xs" color={colors.textSecondary} mb={4}>{t("select_modifier_groups_help")}</Text>
                                    <Controller
                                        name="modifier_group_ids"
                                        control={control}
                                        render={({ field }) => (
                                            <CheckboxGroup value={(field.value || []).map(String)} onChange={(val) => field.onChange(val.map(Number))}>
                                                <VStack align="start" spacing={3}>
                                                    {modifierGroups.map((group) => (
                                                        <Box key={group.id} p={3} border="1px solid" borderColor={colors.borderDefault} borderRadius="md" w="100%" _hover={{ bg: colors.bgSubtle }}>
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
                                <Button type="submit" isLoading={isSubmitting} loadingText={t("saving")} colorScheme="teal" bg="teal.500" color="white" fontWeight="semibold" px={8} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "teal.600" }} _active={{ bg: "teal.700" }} boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)">{t("save")}</Button>
                            </Flex>
                        </form>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default MenuItemCreate;
