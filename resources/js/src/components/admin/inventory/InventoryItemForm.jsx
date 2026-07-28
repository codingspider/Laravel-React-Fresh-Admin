import {
  Box, Button, Card, CardBody, CardHeader, Flex,
  FormControl, FormLabel, Input, Select, SimpleGrid, Switch, Text,
  Textarea, useColorModeValue,
} from "@chakra-ui/react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

export default function InventoryItemForm({
  register, control, handleSubmit, onSubmit, branches, categories, suppliers, units,
  isSubmitting, submitLabel, cancelPath, LinkComponent,
}) {
  const { t } = useTranslation();
  const inputBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Box mx="auto">
      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        <Card mb={6}>
          <CardHeader pb={2}>
            <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
              <Box>
                <Text fontWeight="bold">{t("inventory_item_info")}</Text>
                <Text fontSize="sm" color="gray.500">{t("inventory_item_info_help")}</Text>
              </Box>
              <FormControl display="flex" w="auto" alignItems="center">
                <FormLabel mb="0">{t("is_active")}</FormLabel>
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
                <FormLabel>{t("name")}</FormLabel>
                <Input {...register("name")} placeholder={t("name")} bg={inputBg} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t("cost_price")}</FormLabel>
                <Input {...register("cost_price")} type="number" min="0" step="0.01" placeholder="0.00" bg={inputBg} />
              </FormControl>
              <FormControl>
                <FormLabel>{t("unit")}</FormLabel>
                <Select {...register("unit")} bg={inputBg} placeholder={t("select_unit")}>
                  {(Array.isArray(units) ? units : []).map((u) => (
                    <option key={u.id} value={u.short_name}>{u.actual_name} ({u.short_name})</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{t("quantity")}</FormLabel>
                <Input {...register("quantity")} type="number" min="0" step="0.01" placeholder="0" bg={inputBg} />
              </FormControl>
              <FormControl>
                <FormLabel>{t("reorder_level")}</FormLabel>
                <Input {...register("reorder_level")} type="number" min="0" step="0.01" placeholder="0" bg={inputBg} />
              </FormControl>
              <FormControl>
                <FormLabel>{t("category")}</FormLabel>
                <Select {...register("inventory_category_id")} placeholder={t("select_category")} bg={inputBg}>
                  {(Array.isArray(categories) ? categories : []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{t("supplier")}</FormLabel>
                <Select {...register("supplier_id")} placeholder={t("select_supplier")} bg={inputBg}>
                  {(Array.isArray(suppliers) ? suppliers : []).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}{s.company ? ` (${s.company})` : ""}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{t("branch")}</FormLabel>
                <Select {...register("branch_id")} placeholder={t("select_branch")} bg={inputBg}>
                  {(Array.isArray(branches) ? branches : []).map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{t("sku")}</FormLabel>
                <Input {...register("sku")} placeholder={t("sku")} bg={inputBg} />
              </FormControl>
              <FormControl>
                <FormLabel>{t("image")}</FormLabel>
                <Input type="file" {...register("image")} size="md" accept="image/*" />
              </FormControl>
              <FormControl gridColumn={{ base: "auto", md: "span 2" }}>
                <FormLabel>{t("description")}</FormLabel>
                <Textarea {...register("description")} placeholder={t("description")} bg={inputBg} />
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        <Flex justify="flex-end" gap={3} mt={4}>
          <Button variant="outline" as={LinkComponent} to={cancelPath}>{t("cancel")}</Button>
          <Button type="submit" isLoading={isSubmitting} loadingText={t("saving")} colorScheme="teal">
            {submitLabel}
          </Button>
        </Flex>
      </form>
    </Box>
  );
}
