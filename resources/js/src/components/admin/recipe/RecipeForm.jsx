import {
  Box, Button, Card, CardBody, CardHeader, Flex,
  FormControl, FormLabel, Input, Select, SimpleGrid, Switch, Text,
  Textarea, IconButton, useToast, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, VStack,
} from "@chakra-ui/react";
import { Controller, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AddIcon, DeleteIcon, ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import useThemeColors from "../../../hooks/useThemeColors";

export default function RecipeForm({
  register, control, handleSubmit, onSubmit,
  options, isSubmitting, submitLabel, cancelPath, LinkComponent,
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { fields, append, remove, swap } = useFieldArray({ control, name: "ingredients" });

  const inventoryItems = options?.inventory_items || [];
  const units = options?.units || [];
  const categories = options?.categories || [];

  const renderUnit = (u) => u.short_name || u.actual_name || "";

  return (
    <Box mx="auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card mb={6}>
          <CardHeader pb={2}>
            <Box>
                <Text fontWeight="bold" color={colors.textPrimary}>{t("recipe_information")}</Text>
              <Text fontSize="sm" color={colors.textSecondary}>{t("recipe_information_help")}</Text>
            </Box>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
               <FormControl isRequired>
                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("name")}</FormLabel>
                 <Input {...register("name")} placeholder={t("recipe_name")} bg={colors.bgInput}
                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                 />
               </FormControl>
               <FormControl>
                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("category")}</FormLabel>
                 <Select {...register("category_id")} placeholder={t("select_category")} bg={colors.bgInput}
                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                 >
                   {(Array.isArray(categories) ? categories : []).map((c) => (
                     <option key={c.id} value={c.id}>{c.name}</option>
                   ))}
                 </Select>
               </FormControl>
               <FormControl>
                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("selling_price")}</FormLabel>
                 <Input {...register("selling_price")} type="number" min="0" step="0.01" placeholder="0.00" bg={colors.bgInput}
                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                 />
               </FormControl>
               <FormControl>
                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("yield_quantity")}</FormLabel>
                 <Input {...register("yield_quantity")} type="number" min="0" step="0.01" placeholder="1" bg={colors.bgInput}
                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                 />
               </FormControl>
               <FormControl>
                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("yield_unit")}</FormLabel>
                 <Select {...register("yield_unit_id")} placeholder={t("select_unit")} bg={colors.bgInput}
                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                 >
                   {(Array.isArray(units) ? units : []).map((u) => (
                     <option key={u.id} value={u.id}>{renderUnit(u)}</option>
                   ))}
                 </Select>
               </FormControl>
               <FormControl>
                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("auto_deduct_stock")}</FormLabel>
                 <Select {...register("auto_deduct_stock")} bg={colors.bgInput}
                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                 >
                   <option value="yes">{t("yes")}</option>
                   <option value="no">{t("no")}</option>
                 </Select>
               </FormControl>
               <FormControl>
                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("preparation_time")} ({t("minutes")})</FormLabel>
                 <Input {...register("preparation_time")} type="number" min="0" placeholder="0" bg={colors.bgInput}
                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                 />
               </FormControl>
               <FormControl>
                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("cooking_time")} ({t("minutes")})</FormLabel>
                 <Input {...register("cooking_time")} type="number" min="0" placeholder="0" bg={colors.bgInput}
                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                 />
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
               <FormControl gridColumn={{ base: "auto", md: "span 2" }}>
                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("description")}</FormLabel>
                 <Textarea {...register("description")} placeholder={t("description")} bg={colors.bgInput}
                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                 />
               </FormControl>
             </SimpleGrid>
           </CardBody>
         </Card>

        <Card mb={6}>
          <CardHeader pb={2}>
            <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
              <Box>
                <Text fontWeight="bold" color={colors.textPrimary}>{t("ingredients")}</Text>
                <Text fontSize="sm" color={colors.textSecondary}>{t("ingredients_help")}</Text>
              </Box>
              <Button
                size="sm"
                colorScheme="teal"
                leftIcon={<AddIcon />}
                onClick={() => append({ inventory_item_id: "", quantity: "", unit_id: "", unit_cost: "", is_optional: false, notes: "" })}
              >
                {t("add_ingredient")}
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            {fields.length === 0 && (
              <Text fontSize="sm" color={colors.textMuted} textAlign="center" py={6}>
                {t("no_ingredients_added")}
              </Text>
            )}
            {fields.map((field, index) => {
              const selectedItem = inventoryItems.find((i) => Number(i.id) === Number(field.inventory_item_id));
              return (
                 <Flex key={field.id} gap={3} mb={3} alignItems="flex-start" flexWrap={{ base: "wrap", md: "nowrap" }}>
                  <VStack spacing={0.5}>
                    <IconButton
                      size="xs"
                      variant="ghost"
                      icon={<ChevronUpIcon />}
                      aria-label={t("move_up")}
                      isDisabled={index === 0}
                      onClick={() => swap(index, index - 1)}
                    />
                    <IconButton
                      size="xs"
                      variant="ghost"
                      icon={<ChevronDownIcon />}
                      aria-label={t("move_down")}
                      isDisabled={index === fields.length - 1}
                      onClick={() => swap(index, index + 1)}
                    />
                  </VStack>
                  <FormControl>
                    <Select
                      {...register(`ingredients.${index}.inventory_item_id`)}
                      placeholder={t("item")}
                      bg={colors.bgInput}
                      borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500"
                      _hover={{ borderColor: "gray.300" }}
                    >
                      {(Array.isArray(inventoryItems) ? inventoryItems : []).map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <Controller
                      name={`ingredients.${index}.quantity`}
                      control={control}
                      render={({ field: f }) => (
                        <NumberInput size="md" min={0} value={f.value ?? ""} onChange={f.onChange}>
                          <NumberInputField placeholder={t("quantity")} bg={colors.bgInput}
                            borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      )}
                    />
                  </FormControl>
                  <FormControl>
                    <Select {...register(`ingredients.${index}.unit_id`)} placeholder={t("unit")} bg={colors.bgInput}
                      borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                    >
                      {(Array.isArray(units) ? units : []).map((u) => (
                        <option key={u.id} value={u.id}>{renderUnit(u)}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <Controller
                      name={`ingredients.${index}.unit_cost`}
                      control={control}
                      render={({ field: f }) => (
                        <NumberInput size="md" min={0} step={0.01} value={selectedItem?.unit_cost ?? f.value ?? ""} onChange={f.onChange}>
                          <NumberInputField placeholder={t("unit_cost")} bg={colors.bgInput}
                            borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      )}
                    />
                  </FormControl>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    icon={<DeleteIcon />}
                    aria-label={t("remove")}
                    onClick={() => remove(index)}
                  />
                </Flex>
              );
            })}
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
