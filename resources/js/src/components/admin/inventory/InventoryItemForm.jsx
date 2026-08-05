import {
  Box, Button, Card, CardBody, CardHeader, Flex,
  FormControl, FormLabel, Input, Select, SimpleGrid, Switch, Text,
  Textarea,
} from "@chakra-ui/react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useThemeColors from "../../../hooks/useThemeColors";

export default function InventoryItemForm({
  register, control, handleSubmit, onSubmit, branches, categories, suppliers, units,
  isSubmitting, submitLabel, cancelPath, LinkComponent,
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const inputBg = colors.bgInput;

  return (
    <Box mx="auto">
      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        <Card mb={6} bg={colors.bgCard}>
          <CardHeader pb={2}>
            <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
              <Box>
                <Text fontWeight="bold" color={colors.textPrimary}>{t("inventory_item_info")}</Text>
                <Text fontSize="sm" color={colors.textSecondary}>{t("inventory_item_info_help")}</Text>
              </Box>
              <FormControl display="flex" w="auto" alignItems="center">
                <FormLabel mb="0" fontSize="sm" fontWeight="semibold" color={colors.textPrimary}>{t("is_active")}</FormLabel>
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      colorScheme="teal"
                      isChecked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              </FormControl>
            </Flex>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("name")}</FormLabel>
                <Input {...register("name")} placeholder={t("name")} bg={inputBg}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("cost_price")}</FormLabel>
                <Input {...register("cost_price")} type="number" min="0" step="0.01" placeholder="0.00" bg={inputBg}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("unit")}</FormLabel>
                <Select {...register("unit")} bg={inputBg} placeholder={t("select_unit")}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                >
                  {(Array.isArray(units) ? units : []).map((u) => (
                    <option key={u.id} value={u.short_name}>{u.actual_name} ({u.short_name})</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("quantity")}</FormLabel>
                <Input {...register("quantity")} type="number" min="0" step="0.01" placeholder="0" bg={inputBg}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("reorder_level")}</FormLabel>
                <Input {...register("reorder_level")} type="number" min="0" step="0.01" placeholder="0" bg={inputBg}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("minimum_stock")}</FormLabel>
                <Input {...register("minimum_stock")} type="number" min="0" step="0.01" placeholder="0" bg={inputBg}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("opening_stock")}</FormLabel>
                <Input {...register("opening_stock")} type="number" min="0" step="0.01" placeholder="0" bg={inputBg}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("maximum_stock")}</FormLabel>
                <Input {...register("maximum_stock")} type="number" min="0" step="0.01" placeholder="0" bg={inputBg}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("category")}</FormLabel>
                <Select {...register("inventory_category_id")} placeholder={t("select_category")} bg={inputBg}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                >
                  {(Array.isArray(categories) ? categories : []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("supplier")}</FormLabel>
                <Select {...register("supplier_id")} placeholder={t("select_supplier")} bg={inputBg}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                >
                  {(Array.isArray(suppliers) ? suppliers : []).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}{s.company ? ` (${s.company})` : ""}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("branch")}</FormLabel>
                <Select {...register("branch_id")} placeholder={t("select_branch")} bg={inputBg}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                >
                  {(Array.isArray(branches) ? branches : []).map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("sku")}</FormLabel>
                <Input {...register("sku")} placeholder={t("sku")} bg={inputBg}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} size="md"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("image")}</FormLabel>
                <Input type="file" {...register("image")} size="md" accept="image/*"
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                />
              </FormControl>
              <FormControl gridColumn={{ base: "auto", md: "span 2" }}>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("description")}</FormLabel>
                <Textarea {...register("description")} placeholder={t("description")} bg={inputBg}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                />
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        <Flex justify="flex-end" gap={3} mt={4}>
          <Button type="button" as={LinkComponent} to={cancelPath} colorScheme="gray" variant="outline" fontWeight="semibold" px={6} h={12} borderRadius="md" _hover={{ bg: "gray.50" }}>{t("cancel")}</Button>
          <Button type="submit" isLoading={isSubmitting} loadingText={t("saving_data")} colorScheme="teal" bg="teal.500" color="white" fontWeight="semibold" px={8} h={12} borderRadius="md" _hover={{ bg: "teal.600" }} _active={{ bg: "teal.700" }} boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)">{submitLabel}</Button>
        </Flex>
      </form>
    </Box>
  );
}
