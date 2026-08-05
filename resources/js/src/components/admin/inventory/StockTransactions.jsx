import React, { useEffect, useState, useCallback } from "react";
import {
  Box, useToast, Text, Badge, Select, Input,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import api from "../../../axios";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import TableExportButtons from "../../ui/TableExportButtons";
import { STOCK_TRANSACTIONS, LIST_INVENTORY_ITEM } from "../../../routes/apiRoutes";
import { STOCK_OVERVIEW_PATH, DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

export default function StockTransactions() {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(15);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [typeFilter, setTypeFilter] = useState("");
  const [items, setItems] = useState([]);
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { formatAmount } = useCurrencyFormatter();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(STOCK_TRANSACTIONS, {
        params: { page: pageIndex + 1, per_page: pageSize, type: typeFilter || "", search: globalFilter || "" },
      });
      const list = res.data?.data?.data || res.data?.data || [];
      const total = res.data?.meta?.total || res.data?.data?.total || list.length;
      setData(list);
      setPageCount(Math.ceil(total / pageSize));
      setTotalItems(total);
    } catch (err) {
      console.error("fetchData error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, pageSize, typeFilter, globalFilter]);

  useEffect(() => {
    const app_name = localStorage.getItem("app_name");
    document.title = `${app_name} | ${t("stock_transactions")}`;
    fetchData();
    api.get(`${LIST_INVENTORY_ITEM}?per_page=200`).then((res) => setItems(res.data?.data?.data || res.data?.data || [])).catch(() => {});
  }, [fetchData, t]);

  const typeColors = {
    purchase: "teal", sale: "green", transfer: "blue", adjustment: "purple",
    waste: "orange", expired: "red", return: "cyan", consumption: "pink",
  };

  const columns = [
    {
      header: "#",
      cell: ({ row }) => <Text fontSize="sm" fontWeight="500" color={colors.textMuted}>{row.index + 1 + pageIndex * pageSize}</Text>,
    },
    {
      header: t("item"),
      accessorKey: "item",
      cell: ({ getValue }) => <Text fontSize="sm" fontWeight="600">{getValue()?.name || "-"}</Text>,
    },
    {
      header: t("type"),
      accessorKey: "type",
      cell: ({ getValue }) => <Badge colorScheme={typeColors[getValue()] || "gray"} variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs">{getValue()}</Badge>,
    },
    {
      header: t("quantity"),
      accessorKey: "quantity",
      cell: ({ getValue }) => {
        const qty = Number(getValue());
        return <Text fontSize="sm" fontWeight="600" color={qty >= 0 ? "green.500" : "red.500"}>{getValue()}</Text>;
      },
    },
    {
      header: t("previous_stock"),
      accessorKey: "previous_stock",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue()}</Text>,
    },
    {
      header: t("new_stock"),
      accessorKey: "new_stock",
      cell: ({ getValue }) => <Text fontSize="sm" fontWeight="600">{getValue()}</Text>,
    },
    {
      header: t("unit_cost"),
      accessorKey: "unit_cost",
      cell: ({ getValue }) => <Text fontSize="sm">{formatAmount(getValue() || 0)}</Text>,
    },
    {
      header: t("total_cost"),
      accessorKey: "total_cost",
      cell: ({ getValue }) => <Text fontSize="sm">{formatAmount(getValue() || 0)}</Text>,
    },
    {
      header: t("branch"),
      accessorKey: "branch",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue()?.name || "-"}</Text>,
    },
    {
      header: t("notes"),
      accessorKey: "notes",
      cell: ({ getValue }) => <Text fontSize="sm" noOfLines={1}>{getValue() || "-"}</Text>,
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t("stock_transactions")}
        subtitle={t("view_all_stock_movements")}
        breadcrumbs={[{ label: t("dashboard"), path: DASHBOARD_PATH }, { label: t("stock_management"), path: STOCK_OVERVIEW_PATH }, { label: t("transactions"), isCurrent: true }]}
      >
        <TableExportButtons data={data} columns={columns} filename="stock-transactions" />
      </PageHeader>

      <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
        <TanStackTable
          columns={columns}
          data={data}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          pageCount={pageCount}
          isLoading={isLoading}
          totalItems={totalItems}
        >
          <Select maxW="170px" size="md" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPageIndex(0); }} placeholder={t("all_types")} bg={colors.bgInput}
            borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
          >
            <option value="purchase">purchase</option>
            <option value="sale">sale</option>
            <option value="transfer">transfer</option>
            <option value="adjustment">adjustment</option>
            <option value="waste">waste</option>
            <option value="expired">expired</option>
            <option value="return">return</option>
            <option value="consumption">consumption</option>
          </Select>
        </TanStackTable>
      </Box>
    </Box>
  );
}
