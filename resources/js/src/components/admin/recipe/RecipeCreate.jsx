import React, { useState, useEffect } from "react";
import {
  Box, Card, CardBody, CardHeader, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  useToast, Heading, Text, Flex, Button,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useNavigate, Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { STORE_RECIPE, RECIPE_OPTIONS } from "../../../routes/apiRoutes";
import { DASHBOARD_PATH, RECIPE_LIST_PATH } from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import RecipeForm from "./RecipeForm";

const RecipeCreate = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const colors = useThemeColors();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState({ inventory_items: [], units: [], categories: [] });
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      name: "", category_id: "", selling_price: "", yield_quantity: "1", yield_unit_id: "",
      auto_deduct_stock: "yes", preparation_time: "", cooking_time: "",
      status: "active", description: "", ingredients: [],
    },
  });

  useEffect(() => {
    const app_name = localStorage.getItem("app_name");
    document.title = `${app_name} | ${t("recipe_create")}`;
    api.get(RECIPE_OPTIONS)
      .then((res) => setOptions(res.data?.data || { inventory_items: [], units: [], categories: [] }))
      .catch(() => {});
  }, [t]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const ingredients = (data.ingredients || [])
        .filter((i) => i.inventory_item_id)
        .map((i) => ({
          inventory_item_id: Number(i.inventory_item_id),
          quantity: Number(i.quantity) || 0,
          unit_id: i.unit_id ? Number(i.unit_id) : null,
          unit_cost: Number(i.unit_cost) || 0,
          is_optional: !!i.is_optional,
          notes: i.notes || null,
        }));
      const res = await api.post(STORE_RECIPE, { ...data, ingredients });
      toast({ title: res.data.message || t("recipe_created"), status: "success", duration: 3000, isClosable: true });
      navigate(RECIPE_LIST_PATH);
    } catch (err) {
      toast({
        title: t("error"), description: err?.response?.data?.message || t("something_went_wrong"),
        status: "error", duration: 3000, isClosable: true,
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
                <BreadcrumbLink as={ReactRouterLink} to={DASHBOARD_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>
                  {t("dashboard")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink as={ReactRouterLink} to={RECIPE_LIST_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>
                  {t("recipes")}
                </BreadcrumbLink>
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
                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">{t("add_recipe")}</Heading>
                <Text fontSize="sm" color={colors.textSecondary} mt={1}>{t("create_new_recipe")}</Text>
              </Box>
              <Button colorScheme="teal" as={ReactRouterLink} to={RECIPE_LIST_PATH} variant="outline" size="sm" fontWeight="600">
                {t("list")}
              </Button>
            </Flex>
          </CardHeader>

          <CardBody p={8}>
            <RecipeForm
              register={register}
              control={control}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              options={options}
              isSubmitting={isSubmitting}
              submitLabel={t("save")}
              cancelPath={RECIPE_LIST_PATH}
              LinkComponent={ReactRouterLink}
            />
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
};

export default RecipeCreate;
