import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, useToast, Icon, IconButton, Text, Badge, Menu, MenuButton, MenuList, MenuItem, Select,
  SimpleGrid, Heading, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter, Button, Input, FormControl, FormLabel, Flex,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { MoreHorizontal } from "lucide-react";
import { EditIcon, ArrowUpIcon, ArrowDownIcon } from "@chakra-ui/icons";
import api from "../../../axios";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import TableExportButtons from "../../ui/TableExportButtons";
import { STOCK_OVERVIEW, ADJUST_ITEM_STOCK, LIST_INVENTORY_CATEGORY } from "../../../routes/apiRoutes";
import { STOCK_OVERVIEW_PATH, STOCK_TRANSACTIONS_PATH, DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";
import { usePermission } from "../../../context/PermissionContext";
import BranchFilter from "../../ui/BranchFilter";

const ADMIN_ROLES = ['super_admin', 'admin', 'restaurant_owner'];

export default function StockOverview() {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(15);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [summary, setSummary] = useState({});
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ quantity: "", type: "adjustment", notes: "" });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const colors = useThemeColors();
  const { formatAmount } = useCurrencyFormatter();
  const { user } = usePermission();

  const isAdmin = user?.roles?.some((role) => ADMIN_ROLES.includes(role));
  const userBranchId = user?.branch_id || null;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pageIndex + 1,
        per_page: pageSize,
        search: globalFilter || "",
      };
      if (typeFilter) params.type = typeFilter;
      if (categoryFilter) params.category_id = categoryFilter;
      if (isAdmin) {
        if (branchFilter) params.branch_id = branchFilter;
      } else if (userBranchId) {
        params.branch_id = userBranchId;
      }
      const res = await api.get(STOCK_OVERVIEW, { params });
      const items = res.data?.data?.data || res.data?.data || [];
      const total = res.data?.meta?.total || res.data?.data?.total || items.length;
      setData(items);
      setPageCount(Math.ceil(total / pageSize));
      setTotalItems(total);
      setSummary(res.data?.summary || {});
    } catch (err) {
      console.error("fetchData error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, globalFilter, pageSize, typeFilter, categoryFilter, isAdmin, userBranchId, branchFilter]);

  useEffect(() => {
    const app_name = localStorage.getItem("app_name");
    document.title = `${app_name} | ${t("stock_management")}`;
    fetchData();
    api.get(`${LIST_INVENTORY_CATEGORY}?per_page=200`).then((res) => setCategories(res.data?.data?.data || res.data?.data || [])).catch(() => {});
  }, [fetchData, t]);

  const openAdjust = (item) => {
    setSelectedItem(item);
    setAdjustForm({ quantity: "", type: "adjustment", notes: "" });
    onOpen();
  };

  const submitAdjust = async () => {
    try {
      const res = await api.post(ADJUST_ITEM_STOCK(selectedItem.id), adjustForm);
      toast({ title: res.data.message || t("stock_adjusted"), status: "success", duration: 3000, isClosable: true });
      onClose();
      fetchData();
    } catch (err) {
      toast({ title: t("error"), description: err?.response?.data?.message || t("something_went_wrong"), status: "error", duration: 3000, isClosable: true });
    }
  };

  const columns = [
    {
      header: "#",
      cell: ({ row }) => <Text fontSize="sm" fontWeight="500" color={colors.textMuted}>{row.index + 1 + pageIndex * pageSize}</Text>,
    },
    {
      header: t("name"),
      accessorKey: "name",
      cell: ({ getValue, row }) => (
        <Box>
          <Text fontSize="sm" fontWeight="600">{getValue()}</Text>
          <Text fontSize="xs" color={colors.textMuted}>{row.original.sku || row.original.barcode || ""}</Text>
        </Box>
      ),
    },
    {
      header: t("category"),
      accessorKey: "category",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue()?.name || "-"}</Text>,
    },
    {
      header: t("type"),
      accessorKey: "type",
      cell: ({ getValue }) => (
        <Badge colorScheme={getValue() === "raw_material" ? "teal" : getValue() === "finished_product" ? "purple" : "orange"} variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs">
          {getValue() || "raw_material"}
        </Badge>
      ),
    },
    {
      header: t("current_stock"),
      accessorKey: "current_stock",
      cell: ({ getValue, row }) => {
        const qty = Number(getValue());
        const min = Number(row.original.minimum_stock);
        const low = qty <= min;
        return (
          <Text fontSize="sm" fontWeight="600" color={low ? "red.500" : "green.500"}>{getValue() ?? "0"}</Text>
        );
      },
    },
    {
      header: t("minimum_stock"),
      accessorKey: "minimum_stock",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue() ?? "0"}</Text>,
    },
    {
      header: t("unit_cost"),
      accessorKey: "unit_cost",
      cell: ({ getValue }) => <Text fontSize="sm">{formatAmount(getValue() || 0)}</Text>,
    },
    {
      header: t("stock_value"),
      accessorKey: "id",
      cell: ({ row }) => {
        const val = Number(row.original.current_stock) * Number(row.original.unit_cost);
        return <Text fontSize="sm" fontWeight="600">{formatAmount(val)}</Text>;
      },
    },
    {
      header: t("expiry"),
      accessorKey: "expiry_date",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue() || "-"}</Text>,
    },
    {
      header: t("actions"),
      cell: ({ row }) => (
        <Menu>
          <MenuButton as={IconButton} icon={<Icon as={MoreHorizontal} boxSize={4} />} variant="ghost" size="sm" borderRadius="lg" aria-label={t("actions")} />
          <MenuList minW="180px" p={1.5}>
            <MenuItem icon={<Icon as={ArrowUpIcon} boxSize={4} />} borderRadius="md" fontSize="sm" onClick={() => openAdjust({ ...row.original, sign: 1 })}>
              {t("increase_stock")}
            </MenuItem>
            <MenuItem icon={<Icon as={ArrowDownIcon} boxSize={4} />} borderRadius="md" fontSize="sm" onClick={() => openAdjust({ ...row.original, sign: -1 })}>
              {t("decrease_stock")}
            </MenuItem>
            <MenuItem icon={<Icon as={EditIcon} boxSize={4} />} borderRadius="md" fontSize="sm" onClick={() => navigate(`/inventory/edit/${row.original.id}`)}>
              {t("edit")}
            </MenuItem>
          </MenuList>
        </Menu>
      ),
    },
  ];

  const statCards = [
    { label: t("total_stock_value"), value: formatAmount(summary.total_stock_value || 0), color: "teal.500" },
    { label: t("total_stock_qty"), value: summary.total_stock_qty || 0, color: "blue.500" },
    { label: t("low_stock_items"), value: summary.low_stock_items || 0, color: "red.500" },
    { label: t("expiring_soon"), value: summary.expiring_soon || 0, color: "orange.500" },
  ];

  return (
    <Box>
      <PageHeader
        title={t("stock_management")}
        subtitle={t("monitor_inventory_stock_levels")}
        breadcrumbs={[{ label: t("dashboard"), path: DASHBOARD_PATH }, { label: t("stock_management"), isCurrent: true }]}
        action={STOCK_TRANSACTIONS_PATH}
        actionLabel={t("view_transactions")}
      >
        <TableExportButtons data={data} columns={columns} filename="stock-overview" />
      </PageHeader>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
        {statCards.map((card, idx) => (
          <Box key={idx} bg={colors.bgCard} p={5} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
            <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{card.label}</Text>
            <Heading size="lg" color={card.color} mt={1}>{card.value}</Heading>
          </Box>
        ))}
      </SimpleGrid>

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
          {isAdmin && <BranchFilter value={branchFilter} onChange={setBranchFilter} />}
          <Select maxW="170px" size="md" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPageIndex(0); }} placeholder={t("all_types")} bg={colors.bgInput}
            borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
          >
            <option value="raw_material">{t("raw_material")}</option>
            <option value="finished_product">{t("finished_product")}</option>
            <option value="both">{t("both")}</option>
          </Select>
          <Select maxW="170px" size="md" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPageIndex(0); }} placeholder={t("all_categories")} bg={colors.bgInput}
            borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
          >
            {(Array.isArray(categories) ? categories : []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </TanStackTable>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={colors.bgCard}>
          <ModalHeader>{selectedItem?.sign === -1 ? t("decrease_stock") : t("increase_stock")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" gap={4}>
              <Text fontSize="sm" fontWeight="600">{selectedItem?.name}</Text>
              <Text fontSize="xs" color={colors.textSecondary}>{t("current_stock")}: <b>{selectedItem?.current_stock}</b></Text>
             <FormControl isRequired>
                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("quantity")}</FormLabel>
                 <Input
                   type="number" min="0" step="0.01" value={adjustForm.quantity}
                   onChange={(e) => setAdjustForm((f) => ({ ...f, quantity: e.target.value }))}
                   bg={colors.bgInput}
                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                 />
               </FormControl>
               <FormControl>
                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("reason")}</FormLabel>
                 <Select value={adjustForm.type} onChange={(e) => setAdjustForm((f) => ({ ...f, type: e.target.value }))} bg={colors.bgInput}
                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                 >
                   <option value="adjustment">{t("adjustment")}</option>
                   <option value="sale">{t("sale")}</option>
                   <option value="waste">{t("waste")}</option>
                   <option value="expired">{t("expired")}</option>
                   <option value="return">{t("return")}</option>
                 </Select>
               </FormControl>
               <FormControl>
                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("notes")}</FormLabel>
                 <Input value={adjustForm.notes} onChange={(e) => setAdjustForm((f) => ({ ...f, notes: e.target.value }))} bg={colors.bgInput}
                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                 />
               </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>{t("cancel")}</Button>
            <Button colorScheme="teal" onClick={submitAdjust}>{t("save")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
