import {
  Box, Button, Card, CardBody, CardHeader, Flex,
  FormControl, FormLabel, Input, Select, SimpleGrid, Text, Textarea,
  IconButton, useToast, Divider,
} from "@chakra-ui/react";
import { useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import useThemeColors from "../../../hooks/useThemeColors";

export default function PurchaseForm({
  register, control, handleSubmit, onSubmit,
  suppliers, branches, items, isSubmitting, submitLabel, cancelPath, LinkComponent,
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const lineTotal = (index) => {
    const qty = Number(control?._formValues?.items?.[index]?.quantity) || 0;
    const unitPrice = Number(control?._formValues?.items?.[index]?.unit_price) || 0;
    const taxRate = Number(control?._formValues?.items?.[index]?.tax_rate) || 0;
    const discount = Number(control?._formValues?.items?.[index]?.discount_percent) || 0;
    const subtotal = qty * unitPrice;
    const discAmt = (subtotal * discount) / 100;
    const taxAmt = ((subtotal - discAmt) * taxRate) / 100;
    return (subtotal - discAmt + taxAmt).toFixed(2);
  };

  return (
    <Box mx="auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card mb={6} bg={colors.bgCard}>
          <CardHeader pb={2}>
            <Box>
              <Text fontWeight="bold" color={colors.textPrimary}>{t("purchase_information")}</Text>
              <Text fontSize="sm" color={colors.textSecondary}>{t("purchase_information_help")}</Text>
            </Box>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("supplier")}</FormLabel>
                <Select {...register("supplier_id")} placeholder={t("select_supplier")} bg={colors.bgInput}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                >
                  {(Array.isArray(suppliers) ? suppliers : []).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}{s.company ? ` (${s.company})` : ""}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("branch")}</FormLabel>
                <Select {...register("branch_id")} placeholder={t("select_branch")} bg={colors.bgInput}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                >
                  {(Array.isArray(branches) ? branches : []).map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("reference_number")}</FormLabel>
                <Input {...register("reference_number")} placeholder={t("reference_number")} bg={colors.bgInput}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("invoice_number")}</FormLabel>
                <Input {...register("invoice_number")} placeholder={t("invoice_number")} bg={colors.bgInput}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("purchase_date")}</FormLabel>
                <Input {...register("purchase_date")} type="date" bg={colors.bgInput}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("expected_delivery_date")}</FormLabel>
                <Input {...register("expected_delivery_date")} type="date" bg={colors.bgInput}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("order_type")}</FormLabel>
                <Select {...register("order_type")} bg={colors.bgInput}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                >
                  <option value="purchase_order">{t("purchase_order")}</option>
                  <option value="direct_purchase">{t("direct_purchase")}</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("status")}</FormLabel>
                <Select {...register("status")} bg={colors.bgInput}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                >
                  <option value="active">{t("active")}</option>
                  <option value="inactive">{t("inactive")}</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("notes")}</FormLabel>
                <Textarea {...register("notes")} placeholder={t("notes")} bg={colors.bgInput}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                />
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        <Card mb={6} bg={colors.bgCard}>
          <CardHeader pb={2}>
            <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
              <Box>
                <Text fontWeight="bold" color={colors.textPrimary}>{t("purchase_items")}</Text>
                <Text fontSize="sm" color={colors.textSecondary}>{t("purchase_items_help")}</Text>
              </Box>
              <Button size="sm" colorScheme="teal" leftIcon={<AddIcon />} onClick={() => append({ inventory_item_id: "", quantity: "", unit_price: "", tax_rate: "0", discount_percent: "0", notes: "" })}>
                {t("add_item")}
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            {fields.length === 0 && (
              <Text fontSize="sm" color={colors.textMuted} textAlign="center" py={6}>{t("no_items_added")}</Text>
            )}
            {fields.map((field, index) => (
              <Flex key={field.id} gap={2} mb={3} alignItems="flex-start" flexWrap={{ base: "wrap", md: "nowrap" }}>
                <FormControl flex={{ base: "1 1 100%", md: "2" }}>
                  <Select {...register(`items.${index}.inventory_item_id`)} placeholder={t("select_item")} bg={colors.bgInput}
                    borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                  >
                    {(Array.isArray(items) ? items : []).map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl flex="1">
                  <Input {...register(`items.${index}.quantity`)} type="number" min="0" step="0.01" placeholder={t("quantity")} bg={colors.bgInput}
                    borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                  />
                </FormControl>
                <FormControl flex="1">
                  <Input {...register(`items.${index}.unit_price`)} type="number" min="0" step="0.01" placeholder={t("unit_price")} bg={colors.bgInput}
                    borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                  />
                </FormControl>
                <FormControl flex="1">
                  <Input {...register(`items.${index}.tax_rate`)} type="number" min="0" step="0.01" placeholder={t("tax_rate")} bg={colors.bgInput}
                    borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                  />
                </FormControl>
                <FormControl flex="1">
                  <Input {...register(`items.${index}.discount_percent`)} type="number" min="0" step="0.01" placeholder={t("discount")} bg={colors.bgInput}
                    borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                  />
                </FormControl>
                <FormControl flex="1" minW="90px">
                  <Input value={lineTotal(index)} readOnly bg={colors.bgSubtle} placeholder="0.00"
                    borderRadius="md" border="1px solid" borderColor={colors.borderSubtle}
                  />
                </FormControl>
                <IconButton size="sm" variant="ghost" colorScheme="red" icon={<DeleteIcon />} aria-label={t("remove")} onClick={() => remove(index)} />
              </Flex>
            ))}
          </CardBody>
        </Card>

        <Card mb={6} bg={colors.bgCard}>
          <CardBody>
             <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("tax_amount")}</FormLabel>
                <Input {...register("tax_amount")} type="number" min="0" step="0.01" placeholder="0.00" bg={colors.bgInput}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("discount_amount")}</FormLabel>
                <Input {...register("discount_amount")} type="number" min="0" step="0.01" placeholder="0.00" bg={colors.bgInput}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("shipping_cost")}</FormLabel>
                <Input {...register("shipping_cost")} type="number" min="0" step="0.01" placeholder="0.00" bg={colors.bgInput}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("paid_amount")}</FormLabel>
                <Input {...register("paid_amount")} type="number" min="0" step="0.01" placeholder="0.00" bg={colors.bgInput}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                />
              </FormControl>
            </SimpleGrid>
            <Divider my={5} />
            <Flex justify="flex-end" gap={4}>
              <Button variant="outline" as={LinkComponent} to={cancelPath}>{t("cancel")}</Button>
              <Button type="submit" isLoading={isSubmitting} loadingText={t("saving")} colorScheme="teal">{submitLabel}</Button>
            </Flex>
          </CardBody>
        </Card>
      </form>
    </Box>
  );
}
