import React, { useState, useEffect } from "react";
import {
  Box, Card, CardBody, CardHeader, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  useToast, Heading, Text, Flex, Button, SimpleGrid, FormControl, FormLabel,
  Input, Textarea, Switch,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams, Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { STORE_RECIPE_CATEGORY, UPDATE_RECIPE_CATEGORY, GET_EDIT_RECIPE_CATEGORY } from "../../../routes/apiRoutes";
import { DASHBOARD_PATH, RECIPE_CATEGORY_LIST_PATH } from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { usePermission } from "../../../context/PermissionContext";

const RecipeCategoryForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const colors = useThemeColors();
  const { user } = usePermission();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: { name: "", description: "", is_active: true },
  });

  useEffect(() => {
    const app_name = localStorage.getItem("app_name");
    document.title = `${app_name} | ${t("recipe_category")}`;
    if (isEdit) {
      api.get(GET_EDIT_RECIPE_CATEGORY(id)).then((res) => {
        const c = res.data?.data;
        if (c) reset({ name: c.name, description: c.description || "", is_active: !!c.is_active });
      }).catch(() => {});
    }
  }, [id, isEdit, t, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, restaurant_id: user?.restaurant_id };
      const res = isEdit
        ? await api.put(UPDATE_RECIPE_CATEGORY(id), payload)
        : await api.post(STORE_RECIPE_CATEGORY, payload);
      toast({ title: res.data.message || t("saved"), status: "success", duration: 3000, isClosable: true });
      navigate(RECIPE_CATEGORY_LIST_PATH);
    } catch (err) {
      toast({ title: t("error"), description: err?.response?.data?.message || t("something_went_wrong"), status: "error", duration: 3000, isClosable: true });
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
                <BreadcrumbLink as={ReactRouterLink} to={RECIPE_CATEGORY_LIST_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>{t("recipe_categories")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink color={colors.textPrimary} fontWeight="bold">{isEdit ? t("edit") : t("add")}</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </CardBody>
        </Card>

         <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={colors.bgCard}>
           <CardHeader bg={colors.bgCard} borderBottom="1px solid" borderColor={colors.borderSubtle} pb={6}>
             <Flex justify="space-between" align="center">
               <Box>
                 <Heading size="sm" color={colors.textPrimary} fontWeight="bold">{isEdit ? t("edit_recipe_category") : t("add_recipe_category")}</Heading>
                 <Text fontSize="sm" color={colors.textSecondary} mt={1}>{t("recipe_category_help")}</Text>
               </Box>
               <Button colorScheme="teal" as={ReactRouterLink} to={RECIPE_CATEGORY_LIST_PATH} variant="outline" size="sm" fontWeight="600">{t("list")}</Button>
             </Flex>
           </CardHeader>

           <CardBody p={8}>
             <form onSubmit={handleSubmit(onSubmit)}>
               <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                 <FormControl isRequired>
                   <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("name")}</FormLabel>
                   <Input {...register("name")} type="text" placeholder={t("name")} bg={colors.bgInput}
                     borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md"
                   />
                 </FormControl>
                 <FormControl>
                   <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("description")}</FormLabel>
                   <Textarea {...register("description")} placeholder={t("description")} bg={colors.bgInput}
                     borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md"
                   />
                 </FormControl>
                 <FormControl gridColumn={{ base: "auto", md: "span 2" }}>
                   <Controller
                     name="is_active"
                     control={control}
                     render={({ field }) => (
                       <Flex alignItems="center" gap={3}>
                         <Switch colorScheme="teal" isChecked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                         <Text fontSize="sm" fontWeight="semibold" color={colors.textPrimary}>{t("is_active")}</Text>
                       </Flex>
                     )}
                   />
                 </FormControl>
               </SimpleGrid>

                <Flex mt={8} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                  <Button type="button" as={ReactRouterLink} to={RECIPE_CATEGORY_LIST_PATH} colorScheme="teal" variant="outline" fontWeight="semibold" px={6} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "gray.50" }}>{t("cancel")}</Button>
                  <Button type="submit" isLoading={isSubmitting} loadingText={t("saving_data")} colorScheme="teal" bg="teal.500" color="white" fontWeight="semibold" px={8} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "teal.600" }} _active={{ bg: "teal.700" }} boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)">{t("save")}</Button>
                </Flex>
             </form>
           </CardBody>
         </Card>
      </Box>
    </Box>
  );
};

export default RecipeCategoryForm;
