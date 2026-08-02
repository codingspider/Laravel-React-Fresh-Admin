import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Select,
    Stack,
    Text,
    useToast,
    SimpleGrid,
    Badge,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import api from "../../../axios";
import { UPDATE_RESTAURANT_CURRENCY } from "../../../routes/apiRoutes";
import { usePermission } from "../../../context/PermissionContext";

const CurrencySetting = () => {
    const { t } = useTranslation();
    const { restaurant, refetchPermissions } = usePermission();
    const [currencies, setCurrencies] = useState([]);
    const [selected, setSelected] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    const getCurrencies = async () => {
        try {
            const res = await api.get("/v1/currencies/all-active");
            setCurrencies(res.data?.data || []);
        } catch (error) {
            console.error("Failed to fetch currencies:", error);
        }
    };

    useEffect(() => {
        getCurrencies();
    }, []);

    useEffect(() => {
        if (restaurant?.currency) {
            setSelected(restaurant.currency);
        }
    }, [restaurant?.currency]);

    const selectedCurrency = currencies.find((c) => c.code === selected);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!selected) return;
        setIsSubmitting(true);
        try {
            const res = await api.post(UPDATE_RESTAURANT_CURRENCY, { currency_code: selected });
            toast({
                position: "bottom-right",
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            await refetchPermissions();
            if (selectedCurrency) {
                localStorage.setItem(
                    "currency_data",
                    JSON.stringify({
                        code: selectedCurrency.code,
                        symbol: selectedCurrency.symbol,
                        symbol_first: Boolean(selectedCurrency.symbol_first),
                        decimal_mark: selectedCurrency.decimal_mark,
                        thousands_separator: selectedCurrency.thousands_separator,
                        precision: Number(selectedCurrency.precision) || 2,
                    })
                );
            }
        } catch (err) {
            const errorResponse = err?.response?.data;
            const errorMessage = errorResponse?.errors
                ? Object.values(errorResponse.errors).flat().join(" ")
                : errorResponse?.message || "Something went wrong";
            toast({
                position: "bottom-right",
                title: "Error",
                description: errorMessage,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box mt={5} mx="auto" p={6} borderWidth={1} borderRadius="lg">
            <form onSubmit={onSubmit}>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    <FormControl isRequired>
                        <FormLabel>{t("currency")}</FormLabel>
                        <Select
                            value={selected}
                            onChange={(e) => setSelected(e.target.value)}
                            placeholder={t("select_currency")}
                        >
                            {currencies.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.code} - {c.name} ({c.symbol})
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    <Box>
                        <Text fontSize="sm" fontWeight="500" mb={2}>{t("currency_preview")}</Text>
                        <Badge colorScheme="teal" fontSize="md" px={3} py={1.5}>
                            {selectedCurrency
                                ? `${selectedCurrency.symbol}1,234.56`
                                : "-"}
                        </Badge>
                    </Box>

                    <Box>
                        <Text fontSize="sm" fontWeight="500" mb={2}>{t("current_currency")}</Text>
                        <Text fontSize="md" fontWeight="700">
                            {restaurant?.currency ? `${restaurant.currency} (${restaurant.currency_symbol})` : "-"}
                        </Text>
                    </Box>
                </SimpleGrid>

                <Stack direction="row" justify="flex-end" mt={8}>
                    <Button
                        isLoading={isSubmitting}
                        loadingText="Saving..."
                        type="submit"
                        colorScheme="teal"
                        isDisabled={!selected}
                    >
                        {t("save")}
                    </Button>
                </Stack>
            </form>
        </Box>
    );
};

export default CurrencySetting;
