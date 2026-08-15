import { useState, useEffect, useCallback, useRef } from "react";
import api from "./axios";

export function useCurrencyFormatter() {
    const [currencyConfig, setCurrencyConfig] = useState({
        code: "USD",
        symbol: "$",
        symbol_first: true,
        decimal_mark: ".",
        thousands_separator: ",",
        precision: 2,
    });
    const loaded = useRef(false);

    useEffect(() => {
        if (loaded.current) return;
        loaded.current = true;

        const stored = localStorage.getItem("currency_data");
        if (stored) {
            try {
                const data = JSON.parse(stored);
                setCurrencyConfig((prev) => ({ ...prev, ...data }));
            } catch { }
        }

        api.get("/user").then((res) => {
            const user = res.data?.data || res.data;
            const restaurant = user?.restaurant || user?.current_restaurant;
            const code = restaurant?.currency || "USD";
            const symbol = restaurant?.currency_symbol || "$";

            api.get("/v1/currencies/all-active").then((curRes) => {
                const currencies = curRes.data?.data || [];
                const found = currencies.find((c) => c.code === code);
                if (found) {
                    const config = {
                        code: found.code,
                        symbol: found.symbol,
                        symbol_first: found.symbol_first,
                        decimal_mark: found.decimal_mark,
                        thousands_separator: found.thousands_separator,
                        precision: found.precision,
                    };
                    setCurrencyConfig(config);
                    localStorage.setItem("currency_data", JSON.stringify(config));
                } else {
                    const config = { code, symbol, symbol_first: true, decimal_mark: ".", thousands_separator: ",", precision: 2 };
                    setCurrencyConfig(config);
                    localStorage.setItem("currency_data", JSON.stringify(config));
                }
            }).catch(() => {
                const config = { code, symbol, symbol_first: true, decimal_mark: ".", thousands_separator: ",", precision: 2 };
                setCurrencyConfig(config);
                localStorage.setItem("currency_data", JSON.stringify(config));
            });
        }).catch(() => { });
    }, []);

    const formatAmount = useCallback(
        (amount) => {
            if (amount === null || amount === undefined || amount === "") return "";
            const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

            const { symbol, symbol_first, decimal_mark, thousands_separator, precision } = currencyConfig;
            const formatted = numericAmount.toLocaleString(undefined, {
                minimumFractionDigits: precision,
                maximumFractionDigits: precision,
            }).replace(/\./g, decimal_mark).replace(/,/g, thousands_separator);

            return symbol_first ? `${symbol}${formatted}` : `${formatted}${symbol}`;
        },
        [currencyConfig]
    );

    return {
        formatAmount,
        currency: currencyConfig.code,
        currencySymbol: currencyConfig.symbol,
        currencyConfig,
    };
}
