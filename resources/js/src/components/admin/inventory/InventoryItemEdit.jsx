import React, { useEffect, useState } from "react";
import {
  Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Card, CardBody,
  Flex, Spinner, Text, useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link as ReactRouterLink, useNavigate, useParams } from "react-router-dom";
import api from "../../../axios";
import {
  GET_EDIT_INVENTORY_ITEM, UPDATE_INVENTORY_ITEM,
  LIST_BRANCH, LIST_INVENTORY_CATEGORY, LIST_SUPPLIER, LIST_UNIT,
} from "../../../routes/apiRoutes";
import { DASHBOARD_PATH, INVENTORY_ITEM_LIST_PATH } from "../../../routes/superAdminRoutes";
import InventoryItemForm from "./InventoryItemForm";

export default function InventoryItemEdit() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [units, setUnits] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm({
    defaultValues: {
      name: "", branch_id: "", inventory_category_id: "", supplier_id: "",
      sku: "", description: "", unit: "piece",
      quantity: 0, reorder_level: 0, cost_price: "",
      image: null, is_active: true,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        const [itemRes, branchRes, catRes, supRes, unitRes] = await Promise.all([
          api.get(GET_EDIT_INVENTORY_ITEM(id)),
          api.get(`${LIST_BRANCH}?per_page=100`),
          api.get(`${LIST_INVENTORY_CATEGORY}?per_page=200`),
          api.get(`${LIST_SUPPLIER}?per_page=200`),
          api.get(`${LIST_UNIT}?per_page=200`),
        ]);
        const item = itemRes.data.data;
        setBranches(branchRes.data?.data?.data || branchRes.data?.data || []);
        setCategories(catRes.data?.data?.data || catRes.data?.data || []);
        setSuppliers(supRes.data?.data?.data || supRes.data?.data || []);
        setUnits(unitRes.data?.data?.data || unitRes.data?.data || []);
        form.reset({
          name: item.name || "",
          branch_id: item.branch_id || "",
          inventory_category_id: item.inventory_category_id || "",
          supplier_id: item.supplier_id || "",
          sku: item.sku || "",
          description: item.description || "",
          unit: item.unit || "",
          quantity: item.quantity || 0,
          reorder_level: item.reorder_level || 0,
          cost_price: item.cost_price || "",
          image: null,
          is_active: item.is_active,
        });
      } catch {
        toast({ title: t("error_loading_inventory"), status: "error", duration: 3000, isClosable: true });
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
      formData.append("branch_id", data.branch_id || "");
      formData.append("inventory_category_id", data.inventory_category_id || "");
      formData.append("supplier_id", data.supplier_id || "");
      formData.append("sku", data.sku || "");
      formData.append("unit", data.unit || "");
      formData.append("quantity", data.quantity || 0);
      formData.append("reorder_level", data.reorder_level || 0);
      formData.append("cost_price", data.cost_price || 0);
      formData.append("is_active", data.is_active ? 1 : 0);
      formData.append("_method", "PUT");
      if (data.image?.[0]) formData.append("image", data.image[0]);

      const res = await api.post(UPDATE_INVENTORY_ITEM(id), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast({ title: res.data.message || t("inventory_item_updated"), status: "success", duration: 3000, isClosable: true });
      navigate(INVENTORY_ITEM_LIST_PATH);
    } catch (err) {
      const msg = err?.response?.data?.data
        ? Object.values(err.response.data.data).flat().join(" ")
        : err?.response?.data?.message || t("error");
      toast({ title: t("error"), description: msg, status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <Card mb={5}>
        <CardBody>
          <Breadcrumb fontSize={{ base: "sm", md: "md" }}>
            <BreadcrumbItem>
              <BreadcrumbLink as={ReactRouterLink} to={DASHBOARD_PATH}>{t("dashboard")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink as={ReactRouterLink} to={INVENTORY_ITEM_LIST_PATH}>{t("all_inventory_items")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{t("edit_inventory_item")}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </CardBody>
      </Card>

      {isLoadingData ? (
        <Flex justify="center" py={12}><Spinner size="xl" color="brand.500" /></Flex>
      ) : (
        <InventoryItemForm
          {...form}
          onSubmit={onSubmit}
          branches={branches}
          categories={categories}
          suppliers={suppliers}
          units={units}
          isSubmitting={isSubmitting}
          submitLabel={t("save")}
          cancelPath={INVENTORY_ITEM_LIST_PATH}
          LinkComponent={ReactRouterLink}
        />
      )}
    </Box>
  );
}
