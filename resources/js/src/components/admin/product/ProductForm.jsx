import {
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Checkbox,
    Collapse,
    Flex,
    FormControl,
    FormLabel,
    IconButton,
    Input,
    Select,
    SimpleGrid,
    Switch,
    Tag,
    Text,
    Textarea,
    useDisclosure,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { Controller, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import AddonModal from "../items/AddonModal";
import VariationModal from "../items/VariationModal";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

export default function ProductForm({
    register,
    control,
    handleSubmit,
    onSubmit,
    branches,
    categories,
    variations,
    addons,
    isSubmitting,
    submitLabel,
    cancelPath,
    LinkComponent,
}) {
    const { t } = useTranslation();
    const { formatAmount } = useCurrencyFormatter();
    const variationModal = useDisclosure();
    const addonModal = useDisclosure();
    const optionalDetails = useDisclosure();
    const customization = useDisclosure();

    const {
        fields: variationFields,
        append: variationAppend,
        remove: variationRemove,
    } = useFieldArray({ control, name: "variations" });

    const {
        fields: addonFields,
        append: addonAppend,
        remove: addonRemove,
    } = useFieldArray({ control, name: "addons" });

    return (
        <Box mx="auto">
            <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
                <Card mb={6}>
                    <CardHeader pb={2}>
                        <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
                            <Box>
                                <Text fontWeight="bold">{t("quick_product_info")}</Text>
                                <Text fontSize="sm" color="gray.500">{t("quick_product_info_help")}</Text>
                            </Box>
                            <FormControl display="flex" w="auto" alignItems="center">
                                <FormLabel mb="0">{t("is_active")}</FormLabel>
                                <Controller
                                    name="is_active"
                                    control={control}
                                    render={({ field }) => (
                                        <Switch
                                            colorScheme="teal"
                                            isChecked={Number(field.value) === 1}
                                            onChange={(event) => field.onChange(event.target.checked ? 1 : 0)}
                                        />
                                    )}
                                />
                            </FormControl>
                        </Flex>
                    </CardHeader>
                    <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <FormControl isRequired>
                                <FormLabel>{t("product_name")}</FormLabel>
                                <Input {...register("name")} placeholder="e.g. Chicken Burger" />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>{t("category")}</FormLabel>
                                <Select {...register("category_id")} placeholder={t("select_category")}>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>{t("branch")}</FormLabel>
                                <Select {...register("branch_id")} placeholder={t("select_branch")}>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>{t("sell_price")}</FormLabel>
                                <Input {...register("sell_price")} type="number" min="0" step="0.01" placeholder="0.00" />
                            </FormControl>

                            <FormControl>
                                <FormLabel>{t("product_cost")}</FormLabel>
                                <Input {...register("product_cost")} type="number" min="0" step="0.01" placeholder="0.00" />
                            </FormControl>

                            <FormControl>
                                <FormLabel>{t("main_image")}</FormLabel>
                                <Input type="file" {...register("main_image")} />
                            </FormControl>
                        </SimpleGrid>

                        <Flex mt={6} gap={3} flexWrap="wrap">
                            <Button variant="outline" size="sm" onClick={optionalDetails.onToggle}>
                                {optionalDetails.isOpen ? "Hide optional details" : "Optional details"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={customization.onToggle}>
                                {customization.isOpen ? "Hide variants/add-ons" : "Variants & add-ons"}
                            </Button>
                        </Flex>
                    </CardBody>
                </Card>

                <Collapse in={optionalDetails.isOpen} animateOpacity>
                <Card mb={6}>
                    <CardHeader fontWeight="bold">Optional Details</CardHeader>
                    <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <FormControl>
                                <FormLabel>{t("sku")}</FormLabel>
                                <Input {...register("sku")} placeholder="Auto-generated if empty" />
                            </FormControl>

                            <FormControl>
                                <FormLabel>{t("sequence_index")}</FormLabel>
                                <Input {...register("sequence_index")} type="number" placeholder="01" />
                            </FormControl>

                            <FormControl gridColumn={{ base: "auto", md: "span 2" }}>
                                <FormLabel>{t("description")}</FormLabel>
                                <Textarea {...register("description")} placeholder={t("enter_description")} />
                            </FormControl>
                        </SimpleGrid>

                        <Box mt={4}>
                            <FormLabel>{t("item_available_for")}</FormLabel>
                            <Flex gap={4} flexWrap="wrap">
                                <Checkbox {...register("item_available_for")} value="dine_in">{t("dine_in")}</Checkbox>
                                <Checkbox {...register("item_available_for")} value="pickup">{t("pickup")}</Checkbox>
                                <Checkbox {...register("item_available_for")} value="delivery">{t("delivery")}</Checkbox>
                            </Flex>
                        </Box>

                        <Flex gap={8} mt={4} flexWrap="wrap">
                            <Checkbox {...register("featured_item")} value={1}>{t("featured_item")}</Checkbox>
                        </Flex>
                    </CardBody>
                </Card>
                </Collapse>

                <Collapse in={customization.isOpen} animateOpacity>
                <Card mb={6}>
                    <CardHeader fontWeight="bold">{t("variations")}</CardHeader>
                    <CardBody>
                        <Flex gap={4} flexWrap="wrap">
                            {variationFields.map((field, index) => {
                                const selected = variations.find((variation) => Number(variation.id) === Number(field.variation_id));

                                return (
                                    <Box key={field.id} minW="200px" maxW="300px" flex="1">
                                        <Flex p={3} border="1px solid" borderColor="gray.200" rounded="md" direction="column" gap={2}>
                                            <Flex justify="space-between" align="center">
                                                <Box fontWeight="bold">{selected?.name || field.variation_name}</Box>
                                                <IconButton icon={<DeleteIcon />} colorScheme="red" size="sm" onClick={() => variationRemove(index)} />
                                            </Flex>
                                            {selected?.variation_items?.map((item) => (
                                                <Flex key={item.id} justify="space-between">
                                                    <Box>{item.name}</Box>
                                                    <Tag>{formatAmount(item.price)}</Tag>
                                                </Flex>
                                            ))}
                                        </Flex>
                                    </Box>
                                );
                            })}
                        </Flex>
                        <Button mt={4} leftIcon={<AddIcon />} colorScheme="teal" onClick={variationModal.onOpen}>
                            {t("add_variation")}
                        </Button>
                    </CardBody>
                </Card>

                <Card mb={6}>
                    <CardHeader fontWeight="bold">{t("addons")}</CardHeader>
                    <CardBody>
                        <Flex gap={4} flexWrap="wrap">
                            {addonFields.map((field, index) => {
                                const selected = addons.find((addon) => Number(addon.id) === Number(field.addon_id));

                                return (
                                    <Box key={field.id} minW="200px" maxW="300px" flex="1">
                                        <Flex p={3} border="1px solid" borderColor="gray.200" rounded="md" direction="column" gap={2}>
                                            <Flex justify="space-between" align="center">
                                                <Box fontWeight="bold">{selected?.name || field.addon_name}</Box>
                                                <IconButton icon={<DeleteIcon />} colorScheme="red" size="sm" onClick={() => addonRemove(index)} />
                                            </Flex>
                                            {selected?.price && <Tag>{formatAmount(selected.price)}</Tag>}
                                        </Flex>
                                    </Box>
                                );
                            })}
                        </Flex>
                        <Button mt={4} leftIcon={<AddIcon />} colorScheme="teal" onClick={addonModal.onOpen}>
                            {t("add_addon")}
                        </Button>
                    </CardBody>
                </Card>
                </Collapse>

                <VariationModal variationData={variations} variationModal={variationModal} onSubmit={(data) => variationAppend(data)} />
                <AddonModal addonData={addons} addonModal={addonModal} onSubmit={(data) => addonAppend(data)} />

                <Flex justify="flex-end" gap={3}>
                    <Button variant="outline" as={LinkComponent} to={cancelPath}>{t("cancel")}</Button>
                    <Button type="submit" isLoading={isSubmitting} loadingText="Saving Data..." colorScheme="teal">
                        {submitLabel}
                    </Button>
                </Flex>
            </form>
        </Box>
    );
}
