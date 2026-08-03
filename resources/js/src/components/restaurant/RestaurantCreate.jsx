import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Button, Card, CardHeader, CardBody, Heading, SimpleGrid,
    FormControl, FormLabel, Input, Select, Breadcrumb, BreadcrumbItem,
    BreadcrumbLink, useToast, Flex, Text, Switch, HStack,
    Checkbox, Divider,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../axios";
import useThemeColors from "../../hooks/useThemeColors";

const RestaurantCreate = () => {
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: { currency: "USD", currency_symbol: "$" },
    });
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currencies, setCurrencies] = useState([]);
    const [createOwner, setCreateOwner] = useState(false);
    const [ownerName, setOwnerName] = useState("");
    const [ownerEmail, setOwnerEmail] = useState("");
    const [ownerPassword, setOwnerPassword] = useState("");
    const [ownerErrors, setOwnerErrors] = useState({});
    const toast = useToast();
    const navigate = useNavigate();
    const colors = useThemeColors();
    const selectedCurrency = watch("currency");
    const dividerBg = colors.borderInput;
    const pageBg = colors.bgPage;
    const cardBg = colors.bgCard;
    const borderColor = colors.borderDefault;
    const headerBorderColor = colors.borderSubtle;
    const headingColor = colors.textPrimary;
    const textColor = colors.textSecondary;
    const labelColor = colors.textLabel;
    const fieldBg = colors.bgSubtle;
    const fieldHoverBorder = colors.borderInput;

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Create Restaurant`;
        api.get("/v1/currencies/all-active").then((res) => {
            setCurrencies(res.data?.data || []);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        const found = currencies.find((c) => c.code === selectedCurrency);
        if (found) {
            setValue("currency_symbol", found.symbol);
        }
    }, [selectedCurrency, currencies, setValue]);

    const onSubmit = async (data) => {
        if (createOwner) {
            const errs = {};
            if (!ownerName.trim()) errs.name = true;
            if (!ownerEmail.trim()) errs.email = true;
            if (!ownerPassword) errs.password = true;
            if (Object.keys(errs).length > 0) {
                setOwnerErrors(errs);
                toast({ title: t("error"), description: t("please_fill_all_owner_fields"), status: "error", duration: 3000, isClosable: true });
                return;
            }
        }
        setOwnerErrors({});
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                create_owner: createOwner,
            };
            if (createOwner) {
                payload.owner_name = ownerName;
                payload.owner_email = ownerEmail;
                payload.owner_password = ownerPassword;
            }
            const res = await api.post("/v1/restaurants", payload);
            toast({ title: res.data.message, status: "success", duration: 3000, isClosable: true });
            navigate("/restaurant/list");
        } catch (err) {
            const errorResponse = err?.response?.data;
            if (errorResponse?.errors) {
                const errorMessage = Object.values(errorResponse.errors).flat().join(" ");
                toast({ title: t("error"), description: errorMessage, status: "error", duration: 3000, isClosable: true });
            } else if (errorResponse?.message) {
                toast({ title: t("error"), description: errorResponse.message, status: "error", duration: 3000, isClosable: true });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box bg={pageBg} minH="100vh" py={3}>
            <Box mx="auto">
                <Card mb={4} bg={cardBg} shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Breadcrumb fontSize="sm" color={textColor}>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to="/dashboard" fontWeight="medium" _hover={{ color: "teal.500" }}>{t("dashboard")}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to="/restaurant/list" fontWeight="medium" _hover={{ color: "teal.500" }}>{t("list")}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color={headingColor} fontWeight="bold">{t("create")}</BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={cardBg}>
                    <CardHeader bg={cardBg} borderBottom="1px solid" borderColor={headerBorderColor} pb={6}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="sm" color={headingColor} fontWeight="bold">{t("create")}</Heading>
                                <Text fontSize="sm" color={textColor} mt={1}>{t("create_new_restaurant")}</Text>
                            </Box>
                            <Button colorScheme="teal" as={ReactRouterLink} to="/restaurant/list" variant="outline" display={{ base: "none", md: "inline-flex" }} size="sm" fontWeight="600">{t("list")}</Button>
                        </Flex>
                    </CardHeader>

                    <CardBody p={8}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                <FormControl isRequired isInvalid={errors.name}>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("name")}</FormLabel>
                                    <Input {...register("name", { required: true })} placeholder={t("name")} bg={fieldBg} border="1px solid" borderColor={borderColor} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: fieldHoverBorder }} size="md" transition="all 0.2s" />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("slug")}</FormLabel>
                                    <Input {...register("slug")} placeholder={t("auto_generated")} bg={fieldBg} border="1px solid" borderColor={borderColor} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: fieldHoverBorder }} size="md" transition="all 0.2s" />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("email")}</FormLabel>
                                    <Input {...register("email")} type="email" placeholder={t("restaurant_email_placeholder")} bg={fieldBg} border="1px solid" borderColor={borderColor} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: fieldHoverBorder }} size="md" transition="all 0.2s" />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("phone")}</FormLabel>
                                    <Input {...register("phone")} placeholder={t("phone_placeholder")} bg={fieldBg} border="1px solid" borderColor={borderColor} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: fieldHoverBorder }} size="md" transition="all 0.2s" />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("address")}</FormLabel>
                                    <Input {...register("address")} placeholder={t("street_address")} bg={fieldBg} border="1px solid" borderColor={borderColor} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: fieldHoverBorder }} size="md" transition="all 0.2s" />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("city")}</FormLabel>
                                    <Input {...register("city")} bg={fieldBg} border="1px solid" borderColor={borderColor} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: fieldHoverBorder }} size="md" transition="all 0.2s" />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("state")}</FormLabel>
                                    <Input {...register("state")} bg={fieldBg} border="1px solid" borderColor={borderColor} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: fieldHoverBorder }} size="md" transition="all 0.2s" />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("country")}</FormLabel>
                                    <Input {...register("country")} bg={fieldBg} border="1px solid" borderColor={borderColor} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: fieldHoverBorder }} size="md" transition="all 0.2s" />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("zip_code")}</FormLabel>
                                    <Input {...register("zip_code")} bg={fieldBg} border="1px solid" borderColor={borderColor} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: fieldHoverBorder }} size="md" transition="all 0.2s" />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("currency")}</FormLabel>
                                    <input type="hidden" {...register("currency_symbol")} />
                                    <Select {...register("currency")} bg={fieldBg} border="1px solid" borderColor={borderColor} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: fieldHoverBorder }} size="md">
                                        {currencies.map((cur) => (
                                            <option key={cur.id} value={cur.code}>{cur.code} ({cur.symbol})</option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("timezone")}</FormLabel>
                                    <Select {...register("timezone")} bg={fieldBg} border="1px solid" borderColor={borderColor} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: fieldHoverBorder }} size="md">
                                        <option value="UTC">{t("timezone_utc")}</option>
                                        <option value="America/New_York">{t("timezone_eastern")}</option>
                                        <option value="America/Chicago">{t("timezone_central")}</option>
                                        <option value="America/Los_Angeles">{t("timezone_pacific")}</option>
                                        <option value="Europe/London">{t("timezone_london")}</option>
                                        <option value="Asia/Dhaka">{t("timezone_dhaka")}</option>
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("tax_rate")}</FormLabel>
                                    <Input {...register("tax_rate")} type="number" step="0.01" placeholder="0" bg={fieldBg} border="1px solid" borderColor={borderColor} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: fieldHoverBorder }} size="md" transition="all 0.2s" />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("tax_name")}</FormLabel>
                                    <Input {...register("tax_name")} placeholder={t("tax_name_placeholder")} bg={fieldBg} border="1px solid" borderColor={borderColor} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: fieldHoverBorder }} size="md" transition="all 0.2s" />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("tax_inclusive")}</FormLabel>
                                    <HStack><Switch {...register("tax_inclusive")} /><Text fontSize="sm" color={textColor}>{t("tax_inclusive")}</Text></HStack>
                                </FormControl>
                            </SimpleGrid>

                            <Divider my={10} borderColor={dividerBg} />

                            <Box>
                                <Heading size="sm" color={headingColor} fontWeight="bold" mb={6}>{t("restaurant_owner")}</Heading>

                                <FormControl mb={6}>
                                    <Checkbox
                                        isChecked={createOwner}
                                        onChange={(e) => {
                                            setCreateOwner(e.target.checked);
                                            setOwnerErrors({});
                                        }}
                                        colorScheme="teal"
                                        fontWeight="semibold"
                                        fontSize="sm"
                                    >
                                        <Text fontSize="sm" color={labelColor}>{t("create_restaurant_owner_account")}</Text>
                                    </Checkbox>
                                </FormControl>

                                {createOwner && (
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                        <FormControl isRequired isInvalid={ownerErrors.name}>
                                            <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("owner_name")}</FormLabel>
                                            <Input
                                                value={ownerName}
                                                onChange={(e) => setOwnerName(e.target.value)}
                                                placeholder={t("owner_name_placeholder")}
                                                bg={fieldBg} border="1px solid" borderColor={borderColor} borderRadius="md"
                                                focusBorderColor="teal.500" _hover={{ borderColor: fieldHoverBorder }}
                                                size="md" transition="all 0.2s"
                                            />
                                        </FormControl>

                                        <FormControl isRequired isInvalid={ownerErrors.email}>
                                            <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("owner_email")}</FormLabel>
                                            <Input
                                                type="email"
                                                value={ownerEmail}
                                                onChange={(e) => setOwnerEmail(e.target.value)}
                                                placeholder={t("owner_email_placeholder")}
                                                bg={fieldBg} border="1px solid" borderColor={borderColor} borderRadius="md"
                                                focusBorderColor="teal.500" _hover={{ borderColor: fieldHoverBorder }}
                                                size="md" transition="all 0.2s"
                                            />
                                        </FormControl>

                                        <FormControl isRequired isInvalid={ownerErrors.password}>
                                            <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>{t("owner_password")}</FormLabel>
                                            <Input
                                                type="password"
                                                value={ownerPassword}
                                                onChange={(e) => setOwnerPassword(e.target.value)}
                                                placeholder={t("owner_password_placeholder")}
                                                bg={fieldBg} border="1px solid" borderColor={borderColor} borderRadius="md"
                                                focusBorderColor="teal.500" _hover={{ borderColor: fieldHoverBorder }}
                                                size="md" transition="all 0.2s"
                                            />
                                        </FormControl>
                                    </SimpleGrid>
                                )}
                            </Box>

                            <Flex mt={10} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                                <Button type="button" as={ReactRouterLink} to="/restaurant/list" colorScheme="gray" variant="outline" fontWeight="semibold" px={6} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "gray.50" }}>{t("cancel")}</Button>
                                <Button type="submit" isLoading={isSubmitting} loadingText={t("saving")} colorScheme="teal" bg="teal.500" color="white" fontWeight="semibold" px={8} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "teal.600" }} _active={{ bg: "teal.700" }} boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)">{t("save")}</Button>
                            </Flex>
                        </form>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default RestaurantCreate;
