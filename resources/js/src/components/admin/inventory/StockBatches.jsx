import React, { useEffect, useState, useCallback } from "react";
import { Box, useToast, Text, Badge, Switch } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import api from "../../../axios";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import TableExportButtons from "../../ui/TableExportButtons";
import { STOCK_BATCHES } from "../../../routes/apiRoutes";
import { STOCK_OVERVIEW_PATH, DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";

export default function StockBatches() {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [expiringOnly, setExpiringOnly] = useState(false);
  const { t } = useTranslation();
  const colors = useThemeColors();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(STOCK_BATCHES, {
        params: { page: pageIndex + 1, per_page: pageSize, search: globalFilter || "", expiring_only: expiringOnly ? 1 : 0 },
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
  }, [pageIndex, pageSize, globalFilter, expiringOnly]);

  useEffect(() => {
    const app_name = localStorage.getItem("app_name");
    document.title = `${app_name} | ${t("stock_batches")}`;
    fetchData();
  }, [fetchData, t]);

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
      header: t("batch_number"),
      accessorKey: "batch_number",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue() || "-"}</Text>,
    },
    {
      header: t("quantity"),
      accessorKey: "quantity",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue()}</Text>,
    },
    {
      header: t("remaining"),
      accessorKey: "remaining_qty",
      cell: ({ getValue }) => <Text fontSize="sm" fontWeight="600">{getValue()}</Text>,
    },
    {
      header: t("unit_cost"),
      accessorKey: "unit_cost",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue()}</Text>,
    },
    {
      header: t("manufacture_date"),
      accessorKey: "manufacture_date",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue() || "-"}</Text>,
    },
    {
      header: t("expiry_date"),
      accessorKey: "expiry_date",
      cell: ({ getValue }) => {
        if (!getValue()) return <Text fontSize="sm">-</Text>;
        const days = Math.ceil((new Date(getValue()) - new Date()) / 86400000);
        const scheme = days <= 0 ? "red" : days <= 30 ? "orange" : "green";
        return <Badge colorScheme={scheme} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs">{getValue()}</Badge>;
      },
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t("stock_batches")}
        subtitle={t("track_batches_and_expiry")}
        breadcrumbs={[{ label: t("dashboard"), path: DASHBOARD_PATH }, { label: t("stock_management"), path: STOCK_OVERVIEW_PATH }, { label: t("batches"), isCurrent: true }]}
      >
        <TableExportButtons data={data} columns={columns} filename="stock-batches" />
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
          <Box display="flex" alignItems="center" gap={2}>
            <Switch
              colorScheme="teal"
              isChecked={expiringOnly}
              onChange={(e) => { setExpiringOnly(e.target.checked); setPageIndex(0); }}
            />
            <Text fontSize="sm">{t("expiring_soon_only")}</Text>
          </Box>
        </TanStackTable>
      </Box>
    </Box>
  );
}
