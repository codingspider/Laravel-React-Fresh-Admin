import React, { useEffect, useState } from "react";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Card, CardBody, Flex, Text, useToast } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link as ReactRouterLink, useNavigate, useParams } from "react-router-dom";
import api from "../../../axios";
import { GET_BRANCH_ADDONS, GET_EDIT_ITEM, UPDATE_ITEM } from "../../../routes/apiRoutes";
import { DASHBOARD_PATH, PRODUCT_LIST_PATH } from "../../../routes/superAdminRoutes";
import { useBranches } from "../../../hooks/useBranches";
import { useCategories } from "../../../hooks/useCategories";
import { useVariations } from "../../../hooks/useVariations";
import ProductForm from "./ProductForm";

export default function ProductEdit() {
    const { t } = useTranslation();
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();
    const [addons, setAddons] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const { branches } = useBranches();
    const { categories } = useCategories();
    const { variations } = useVariations();
    const form = useForm({
        defaultValues: {
            name: "",
            category_id: "",
            branch_id: "",
            sequence_index: "",
            sku: "",
            subtitle: "",
            description: "",
            main_image: null,
            item_available_for: [],
            featured_item: false,
            is_active: 1,
            variations: [],
            addons: [],
        },
    });

    useEffect(() => {
        const appName = localStorage.getItem("app_name");
        document.title = `${appName} | Product Edit`;

        const loadData = async () => {
            try {
                setIsLoadingData(true);
                const [productRes, addonsRes] = await Promise.all([
                    api.get(GET_EDIT_ITEM(id)),
                    api.get(GET_BRANCH_ADDONS),
                ]);

                const product = productRes.data.data;
                setAddons(addonsRes.data.data || []);
                form.reset({
                    name: product.name || "",
                    category_id: product.category_id || "",
                    branch_id: product.branch_id || "",
                    sequence_index: product.sequence_index || "",
                    sku: product.sku || "",
                    subtitle: product.subtitle || "",
                    description: product.description || "",
                    main_image: null,
                    item_available_for: product.item_available_for || [],
                    featured_item: product.featured_item || false,
                    is_active: product.is_active ? 1 : 0,
                    variations: (product.variations || []).map((variationId) => ({ variation_id: variationId })),
                    addons: (product.addons || []).map((addonId) => ({ addon_id: addonId })),
                });
            } catch (error) {
                toast({
                    position: "bottom-right",
                    title: "Error",
                    description: error.response?.data?.message || "Failed to load product data.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setIsLoadingData(false);
            }
        };

        loadData();
    }, [id]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("name", data.name || "");
            formData.append("description", data.description || "");
            formData.append("category_id", data.category_id || "");
            formData.append("branch_id", data.branch_id || "");
            formData.append("featured_item", data.featured_item ? 1 : 0);
            formData.append("sequence_index", data.sequence_index || "");
            formData.append("sku", data.sku || "");
            formData.append("subtitle", data.subtitle || "");
            formData.append("is_active", data.is_active ? 1 : 0);
            formData.append("_method", "PUT");

            (data.variations || []).forEach((variation) => formData.append("variations[]", variation.variation_id));
            (data.addons || []).forEach((addon) => formData.append("addons[]", addon.addon_id));
            (data.item_available_for || []).forEach((item) => formData.append("item_available_for[]", item));

            if (data.main_image?.[0]) {
                formData.append("main_image", data.main_image[0]);
            }

            const res = await api.post(UPDATE_ITEM(id), formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast({
                position: "bottom-right",
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(PRODUCT_LIST_PATH);
        } catch (err) {
            const errorResponse = err?.response?.data;
            const description = errorResponse?.data
                ? Object.values(errorResponse.data).flat().join(" ")
                : errorResponse?.message || "Something went wrong";

            toast({
                position: "bottom-right",
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

    return (
        <Box className="form-dark-surface">
            <Card mb={5}>
                <CardBody>
                    <Breadcrumb fontSize={{ base: "sm", md: "md" }}>
                        <BreadcrumbItem>
                            <BreadcrumbLink as={ReactRouterLink} to={DASHBOARD_PATH}>{t("dashboard")}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <BreadcrumbLink as={ReactRouterLink} to={PRODUCT_LIST_PATH}>{t("list")}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink>{t("edit")}</BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                </CardBody>
            </Card>

            {isLoadingData ? (
                <Flex justify="center" align="center" h="40">
                    <Text color="gray.500">Loading data...</Text>
                </Flex>
            ) : (
                <ProductForm
                    {...form}
                    onSubmit={onSubmit}
                    branches={branches}
                    categories={categories}
                    variations={variations}
                    addons={addons}
                    isSubmitting={isSubmitting}
                    submitLabel={t("save")}
                    cancelPath={PRODUCT_LIST_PATH}
                    LinkComponent={ReactRouterLink}
                />
            )}
        </Box>
    );
}
