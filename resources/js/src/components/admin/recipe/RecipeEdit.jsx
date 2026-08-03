import React, { useState, useEffect } from "react";
import {
  Box, Card, CardBody, CardHeader, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  useToast, Heading, Text, Flex, Button,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { GET_EDIT_RECIPE, UPDATE_RECIPE, RECIPE_OPTIONS } from "../../../routes/apiRoutes";
import { DASHBOARD_PATH, RECIPE_LIST_PATH } from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import RecipeForm from "./RecipeForm";

const RecipeEdit = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const colors = useThemeColors();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [options, setOptions] = useState({ inventory_items: [], units: [], categories: [], menu_items: [] });
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: { name: "", menu_item_id: "", category_id: "", selling_price: "", yield_quantity: "1", yield_unit_id: "", auto_deduct_stock: "yes", preparation_time: "", cooking_time: "", status: "active", description: "", ingredients: [] },
  });

  useEffect(() => {
    const app_name = localStorage.getItem("app_name");
    document.title = `${app_name} | ${t("recipe_edit")}`;
    Promise.all([
      api.get(RECIPE_OPTIONS),
      api.get(GET_EDIT_RECIPE(id)),
    ]).then(([optRes, recipeRes]) => {
      setOptions(optRes.data?.data || { inventory_items: [], units: [], categories: [], menu_items: [] });
      const recipe = recipeRes.data?.data;
      if (recipe) {
        reset({
          name: recipe.name || "",
          menu_item_id: recipe.menu_item_id || "",
          category_id: recipe.category_id || "",
          selling_price: recipe.selling_price || "",
          yield_quantity: recipe.yield_quantity ?? "1",
          yield_unit_id: recipe.yield_unit_id || "",
          auto_deduct_stock: recipe.auto_deduct_stock || "yes",
          preparation_time: recipe.preparation_time ?? "",
          cooking_time: recipe.cooking_time ?? "",
          status: recipe.status || "active",
          description: recipe.description || "",
          ingredients: (recipe.ingredients || []).map((ing) => ({
            inventory_item_id: ing.inventory_item_id || "",
            quantity: ing.quantity ?? "",
            unit_id: ing.unit_id || "",
            unit_cost: ing.unit_cost ?? "",
            is_optional: !!ing.is_optional,
            notes: ing.notes || "",
          })),
        });
      }
    }).catch(() => toast({ title: t("error"), description: t("failed_to_load_recipe"), status: "error", duration: 3000, isClosable: true }))
      .finally(() => setIsLoading(false));
  }, [id, t, reset, toast]);

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
      const res = await api.put(UPDATE_RECIPE(id), { ...data, ingredients });
      toast({ title: res.data.message || t("recipe_updated"), status: "success", duration: 3000, isClosable: true });
      navigate(RECIPE_LIST_PATH);
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

  if (isLoading) return null;

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
                <BreadcrumbLink color={colors.textPrimary} fontWeight="bold">{t("edit")}</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </CardBody>
        </Card>

        <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={colors.bgCard}>
          <CardHeader bg={colors.bgCard} borderBottom="1px solid" borderColor={colors.borderSubtle} pb={6}>
            <Flex justify="space-between" align="center">
              <Box>
                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">{t("edit_recipe")}</Heading>
                <Text fontSize="sm" color={colors.textSecondary} mt={1}>{t("update_recipe")}</Text>
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
              submitLabel={t("update")}
              cancelPath={RECIPE_LIST_PATH}
              LinkComponent={ReactRouterLink}
            />
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
};

export default RecipeEdit;
