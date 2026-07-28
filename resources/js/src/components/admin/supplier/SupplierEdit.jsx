import React, { useState, useEffect } from "react";
import {
  Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Card, CardBody,
  Text, useToast, Flex, Spinner,
  FormControl, FormLabel, Input, Textarea, Switch, Button, SimpleGrid,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link as ReactRouterLink, useNavigate, useParams } from "react-router-dom";
import api from "../../../axios";
import { UPDATE_SUPPLIER, LIST_SUPPLIER } from "../../../routes/apiRoutes";
import { DASHBOARD_PATH, SUPPLIER_LIST_PATH } from "../../../routes/superAdminRoutes";

export default function SupplierEdit() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      name: "", company: "", email: "", phone: "",
      address: "", city: "", country: "", notes: "", is_active: true,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        const res = await api.get(`${LIST_SUPPLIER}/${id}`);
        const s = res.data.data;
        reset({
          name: s.name || "",
          company: s.company || "",
          email: s.email || "",
          phone: s.phone || "",
          address: s.address || "",
          city: s.city || "",
          country: s.country || "",
          notes: s.notes || "",
          is_active: s.is_active,
        });
      } catch {
        toast({ title: t("error"), status: "error", duration: 3000, isClosable: true });
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, [id]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await api.put(UPDATE_SUPPLIER(id), data);
      toast({ title: res.data.message || t("supplier_updated"), status: "success", duration: 3000, isClosable: true });
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
              <BreadcrumbLink>{t("edit")}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          {isLoadingData ? (
            <Flex justify="center" py={12}><Spinner size="xl" color="brand.500" /></Flex>
          ) : (
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
          )}
        </CardBody>
      </Card>
    </Box>
  );
}
