import React, { useMemo } from "react";
import {
  Box, Button, Card, CardBody, CardHeader, Flex,
  FormControl, FormLabel, Input, Select, SimpleGrid, Text, Textarea,
  IconButton, Divider, HStack,
} from "@chakra-ui/react";
import { useFieldArray, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import useThemeColors from "../../../hooks/useThemeColors";

export default function PurchaseForm({
  register, control, handleSubmit, onSubmit,
  suppliers, branches, items, paymentMethods = [], isSubmitting, submitLabel, cancelPath, LinkComponent,
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedItems = useWatch({ control, name: "items", defaultValue: [] });
  const watchedShipping = useWatch({ control, name: "shipping_cost", defaultValue: "0" });
  const watchedPaid = useWatch({ control, name: "paid_amount", defaultValue: "0" });

  const calculations = useMemo(() => {
    const items = Array.isArray(watchedItems) ? watchedItems : [];
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    const lineTotals = items.map((item) => {
      const qty = Number(item?.quantity) || 0;
      const unitPrice = Number(item?.unit_price) || 0;
      const taxRate = Number(item?.tax_rate) || 0;
      const discount = Number(item?.discount_percent) || 0;

      const lineSubtotal = qty * unitPrice;
      const discAmt = (lineSubtotal * discount) / 100;
      const afterDiscount = lineSubtotal - discAmt;
      const taxAmt = (afterDiscount * taxRate) / 100;
      const lineTotal = afterDiscount + taxAmt;

      subtotal += lineSubtotal;
      totalTax += taxAmt;
      totalDiscount += discAmt;

      return lineTotal.toFixed(2);
    });

    const shipping = Number(watchedShipping) || 0;
    const paid = Number(watchedPaid) || 0;
    const grandTotal = subtotal - totalDiscount + totalTax + shipping;
    const balanceDue = grandTotal - paid;

    return {
      lineTotals,
      subtotal: subtotal.toFixed(2),
      totalTax: totalTax.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      shipping: shipping.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      balanceDue: balanceDue.toFixed(2),
    };
  }, [watchedItems, watchedShipping, watchedPaid]);

  const inputStyle = {
    bg: colors.bgInput,
    borderRadius: "md",
    border: "1px solid",
    borderColor: colors.borderInput,
    focusBorderColor: "teal.500",
    _hover: { borderColor: "gray.300" },
  };

  const readOnlyStyle = {
    bg: colors.bgSubtle,
    borderRadius: "md",
    border: "1px solid",
    borderColor: colors.borderSubtle,
  };

  const labelProps = { fontSize: "sm", fontWeight: "semibold", color: colors.textPrimary, mb: 1 };

  return (
    <Box mx="auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ── Purchase Information ── */}
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
                <FormLabel {...labelProps}>{t("supplier")}</FormLabel>
                <Select {...register("supplier_id")} placeholder={t("select_supplier")} {...inputStyle}>
                  {(Array.isArray(suppliers) ? suppliers : []).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}{s.company ? ` (${s.company})` : ""}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel {...labelProps}>{t("branch")}</FormLabel>
                <Select {...register("branch_id")} placeholder={t("select_branch")} {...inputStyle}>
                  {(Array.isArray(branches) ? branches : []).map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel {...labelProps}>{t("reference_number")}</FormLabel>
                <Input {...register("reference_number")} placeholder={t("reference_number")} {...inputStyle} />
              </FormControl>
              <FormControl>
                <FormLabel {...labelProps}>{t("invoice_number")}</FormLabel>
                <Input {...register("invoice_number")} placeholder={t("invoice_number")} {...inputStyle} />
              </FormControl>
              <FormControl>
                <FormLabel {...labelProps}>{t("purchase_date")}</FormLabel>
                <Input {...register("purchase_date")} type="date" {...inputStyle} />
              </FormControl>
              <FormControl>
                <FormLabel {...labelProps}>{t("expected_delivery_date")}</FormLabel>
                <Input {...register("expected_delivery_date")} type="date" {...inputStyle} />
              </FormControl>
              <FormControl>
                <FormLabel {...labelProps}>{t("order_type")}</FormLabel>
                <Select {...register("order_type")} {...inputStyle}>
                  <option value="purchase_order">{t("purchase_order")}</option>
                  <option value="direct_purchase">{t("direct_purchase")}</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel {...labelProps}>{t("status")}</FormLabel>
                <Select {...register("status")} {...inputStyle}>
                  <option value="active">{t("active")}</option>
                  <option value="inactive">{t("inactive")}</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel {...labelProps}>{t("notes")}</FormLabel>
                <Textarea {...register("notes")} placeholder={t("notes")} {...inputStyle} />
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* ── Purchase Items ── */}
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
              <Box key={field.id} mb={4} p={4} borderRadius="md" border="1px solid" borderColor={colors.borderSubtle}>
                <Flex gap={3} alignItems="flex-end" flexWrap={{ base: "wrap", md: "nowrap" }}>
                  <FormControl flex={{ base: "1 1 100%", md: "3" }}>
                    <FormLabel {...labelProps}>{t("item")}</FormLabel>
                    <Select {...register(`items.${index}.inventory_item_id`)} placeholder={t("select_item")} {...inputStyle}>
                      {(Array.isArray(items) ? items : []).map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl flex="1">
                    <FormLabel {...labelProps}>{t("quantity")}</FormLabel>
                    <Input {...register(`items.${index}.quantity`)} type="number" min="0" step="0.01" placeholder="0" {...inputStyle} />
                  </FormControl>
                  <FormControl flex="1">
                    <FormLabel {...labelProps}>{t("unit_price")}</FormLabel>
                    <Input {...register(`items.${index}.unit_price`)} type="number" min="0" step="0.01" placeholder="0.00" {...inputStyle} />
                  </FormControl>
                  <FormControl flex="1">
                    <FormLabel {...labelProps}>{t("tax_rate")}</FormLabel>
                    <Input {...register(`items.${index}.tax_rate`)} type="number" min="0" max="100" step="0.01" placeholder="0%" {...inputStyle} />
                  </FormControl>
                  <FormControl flex="1">
                    <FormLabel {...labelProps}>{t("discount")}</FormLabel>
                    <Input {...register(`items.${index}.discount_percent`)} type="number" min="0" max="100" step="0.01" placeholder="0%" {...inputStyle} />
                  </FormControl>
                  <FormControl flex="1" minW="100px">
                    <FormLabel {...labelProps}>{t("line_total")}</FormLabel>
                    <Input value={calculations.lineTotals[index] || "0.00"} readOnly {...readOnlyStyle} />
                  </FormControl>
                  <IconButton size="sm" variant="ghost" colorScheme="red" icon={<DeleteIcon />} aria-label={t("remove")} onClick={() => remove(index)} mb={1} />
                </Flex>
              </Box>
            ))}
          </CardBody>
        </Card>

        {/* ── Totals & Summary ── */}
        <Card mb={6} bg={colors.bgCard}>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* Left: Additional charges */}
              <Box>
                <Text fontWeight="bold" color={colors.textPrimary} mb={3}>{t("additional_charges")}</Text>
                <SimpleGrid columns={2} spacing={3}>
                  <FormControl>
                    <FormLabel {...labelProps}>{t("shipping_cost")}</FormLabel>
                    <Input {...register("shipping_cost")} type="number" min="0" step="0.01" placeholder="0.00" {...inputStyle} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel {...labelProps}>{t("paid_amount")}</FormLabel>
                    <Input {...register("paid_amount")} type="number" min="0" step="0.01" placeholder="0.00" {...inputStyle} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel {...labelProps}>{t("payment_method")}</FormLabel>
                    <Select {...register("payment_method", { required: true })} {...inputStyle}>
                      {(Array.isArray(paymentMethods) ? paymentMethods : []).map((pm) => (
                        <option key={pm.value} value={pm.value}>{t(pm.label)}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </Box>

              {/* Right: Calculated summary */}
              <Box p={4} borderRadius="md" bg={colors.bgSubtle} border="1px solid" borderColor={colors.borderSubtle}>
                <Text fontWeight="bold" color={colors.textPrimary} mb={3}>{t("order_summary")}</Text>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color={colors.textSecondary}>{t("subtotal")}</Text>
                  <Text fontSize="sm" fontWeight="semibold" color={colors.textPrimary}>{calculations.subtotal}</Text>
                </Flex>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color={colors.textSecondary}>{t("discount")}</Text>
                  <Text fontSize="sm" fontWeight="semibold" color="red.500">-{calculations.totalDiscount}</Text>
                </Flex>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color={colors.textSecondary}>{t("tax")}</Text>
                  <Text fontSize="sm" fontWeight="semibold" color={colors.textPrimary}>{calculations.totalTax}</Text>
                </Flex>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color={colors.textSecondary}>{t("shipping")}</Text>
                  <Text fontSize="sm" fontWeight="semibold" color={colors.textPrimary}>{calculations.shipping}</Text>
                </Flex>
                <Divider my={2} />
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="bold" color={colors.textPrimary}>{t("grand_total")}</Text>
                  <Text fontSize="sm" fontWeight="bold" color="teal.500">{calculations.grandTotal}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontSize="sm" fontWeight="bold" color={colors.textPrimary}>{t("balance_due")}</Text>
                  <Text fontSize="sm" fontWeight="bold" color={Number(calculations.balanceDue) > 0 ? "orange.500" : "green.500"}>
                    {calculations.balanceDue}
                  </Text>
                </Flex>
              </Box>
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
