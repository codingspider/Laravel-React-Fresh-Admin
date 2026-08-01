import React, { useState, useEffect } from "react";
import {
  Box, Card, CardHeader, CardBody, useToast, Flex,
  FormControl, FormLabel, Input, Textarea, Switch, Button, SimpleGrid, Text,
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, Heading,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link as ReactRouterLink, useNavigate, useParams } from "react-router-dom";
import api from "../../../axios";
import { UPDATE_CUSTOMER, LIST_CUSTOMER } from "../../../routes/apiRoutes";
import { DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";

const LIST_PATH = "/inventory/customers";

export default function CustomerEdit() {
  const colors = useThemeColors();
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
        const res = await api.get(`${LIST_CUSTOMER}/${id}`);
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
      const res = await api.put(UPDATE_CUSTOMER(id), data);
      toast({ title: res.data.message || t("customer_updated"), status: "success", duration: 3000, isClosable: true });
      navigate(LIST_PATH);
    } catch (err) {
      const msg = err?.response?.data?.message || t("error");
      toast({ title: t("error"), description: msg, status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box py={3}>
      <Box mx="auto">
        {/* Breadcrumb */}
        <Card mb={4} bg={colors.bgCard} shadow="sm" borderRadius="lg" border="none">
          <CardBody py={3}>
            <Breadcrumb fontSize="sm" color={colors.textSecondary}>
              <BreadcrumbItem>
                <BreadcrumbLink as={ReactRouterLink} to={DASHBOARD_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>
                  {t("dashboard")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink as={ReactRouterLink} to={LIST_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>
                  {t("list")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink color={colors.textPrimary} fontWeight="bold">
                  {t("edit")}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </CardBody>
        </Card>

        {/* Main Form Card */}
        <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={colors.bgCard}>
          <CardHeader bg={colors.bgCard} borderBottom="1px solid" borderColor={colors.borderSubtle} pb={6}>
            <Flex justify="space-between" align="center">
              <Box>
                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">{t("edit")}</Heading>
                <Text fontSize="sm" color={colors.textSecondary} mt={1}>{t("update_customer_details")}</Text>
              </Box>
              <Button colorScheme="teal" as={ReactRouterLink} to={LIST_PATH} variant="outline" display={{ base: "none", md: "inline-flex" }} size="sm" fontWeight="600">
                {t("list")}
              </Button>
            </Flex>
          </CardHeader>
          <CardBody p={8}>
            {isLoadingData ? (
              <Flex justify="center" align="center" h="40">
                <Text color={colors.textSecondary}>{t("loading_data")}</Text>
              </Flex>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                      {t("name")}
                    </FormLabel>
                    <Input
                      {...register("name")}
                      placeholder={t("name")}
                      bg={colors.bgInput}
                      border="1px solid"
                      borderColor={colors.borderInput}
                      borderRadius="md"
                      focusBorderColor="teal.500"
                      _hover={{ borderColor: "gray.300" }}
                      size="md"
                      transition="all 0.2s"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                      {t("company")}
                    </FormLabel>
                    <Input
                      {...register("company")}
                      placeholder={t("company")}
                      bg={colors.bgInput}
                      border="1px solid"
                      borderColor={colors.borderInput}
                      borderRadius="md"
                      focusBorderColor="teal.500"
                      _hover={{ borderColor: "gray.300" }}
                      size="md"
                      transition="all 0.2s"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                      {t("email")}
                    </FormLabel>
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder={t("email")}
                      bg={colors.bgInput}
                      border="1px solid"
                      borderColor={colors.borderInput}
                      borderRadius="md"
                      focusBorderColor="teal.500"
                      _hover={{ borderColor: "gray.300" }}
                      size="md"
                      transition="all 0.2s"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                      {t("phone")}
                    </FormLabel>
                    <Input
                      {...register("phone")}
                      placeholder={t("phone")}
                      bg={colors.bgInput}
                      border="1px solid"
                      borderColor={colors.borderInput}
                      borderRadius="md"
                      focusBorderColor="teal.500"
                      _hover={{ borderColor: "gray.300" }}
                      size="md"
                      transition="all 0.2s"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                      {t("city")}
                    </FormLabel>
                    <Input
                      {...register("city")}
                      placeholder={t("city")}
                      bg={colors.bgInput}
                      border="1px solid"
                      borderColor={colors.borderInput}
                      borderRadius="md"
                      focusBorderColor="teal.500"
                      _hover={{ borderColor: "gray.300" }}
                      size="md"
                      transition="all 0.2s"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                      {t("country")}
                    </FormLabel>
                    <Input
                      {...register("country")}
                      placeholder={t("country")}
                      bg={colors.bgInput}
                      border="1px solid"
                      borderColor={colors.borderInput}
                      borderRadius="md"
                      focusBorderColor="teal.500"
                      _hover={{ borderColor: "gray.300" }}
                      size="md"
                      transition="all 0.2s"
                    />
                  </FormControl>

                  <FormControl gridColumn={{ base: "auto", md: "span 2" }}>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                      {t("address")}
                    </FormLabel>
                    <Textarea
                      {...register("address")}
                      placeholder={t("address")}
                      bg={colors.bgInput}
                      border="1px solid"
                      borderColor={colors.borderInput}
                      borderRadius="md"
                      focusBorderColor="teal.500"
                      _hover={{ borderColor: "gray.300" }}
                      size="md"
                      transition="all 0.2s"
                    />
                  </FormControl>

                  <FormControl gridColumn={{ base: "auto", md: "span 2" }}>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                      {t("notes")}
                    </FormLabel>
                    <Textarea
                      {...register("notes")}
                      placeholder={t("notes")}
                      bg={colors.bgInput}
                      border="1px solid"
                      borderColor={colors.borderInput}
                      borderRadius="md"
                      focusBorderColor="teal.500"
                      _hover={{ borderColor: "gray.300" }}
                      size="md"
                      transition="all 0.2s"
                    />
                  </FormControl>

                  <FormControl>
                    <Controller
                      name="is_active"
                      control={control}
                      render={({ field }) => (
                        <Flex alignItems="center" gap={3}>
                          <Switch colorScheme="teal" isChecked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                          <Text color={colors.textPrimary}>{t("is_active")}</Text>
                        </Flex>
                      )}
                    />
                  </FormControl>
                </SimpleGrid>

                <Flex mt={10} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                  <Button type="button" as={ReactRouterLink} to={LIST_PATH} colorScheme="gray" variant="outline" fontWeight="semibold" px={6} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "gray.50" }}>
                    {t("cancel")}
                  </Button>
                  <Button type="submit" isLoading={isSubmitting} loadingText={t("saving_data")} colorScheme="teal" bg="teal.500" color="white" fontWeight="semibold" px={8} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "teal.600" }} _active={{ bg: "teal.700" }} boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)">
                    {t("save")}
                  </Button>
                </Flex>
              </form>
            )}
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}
