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
import { STORE_SUPPLIER } from "../../../routes/apiRoutes";
import { DASHBOARD_PATH, SUPPLIER_LIST_PATH } from "../../../routes/superAdminRoutes";

export default function SupplierCreate() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      name: "", company: "", email: "", phone: "",
      address: "", city: "", country: "", notes: "", is_active: true,
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await api.post(STORE_SUPPLIER, data);
      toast({ title: res.data.message || t("supplier_created"), status: "success", duration: 3000, isClosable: true });
      navigate(SUPPLIER_LIST_PATH);
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
              <BreadcrumbLink as={ReactRouterLink} to={SUPPLIER_LIST_PATH}>{t("all_suppliers")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{t("add_supplier")}</BreadcrumbLink>
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
                <FormLabel>{t("company")}</FormLabel>
                <Input {...register("company")} placeholder={t("company")} />
              </FormControl>
              <FormControl>
                <FormLabel>{t("email")}</FormLabel>
                <Input {...register("email")} type="email" placeholder={t("email")} />
              </FormControl>
              <FormControl>
                <FormLabel>{t("phone")}</FormLabel>
                <Input {...register("phone")} placeholder={t("phone")} />
              </FormControl>
              <FormControl>
                <FormLabel>{t("city")}</FormLabel>
                <Input {...register("city")} placeholder={t("city")} />
              </FormControl>
              <FormControl>
                <FormLabel>{t("country")}</FormLabel>
                <Input {...register("country")} placeholder={t("country")} />
              </FormControl>
              <FormControl gridColumn={{ base: "auto", md: "span 2" }}>
                <FormLabel>{t("address")}</FormLabel>
                <Textarea {...register("address")} placeholder={t("address")} />
              </FormControl>
              <FormControl gridColumn={{ base: "auto", md: "span 2" }}>
                <FormLabel>{t("notes")}</FormLabel>
                <Textarea {...register("notes")} placeholder={t("notes")} />
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
              <Button variant="outline" as={ReactRouterLink} to={SUPPLIER_LIST_PATH}>{t("cancel")}</Button>
              <Button type="submit" isLoading={isSubmitting} colorScheme="teal">{t("save")}</Button>
            </Flex>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
}
