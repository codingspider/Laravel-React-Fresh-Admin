import React, { useState, useEffect } from "react";
import {
  Box, Card, CardBody, CardHeader, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  useToast, Heading, Text, Flex, Button,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useNavigate, Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { STORE_PURCHASE } from "../../../routes/apiRoutes";
import { DASHBOARD_PATH, PURCHASE_LIST_PATH } from "../../../routes/superAdminRoutes";
import { LIST_SUPPLIER, LIST_BRANCH, LIST_INVENTORY_ITEM } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import PurchaseForm from "./PurchaseForm";

const PurchaseCreate = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const colors = useThemeColors();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [items, setItems] = useState([]);
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      supplier_id: "", branch_id: "", reference_number: "", invoice_number: "",
      purchase_date: new Date().toISOString().split("T")[0], expected_delivery_date: "",
      order_type: "purchase_order", status: "active", notes: "",
      tax_amount: "0", discount_amount: "0", shipping_cost: "0", paid_amount: "0",
      items: [],
    },
  });

  useEffect(() => {
    const app_name = localStorage.getItem("app_name");
    document.title = `${app_name} | ${t("purchase_create")}`;
    Promise.all([
      api.get(`${LIST_SUPPLIER}?per_page=200`),
      api.get(`${LIST_BRANCH}?per_page=200`),
      api.get(`${LIST_INVENTORY_ITEM}?per_page=200`),
    ]).then(([s, b, i]) => {
      const unwrap = (r) => r.data?.data?.data || r.data?.data || [];
      setSuppliers(unwrap(s));
      setBranches(unwrap(b));
      setItems(unwrap(i));
    }).catch(() => {});
  }, [t]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const itemsPayload = (data.items || [])
        .filter((i) => i.inventory_item_id)
        .map((i) => ({
          inventory_item_id: Number(i.inventory_item_id),
          quantity: Number(i.quantity) || 0,
          unit_price: Number(i.unit_price) || 0,
          tax_rate: Number(i.tax_rate) || 0,
          discount_percent: Number(i.discount_percent) || 0,
          notes: i.notes || null,
        }));
      const res = await api.post(STORE_PURCHASE, {
        ...data,
        supplier_id: Number(data.supplier_id),
        branch_id: data.branch_id ? Number(data.branch_id) : null,
        items: itemsPayload,
      });
      toast({ title: res.data.message || t("purchase_created"), status: "success", duration: 3000, isClosable: true });
      navigate(PURCHASE_LIST_PATH);
    } catch (err) {
      toast({
        title: t("error"),
        description: err?.response?.data?.message || t("something_went_wrong"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="form-dark-surface" bg={colors.bgSubtle} minH="100vh" py={3}>
      <Box mx="auto">
        <Card mb={4} bg={colors.bgCard} shadow="sm" borderRadius="lg" border="none">
          <CardBody py={3}>
            <Breadcrumb fontSize="sm" color={colors.textSecondary}>
              <BreadcrumbItem>
                <BreadcrumbLink as={ReactRouterLink} to={DASHBOARD_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>{t("dashboard")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink as={ReactRouterLink} to={PURCHASE_LIST_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>{t("purchases")}</BreadcrumbLink>
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
                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">{t("add_purchase")}</Heading>
                <Text fontSize="sm" color={colors.textSecondary} mt={1}>{t("create_new_purchase")}</Text>
              </Box>
              <Button colorScheme="teal" as={ReactRouterLink} to={PURCHASE_LIST_PATH} variant="outline" size="sm" fontWeight="600">{t("list")}</Button>
            </Flex>
          </CardHeader>

          <CardBody p={8}>
            <PurchaseForm
              register={register}
              control={control}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              suppliers={suppliers}
              branches={branches}
              items={items}
              isSubmitting={isSubmitting}
              submitLabel={t("save")}
              cancelPath={PURCHASE_LIST_PATH}
              LinkComponent={ReactRouterLink}
            />
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
};

export default PurchaseCreate;
