import React, { useEffect, useState, useCallback } from "react";
import {
  Box, useToast, Text, Badge, Select, Button, SimpleGrid, Heading,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  useDisclosure, Input, FormControl, FormLabel, IconButton, Flex,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import api from "../../../axios";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import TableExportButtons from "../../ui/TableExportButtons";
import { STOCK_WASTES, LIST_BRANCH, LIST_INVENTORY_ITEM } from "../../../routes/apiRoutes";
import { STOCK_OVERVIEW_PATH, DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

export default function StockWaste() {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [typeFilter, setTypeFilter] = useState("");
  const [branches, setBranches] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ branch_id: "", type: "damage", reason: "", notes: "", items: [{ item_id: "", quantity: "" }] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  const toast = useToast();
  const colors = useThemeColors();
  const { formatAmount } = useCurrencyFormatter();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(STOCK_WASTES, {
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
    document.title = `${app_name} | ${t("stock_waste")}`;
    fetchData();
    Promise.all([
      api.get(`${LIST_BRANCH}?per_page=200`),
      api.get(`${LIST_INVENTORY_ITEM}?per_page=200`),
    ]).then(([b, i]) => {
      const unwrap = (r) => r.data?.data?.data || r.data?.data || [];
      setBranches(unwrap(b));
      setItems(unwrap(i));
    }).catch(() => { });
  }, [fetchData, t]);

  const openCreate = () => {
    setForm({ branch_id: "", type: "damage", reason: "", notes: "", items: [{ item_id: "", quantity: "" }] });
    onOpen();
  };

  const submitCreate = async () => {
    setIsSubmitting(true);
    try {
      const itemsPayload = form.items.filter((i) => i.item_id).map((i) => ({ item_id: Number(i.item_id), quantity: Number(i.quantity) || 0 }));
      const res = await api.post(STOCK_WASTES, { ...form, branch_id: form.branch_id ? Number(form.branch_id) : null, items: itemsPayload });
      toast({ title: res.data.message || t("waste_created"), status: "success", duration: 3000, isClosable: true });
      onClose();
      fetchData();
    } catch (err) {
      toast({ title: t("error"), description: err?.response?.data?.message || t("something_went_wrong"), status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsSubmitting(false);
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
      header: t("type"),
      accessorKey: "type",
      cell: ({ getValue }) => <Badge colorScheme="orange" variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs">{getValue()}</Badge>,
    },
    {
      header: t("branch"),
      accessorKey: "branch",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue()?.name || "-"}</Text>,
    },
    {
      header: t("total_quantity"),
      accessorKey: "total_quantity",
      cell: ({ getValue }) => <Text fontSize="sm" fontWeight="600">{getValue() ?? "0"}</Text>,
    },
    {
      header: t("total_value"),
      accessorKey: "total_value",
      cell: ({ getValue }) => <Text fontSize="sm">{formatAmount(getValue() || 0)}</Text>,
    },
    {
      header: t("reason"),
      accessorKey: "reason",
      cell: ({ getValue }) => <Text fontSize="sm" noOfLines={1}>{getValue() || "-"}</Text>,
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t("stock_waste")}
        subtitle={t("record_damaged_or_expired_stock")}
        breadcrumbs={[{ label: t("dashboard"), path: DASHBOARD_PATH }, { label: t("stock_management"), path: STOCK_OVERVIEW_PATH }, { label: t("waste"), isCurrent: true }]}
      >
        <TableExportButtons data={data} columns={columns} filename="stock-waste" />
        <Button colorScheme="teal" leftIcon={<AddIcon />} onClick={openCreate}>{t("record_waste")}</Button>
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
            <option value="damage">damage</option>
            <option value="expired">expired</option>
            <option value="spillage">spillage</option>
            <option value="other">other</option>
          </Select>
        </TanStackTable>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={colors.bgCard}>
          <ModalHeader>{t("record_waste")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" gap={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel} mb={2}>{t("branch")}</FormLabel>
                  <Select value={form.branch_id} onChange={(e) => setForm((f) => ({ ...f, branch_id: e.target.value }))} placeholder={t("select_branch")} bg={colors.bgInput}
                    borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                  >
                    {(Array.isArray(branches) ? branches : []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel} mb={2}>{t("type")}</FormLabel>
                  <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} bg={colors.bgInput}
                    borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                  >
                    <option value="damage">damage</option>
                    <option value="expired">expired</option>
                    <option value="spillage">spillage</option>
                    <option value="other">other</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel} mb={2}>{t("reason")}</FormLabel>
                <Input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} bg={colors.bgInput}
                  borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                />
              </FormControl>
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="sm" fontWeight="600">{t("items")}</Text>
                  <Button size="xs" colorScheme="teal" leftIcon={<AddIcon />} onClick={() => setForm((f) => ({ ...f, items: [...f.items, { item_id: "", quantity: "" }] }))}>{t("add_item")}</Button>
                </Flex>
                {form.items.map((line, index) => (
                  <Flex key={index} gap={2} mb={2}>
                    <Select value={line.item_id} onChange={(e) => setForm((f) => { const items = [...f.items]; items[index].item_id = e.target.value; return { ...f, items }; })} placeholder={t("select_item")} flex="2" bg={colors.bgInput}
                      borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                    >
                      {(Array.isArray(items) ? items : []).map((it) => <option key={it.id} value={it.id}>{it.name}</option>)}
                    </Select>
                    <Input type="number" min="0" step="0.01" placeholder={t("quantity")} value={line.quantity} onChange={(e) => setForm((f) => { const items = [...f.items]; items[index].quantity = e.target.value; return { ...f, items }; })} bg={colors.bgInput}
                      borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                    />
                    <IconButton size="sm" variant="ghost" colorScheme="red" icon={<DeleteIcon />} aria-label={t("remove")} onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }))} />
                  </Flex>
                ))}
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>{t("cancel")}</Button>
            <Button colorScheme="teal" isLoading={isSubmitting} onClick={submitCreate}>{t("save")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
