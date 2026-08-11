import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, useToast, Icon, IconButton, Text, Badge, Menu, MenuButton, MenuList, MenuItem, Select,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { MoreHorizontal } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../axios";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import TableExportButtons from "../../ui/TableExportButtons";
import BranchFilter from "../../ui/BranchFilter";
import { LIST_PURCHASE, DELETE_PURCHASE, LIST_SUPPLIER } from "../../../routes/apiRoutes";
import { PURCHASE_LIST_PATH, PURCHASE_ADD_PATH, PURCHASE_EDIT_PATH, PURCHASE_VIEW_PATH, DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";

export default function PurchaseList() {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(15);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [supplierFilter, setSupplierFilter] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [orderTypeFilter, setOrderTypeFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const colors = useThemeColors();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(LIST_PURCHASE, {
        params: {
          page: pageIndex + 1,
          per_page: pageSize,
          search: globalFilter || "",
          supplier_id: supplierFilter || "",
          order_type: orderTypeFilter || "",
          branch_id: branchFilter || "",
        },
      });
      const items = res.data?.data?.data || res.data?.data || [];
      const total = res.data?.meta?.total || res.data?.data?.total || items.length;
      setData(items);
      setPageCount(Math.ceil(total / pageSize));
      setTotalItems(total);
    } catch (err) {
      console.error("fetchData error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, globalFilter, pageSize, supplierFilter, orderTypeFilter, branchFilter]);

  useEffect(() => {
    const app_name = localStorage.getItem("app_name");
    document.title = `${app_name} | ${t("purchase_management")}`;
    fetchData();
    api.get(`${LIST_SUPPLIER}?per_page=200`).then((res) => setSuppliers(res.data?.data?.data || res.data?.data || [])).catch(() => {});
  }, [fetchData, t]);

  const deleteItem = async (id) => {
    const result = await Swal.fire({
      title: t("are_you_sure"),
      text: t("data_will_be_deleted"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0d9488",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t("yes_delete"),
      cancelButtonText: t("cancel"),
      reverseButtons: true,
      customClass: { popup: "swal-popup" },
    });

    if (result.isConfirmed) {
      try {
        await api.delete(DELETE_PURCHASE(id));
        toast({ title: t("data_deleted_successfully"), status: "success", duration: 3000, isClosable: true });
        fetchData();
      } catch (error) {
        toast({
          title: t("error_deleting_data"),
          description: error.response?.data?.message || t("something_went_wrong"),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const columns = [
    {
      header: "#",
      cell: ({ row }) => <Text fontSize="sm" fontWeight="500" color={colors.textMuted}>{row.index + 1 + pageIndex * pageSize}</Text>,
    },
    {
      header: t("reference_number"),
      accessorKey: "reference_number",
      cell: ({ getValue }) => <Text fontSize="sm" fontWeight="600">{getValue()}</Text>,
    },
    {
      header: t("supplier"),
      accessorKey: "supplier",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue()?.name || "-"}</Text>,
    },
    {
      header: t("branch"),
      accessorKey: "branch",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue()?.name || "-"}</Text>,
    },
    {
      header: t("purchase_date"),
      accessorKey: "purchase_date",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue() || "-"}</Text>,
    },
    {
      header: t("total"),
      accessorKey: "total",
      cell: ({ getValue }) => <Text fontSize="sm" fontWeight="600">{getValue() || "0.00"}</Text>,
    },
    {
      header: t("paid"),
      accessorKey: "paid_amount",
      cell: ({ getValue }) => <Text fontSize="sm" color="green.500">{getValue() || "0.00"}</Text>,
    },
    {
      header: t("due"),
      accessorKey: "due_amount",
      cell: ({ getValue }) => {
        const due = Number(getValue());
        return <Text fontSize="sm" fontWeight="600" color={due > 0 ? "red.500" : "green.500"}>{getValue() || "0.00"}</Text>;
      },
    },
    {
      header: t("order_type"),
      accessorKey: "order_type",
      cell: ({ getValue }) => (
        <Badge colorScheme="teal" variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs">
          {getValue() === "direct_purchase" ? t("direct_purchase") : t("purchase_order")}
        </Badge>
      ),
    },
    {
      header: t("actions"),
      cell: ({ row }) => (
        <Menu>
          <MenuButton as={IconButton} icon={<Icon as={MoreHorizontal} boxSize={4} />} variant="ghost" size="sm" borderRadius="lg" aria-label={t("actions")} />
          <MenuList minW="160px" p={1.5}>
            <MenuItem icon={<Icon as={ViewIcon} boxSize={4} />} borderRadius="md" fontSize="sm" onClick={() => navigate(PURCHASE_VIEW_PATH(row.original.id))}>
              {t("view")}
            </MenuItem>
            <MenuItem icon={<Icon as={EditIcon} boxSize={4} />} borderRadius="md" fontSize="sm" onClick={() => navigate(PURCHASE_EDIT_PATH(row.original.id))}>
              {t("edit")}
            </MenuItem>
            <MenuItem
              icon={<Icon as={DeleteIcon} boxSize={4} />} borderRadius="md" fontSize="sm" color="red.500"
              _hover={{ bg: "red.50", _dark: { bg: "red.900" } }} onClick={() => deleteItem(row.original.id)}
            >
              {t("delete")}
            </MenuItem>
          </MenuList>
        </Menu>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t("purchase_management")}
        subtitle={t("manage_purchases_and_suppliers")}
        breadcrumbs={[{ label: t("dashboard"), path: DASHBOARD_PATH }, { label: t("purchases"), isCurrent: true }]}
        action={PURCHASE_ADD_PATH}
        actionLabel={t("add_purchase")}
      >
        <TableExportButtons data={data} columns={columns} filename="purchases" />
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
          hideAddBtn="true"
          totalItems={totalItems}
        >
          <Select maxW="180px" size="md" value={supplierFilter} onChange={(e) => { setSupplierFilter(e.target.value); setPageIndex(0); }} placeholder={t("all_suppliers")} bg={colors.bgInput}
            borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
          >
            {(Array.isArray(suppliers) ? suppliers : []).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
          <Select maxW="160px" size="md" value={orderTypeFilter} onChange={(e) => { setOrderTypeFilter(e.target.value); setPageIndex(0); }} placeholder={t("order_type")} bg={colors.bgInput}
            borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
          >
            <option value="purchase_order">{t("purchase_order")}</option>
            <option value="direct_purchase">{t("direct_purchase")}</option>
          </Select>
          <BranchFilter value={branchFilter} onChange={setBranchFilter} />
        </TanStackTable>
      </Box>
    </Box>
  );
}
