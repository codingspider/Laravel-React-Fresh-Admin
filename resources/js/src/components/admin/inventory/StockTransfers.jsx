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
import { STOCK_TRANSFERS, RECEIVE_STOCK_TRANSFER, LIST_BRANCH, LIST_INVENTORY_ITEM } from "../../../routes/apiRoutes";
import { STOCK_OVERVIEW_PATH, DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";

export default function StockTransfers() {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(15);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [branches, setBranches] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ from_branch_id: "", to_branch_id: "", notes: "", items: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  const toast = useToast();
  const colors = useThemeColors();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(STOCK_TRANSFERS, {
        params: { page: pageIndex + 1, per_page: pageSize, status: statusFilter || "", search: globalFilter || "" },
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
  }, [pageIndex, pageSize, statusFilter, globalFilter]);

  useEffect(() => {
    const app_name = localStorage.getItem("app_name");
    document.title = `${app_name} | ${t("stock_transfers")}`;
    fetchData();
    Promise.all([
      api.get(`${LIST_BRANCH}?per_page=200`),
      api.get(`${LIST_INVENTORY_ITEM}?per_page=200`),
    ]).then(([b, i]) => {
      const unwrap = (r) => r.data?.data?.data || r.data?.data || [];
      setBranches(unwrap(b));
      setItems(unwrap(i));
    }).catch(() => {});
  }, [fetchData, t]);

  const openCreate = () => {
    setForm({ from_branch_id: "", to_branch_id: "", notes: "", items: [{ item_id: "", quantity: "" }] });
    onOpen();
  };

  const submitCreate = async () => {
    setIsSubmitting(true);
    try {
      const itemsPayload = form.items.filter((i) => i.item_id).map((i) => ({ item_id: Number(i.item_id), quantity: Number(i.quantity) || 0 }));
      const res = await api.post(STOCK_TRANSFERS, { ...form, from_branch_id: Number(form.from_branch_id), to_branch_id: Number(form.to_branch_id), items: itemsPayload });
      toast({ title: res.data.message || t("transfer_created"), status: "success", duration: 3000, isClosable: true });
      onClose();
      fetchData();
    } catch (err) {
      toast({ title: t("error"), description: err?.response?.data?.message || t("something_went_wrong"), status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const receiveTransfer = async (id) => {
    try {
      const res = await api.post(RECEIVE_STOCK_TRANSFER(id));
      toast({ title: res.data.message || t("transfer_received"), status: "success", duration: 3000, isClosable: true });
      fetchData();
    } catch (err) {
      toast({ title: t("error"), description: err?.response?.data?.message || t("something_went_wrong"), status: "error", duration: 3000, isClosable: true });
    }
  };

  const columns = [
    {
      header: "#",
      cell: ({ row }) => <Text fontSize="sm" fontWeight="500" color={colors.textMuted}>{row.index + 1}</Text>,
    },
    {
      header: t("reference_number"),
      accessorKey: "reference_number",
      cell: ({ getValue }) => <Text fontSize="sm" fontWeight="600">{getValue()}</Text>,
    },
    {
      header: t("from_branch"),
      accessorKey: "fromBranch",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue()?.name || "-"}</Text>,
    },
    {
      header: t("to_branch"),
      accessorKey: "toBranch",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue()?.name || "-"}</Text>,
    },
    {
      header: t("items"),
      accessorKey: "items",
      cell: ({ getValue }) => <Text fontSize="sm">{(getValue() || []).length}</Text>,
    },
    {
      header: t("status"),
      accessorKey: "status",
      cell: ({ getValue }) => {
        const map = { pending: "yellow", in_transit: "blue", received: "green", rejected: "red" };
        return <Badge colorScheme={map[getValue()] || "gray"} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="600">{getValue()}</Badge>;
      },
    },
    {
      header: t("actions"),
      cell: ({ row }) =>
        row.original.status === "in_transit" ? (
          <Button size="xs" colorScheme="teal" onClick={() => receiveTransfer(row.original.id)}>{t("mark_received")}</Button>
        ) : (
          <Text fontSize="xs" color={colors.textMuted}>-</Text>
        ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t("stock_transfers")}
        subtitle={t("transfer_stock_between_branches")}
        breadcrumbs={[{ label: t("dashboard"), path: DASHBOARD_PATH }, { label: t("stock_management"), path: STOCK_OVERVIEW_PATH }, { label: t("transfers"), isCurrent: true }]}
      >
        <Button colorScheme="teal" leftIcon={<AddIcon />} onClick={openCreate}>{t("create_transfer")}</Button>
        <TableExportButtons data={data} columns={columns} filename="stock-transfers" />
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
          <Select maxW="170px" size="md" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPageIndex(0); }} placeholder={t("all_status")} bg={colors.bgInput}
            borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
          >
            <option value="pending">pending</option>
            <option value="in_transit">in_transit</option>
            <option value="received">received</option>
            <option value="rejected">rejected</option>
          </Select>
        </TanStackTable>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={colors.bgCard}>
          <ModalHeader>{t("create_transfer")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
             <Flex direction="column" gap={4}>
               <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                 <FormControl isRequired>
                   <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("from_branch")}</FormLabel>
                   <Select value={form.from_branch_id} onChange={(e) => setForm((f) => ({ ...f, from_branch_id: e.target.value }))} placeholder={t("select_branch")} bg={colors.bgInput}
                     borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                   >
                     {(Array.isArray(branches) ? branches : []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                   </Select>
                 </FormControl>
                 <FormControl isRequired>
                   <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("to_branch")}</FormLabel>
                   <Select value={form.to_branch_id} onChange={(e) => setForm((f) => ({ ...f, to_branch_id: e.target.value }))} placeholder={t("select_branch")} bg={colors.bgInput}
                     borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                   >
                     {(Array.isArray(branches) ? branches : []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                   </Select>
                 </FormControl>
               </SimpleGrid>
               <FormControl>
                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("notes")}</FormLabel>
                 <Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} bg={colors.bgInput}
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
