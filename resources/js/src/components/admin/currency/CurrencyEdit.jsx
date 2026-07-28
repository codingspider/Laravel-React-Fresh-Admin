import React, { useState, useEffect } from "react";
import {
  Box, Card, CardBody, useToast, Flex, Spinner,
  FormControl, FormLabel, Input, Select, Switch, Button, SimpleGrid, Text,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link as ReactRouterLink, useNavigate, useParams } from "react-router-dom";
import api from "../../../axios";
import PageHeader from "../../ui/PageHeader";
import { UPDATE_CURRENCY, LIST_CURRENCY } from "../../../routes/apiRoutes";
import { DASHBOARD_PATH, CURRENCY_LIST_PATH } from "../../../routes/superAdminRoutes";

export default function CurrencyEdit() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      name: "",
      code: "",
      symbol: "",
      symbol_first: true,
      decimal_mark: ".",
      thousands_separator: ",",
      precision: 2,
      is_active: true,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        const res = await api.get(`${LIST_CURRENCY}/${id}`);
        const c = res.data.data;
        reset({
          name: c.name || "",
          code: c.code || "",
          symbol: c.symbol || "",
          symbol_first: c.symbol_first,
          decimal_mark: c.decimal_mark || ".",
          thousands_separator: c.thousands_separator || ",",
          precision: c.precision ?? 2,
          is_active: c.is_active,
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
      const res = await api.put(UPDATE_CURRENCY(id), data);
      toast({ title: res.data.message || t("currency_updated"), status: "success", duration: 3000, isClosable: true });
      navigate(CURRENCY_LIST_PATH);
    } catch (err) {
      const msg = err?.response?.data?.message || t("error");
      toast({ title: t("error"), description: msg, status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="edit_currency"
        breadcrumbs={[
          { label: t("dashboard"), path: DASHBOARD_PATH },
          { label: t("all_currencies"), path: CURRENCY_LIST_PATH },
          { label: t("edit"), isCurrent: true },
        ]}
      />

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

                <FormControl isRequired>
                  <FormLabel>{t("code")}</FormLabel>
                  <Input {...register("code")} placeholder="USD" textTransform="uppercase" />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>{t("symbol")}</FormLabel>
                  <Input {...register("symbol")} placeholder="$" />
                </FormControl>

                <FormControl>
                  <FormLabel>{t("symbol_position")}</FormLabel>
                  <Controller
                    name="symbol_first"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ? "before" : "after"}
                        onChange={(e) => field.onChange(e.target.value === "before")}
                      >
                        <option value="before">{t("before")}</option>
                        <option value="after">{t("after")}</option>
                      </Select>
                    )}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>{t("decimal_mark")}</FormLabel>
                  <Select {...register("decimal_mark")}>
                    <option value=".">. {t("dot")}</option>
                    <option value=",">, {t("comma")}</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>{t("thousands_separator")}</FormLabel>
                  <Select {...register("thousands_separator")}>
                    <option value=",">, {t("comma")}</option>
                    <option value=".">. {t("dot")}</option>
                    <option value=" ">  {t("space")}</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>{t("precision")}</FormLabel>
                  <Select {...register("precision")}>
                    {[0, 1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </Select>
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
                <Button variant="outline" as={ReactRouterLink} to={CURRENCY_LIST_PATH}>{t("cancel")}</Button>
                <Button type="submit" isLoading={isSubmitting} colorScheme="teal">{t("save")}</Button>
              </Flex>
            </form>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}
