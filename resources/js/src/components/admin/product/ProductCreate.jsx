import React, { useEffect, useState } from "react";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Card, CardBody, useToast } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link as ReactRouterLink, useNavigate } from "react-router-dom";
import api from "../../../axios";
import { GET_BRANCH_ADDONS, STORE_ITEM } from "../../../routes/apiRoutes";
import { DASHBOARD_PATH, PRODUCT_LIST_PATH } from "../../../routes/superAdminRoutes";
import { useBranches } from "../../../hooks/useBranches";
import { useCategories } from "../../../hooks/useCategories";
import { useVariations } from "../../../hooks/useVariations";
import ProductForm from "./ProductForm";

export default function ProductCreate() {
    const { t } = useTranslation();
    const toast = useToast();
    const navigate = useNavigate();
    const [addons, setAddons] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
            description: "",
            product_cost: "",
            sell_price: "",
            main_image: null,
            item_available_for: ["dine_in", "pickup", "delivery"],
            featured_item: false,
            is_active: 1,
            variations: [],
            addons: [],
        },
    });

    useEffect(() => {
        const appName = localStorage.getItem("app_name");
        document.title = `${appName} | Product Create`;

        api.get(GET_BRANCH_ADDONS)
            .then((res) => setAddons(res.data.data || []))
            .catch(() => setAddons([]));
    }, []);

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
            formData.append("product_cost", data.product_cost || 0);
            formData.append("sell_price", data.sell_price || "");
            formData.append("is_active", data.is_active ? 1 : 0);

            (data.variations || []).forEach((variation) => formData.append("variations[]", variation.variation_id));
            (data.addons || []).forEach((addon) => formData.append("addons[]", addon.addon_id));
            (data.item_available_for || []).forEach((item) => formData.append("item_available_for[]", item));

            if (data.main_image?.[0]) {
                formData.append("main_image", data.main_image[0]);
            }

            const res = await api.post(STORE_ITEM, formData, {
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
                            <BreadcrumbLink>{t("add")}</BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                </CardBody>
            </Card>

            <ProductForm
                {...form}
                onSubmit={onSubmit}
                branches={branches}
                categories={categories}
                variations={variations}
                addons={addons}
                isSubmitting={isSubmitting}
                submitLabel={t("create_item")}
                cancelPath={PRODUCT_LIST_PATH}
                LinkComponent={ReactRouterLink}
            />
        </Box>
    );
}
