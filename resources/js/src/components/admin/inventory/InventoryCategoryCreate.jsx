import React, { useState } from "react";
import {
  Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Card, CardBody,
  Text, useToast, Flex,
  FormControl, FormLabel, Input, Textarea, Switch, Button, SimpleGrid,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link as ReactRouterLink, useNavigate } from "react-router-dom";
import api from "../../../axios";
import { STORE_INVENTORY_CATEGORY } from "../../../routes/apiRoutes";
import { DASHBOARD_PATH, INVENTORY_CATEGORY_LIST_PATH } from "../../../routes/superAdminRoutes";

export default function InventoryCategoryCreate() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, control } = useForm({
    defaultValues: { name: "", description: "", sort_order: 0, is_active: true },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await api.post(STORE_INVENTORY_CATEGORY, data);
      toast({ title: res.data.message || t("inventory_category_created"), status: "success", duration: 3000, isClosable: true });
      navigate(INVENTORY_CATEGORY_LIST_PATH);
    } catch (err) {
      const msg = err?.response?.data?.message || t("error");
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
              <BreadcrumbLink as={ReactRouterLink} to={INVENTORY_CATEGORY_LIST_PATH}>{t("all_inventory_categories")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{t("add_inventory_category")}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>{t("name")}</FormLabel>
                <Input {...register("name")} placeholder={t("name")} />
              </FormControl>
              <FormControl>
                <FormLabel>{t("sort_order")}</FormLabel>
                <Input {...register("sort_order")} type="number" min="0" placeholder="0" />
              </FormControl>
              <FormControl gridColumn={{ base: "auto", md: "span 2" }}>
                <FormLabel>{t("description")}</FormLabel>
                <Textarea {...register("description")} placeholder={t("description")} />
              </FormControl>
              <FormControl>
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Flex alignItems="center" gap={3}>
                      <Switch colorScheme="teal" isChecked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                      <Text>{t("is_active")}</Text>
                    </Flex>
                  )}
                />
              </FormControl>
            </SimpleGrid>

            <Flex justify="flex-end" gap={3} mt={6}>
              <Button variant="outline" as={ReactRouterLink} to={INVENTORY_CATEGORY_LIST_PATH}>{t("cancel")}</Button>
              <Button type="submit" isLoading={isSubmitting} colorScheme="teal">{t("save")}</Button>
            </Flex>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
}
