import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate, Link as ReactRouterLink } from "react-router-dom";
import {
  Badge, Box, Card, CardBody, Text, useToast, HStack, useColorModeValue,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import api from "../../../axios";
import { DELETE_CURRENCY, LIST_CURRENCY } from "../../../routes/apiRoutes";
import { DASHBOARD_PATH, CURRENCY_ADD_PATH, CURRENCY_EDIT_PATH } from "../../../routes/superAdminRoutes";

export default function CurrencyList() {
  const [data, setData] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 15;
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchData = useCallback(async (search = "") => {
    if (!mountedRef.current) return;
    try {
      setIsLoading(true);
      const res = await api.get(LIST_CURRENCY, {
        params: { page: pageIndex + 1, per_page: pageSize, search },
      });
      if (!mountedRef.current) return;
      const items = res.data?.data || [];
      const total = res.data?.meta?.total || items.length;
      setData(items);
      setPageCount(Math.ceil(total / pageSize));
      setTotalItems(total);
    } catch {
      if (mountedRef.current) {
        toast({ title: t("error_loading_currencies"), status: "error", duration: 3000, isClosable: true });
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [pageIndex]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const deleteItem = async (id) => {
    const result = await Swal.fire({
      title: t("are_you_sure"),
      text: t("currency_will_be_deleted"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("confirm_delete"),
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(DELETE_CURRENCY(id));
      toast({ title: t("currency_deleted"), status: "success", duration: 3000, isClosable: true });
      fetchData();
    } catch {
      toast({ title: t("error"), status: "error", duration: 3000, isClosable: true });
    }
  };

  const columns = useMemo(() => [
    { header: t("sl_no"), cell: ({ row }) => row.index + 1 },
    { header: t("name"), accessorKey: "name" },
    { header: t("code"), accessorKey: "code" },
    { header: t("symbol"), accessorKey: "symbol" },
    {
      header: t("symbol_position"),
      cell: ({ row }) => (
        <Text>{row.original.symbol_first ? t("before") : t("after")}</Text>
      ),
    },
    { header: t("decimal_mark"), accessorKey: "decimal_mark" },
    { header: t("thousands_separator"), accessorKey: "thousands_separator" },
    { header: t("precision"), accessorKey: "precision" },
    {
      header: t("status"),
      cell: ({ row }) => (
        <Badge colorScheme={row.original.is_active ? "green" : "red"}>
          {row.original.is_active ? t("active") : t("inactive")}
        </Badge>
      ),
    },
    {
      header: t("actions"),
      cell: ({ row }) => (
        <HStack spacing={1}>
          <Box
            as="button" p={2} borderRadius="md" border="1px solid" borderColor={borderColor}
            cursor="pointer" onClick={() => navigate(CURRENCY_EDIT_PATH(row.original.id))}
            _hover={{ bg: "gray.100", _dark: { bg: "gray.600" } }}
          >
            <EditIcon boxSize={4} />
          </Box>
          <Box
            as="button" p={2} borderRadius="md" border="1px solid" borderColor={borderColor}
            cursor="pointer" onClick={() => deleteItem(row.original.id)}
            _hover={{ bg: "red.50", _dark: { bg: "red.900" } }}
          >
            <DeleteIcon color="red.500" boxSize={4} />
          </Box>
        </HStack>
      ),
    },
  ], [t, borderColor, navigate, toast]);

  return (
    <Box>
      <PageHeader
        title="all_currencies"
        breadcrumbs={[
          { label: t("dashboard"), path: DASHBOARD_PATH },
          { label: t("all_currencies"), isCurrent: true },
        ]}
        action={CURRENCY_ADD_PATH}
        actionLabel="add_currency"
      />

      <Card>
        <CardBody>
          <TanStackTable
            columns={columns}
            data={data}
            pageIndex={pageIndex}
            pageSize={pageSize}
            setPageIndex={setPageIndex}
            pageCount={pageCount}
            isLoading={isLoading}
            addURL={CURRENCY_ADD_PATH}
            totalItems={totalItems}
            searchPlaceholder={`${t("search")}...`}
          />
        </CardBody>
      </Card>
    </Box>
  );
}
