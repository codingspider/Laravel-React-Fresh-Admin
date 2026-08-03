import React, { useState, useEffect } from "react";
import {
    Button,
    FormControl,
    FormLabel,
    Select,
    Text,
    useToast,
    SimpleGrid,
    Badge,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import api from "../../../axios";
import { UPDATE_RESTAURANT_CURRENCY } from "../../../routes/apiRoutes";
import { usePermission } from "../../../context/PermissionContext";
import useThemeColors from "../../../hooks/useThemeColors";

const CurrencySetting = () => {
    const colors = useThemeColors();
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

    const selectProps = {
        bg: colors.bgInput,
        border: "1px solid",
        borderColor: colors.borderInput,
        borderRadius: "md",
        focusBorderColor: "teal.500",
        _hover: { borderColor: "gray.300" },
        size: "md",
        transition: "all 0.2s",
    };

    return (
        <form onSubmit={onSubmit}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                        {t("currency")}
                    </FormLabel>
                    <Select
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                        placeholder={t("select_currency")}
                        {...selectProps}
                    >
                        {currencies.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.code} - {c.name} ({c.symbol})
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                        {t("currency_preview")}
                    </FormLabel>
                    <Badge colorScheme="teal" fontSize="md" px={3} py={1.5}>
                        {selectedCurrency
                            ? `${selectedCurrency.symbol}1,234.56`
                            : "-"}
                    </Badge>
                </FormControl>

                <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                        {t("current_currency")}
                    </FormLabel>
                    <Text fontSize="md" fontWeight="700" color={colors.textPrimary}>
                        {restaurant?.currency ? `${restaurant.currency} (${restaurant.currency_symbol})` : "-"}
                    </Text>
                </FormControl>
            </SimpleGrid>

            <Button
                mt={8}
                float="right"
                type="submit"
                isLoading={isSubmitting}
                loadingText={t("saving_data")}
                colorScheme="teal"
                isDisabled={!selected}
                bg="teal.500"
                color="white"
                fontWeight="semibold"
                px={8}
                h={12}
                borderRadius="md"
                _hover={{ bg: "teal.600" }}
                _active={{ bg: "teal.700" }}
                boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)"
            >
                {t("save")}
            </Button>
        </form>
    );
};

export default CurrencySetting;
