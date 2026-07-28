import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate, Link as ReactRouterLink } from "react-router-dom";
import {
  Badge, Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Card, CardBody,
  Text, useToast, HStack, VStack, Image, useColorModeValue,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import TanStackTable from "../../../TanStackTable";
import api from "../../../axios";
import { DELETE_INVENTORY_ITEM, LIST_INVENTORY_ITEM } from "../../../routes/apiRoutes";
import { DASHBOARD_PATH, INVENTORY_ITEM_ADD_PATH, INVENTORY_ITEM_EDIT_PATH } from "../../../routes/superAdminRoutes";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

export default function InventoryItemList() {
  const [data, setData] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const { t } = useTranslation();
  const { formatAmount } = useCurrencyFormatter();
  const navigate = useNavigate();
  const toast = useToast();
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchItems = useCallback(async (search = "") => {
    if (!mountedRef.current) return;
    try {
      setIsLoading(true);
      const res = await api.get(LIST_INVENTORY_ITEM, {
        params: { page: pageIndex + 1, per_page: pageSize, search },
      });
      if (!mountedRef.current) return;
      const items = res.data?.data?.data || [];
      const total = res.data?.data?.total || items.length;
      setData(items);
      setPageCount(Math.ceil(total / pageSize));
      setTotalItems(total);
    } catch {
      if (mountedRef.current) {
        toast({ title: t("error_loading_inventory"), status: "error", duration: 3000, isClosable: true });
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [pageIndex, toast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const deleteItem = async (id) => {
    const result = await Swal.fire({
      title: t("are_you_sure"),
      text: t("inventory_item_will_be_deleted"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("confirm_delete"),
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(DELETE_INVENTORY_ITEM(id));
      toast({ title: t("inventory_item_deleted"), status: "success", duration: 3000, isClosable: true });
      fetchItems();
    } catch {
      toast({ title: t("error_deleting_inventory"), status: "error", duration: 3000, isClosable: true });
    }
  };

  const columns = useMemo(() => [
    { header: t("sl_no"), cell: ({ row }) => row.index + 1 },
    {
      header: t("image"),
      accessorKey: "image",
      cell: ({ row }) => (
        <Box boxSize="44px" borderRadius="md" overflow="hidden" bg="gray.100">
          {row.original.image_url ? (
            <Image src={row.original.image_url} alt={row.original.name} boxSize="44px" objectFit="cover" />
          ) : null}
        </Box>
      ),
    },
    { header: t("name"), accessorKey: "name" },
    { header: t("sku"), accessorKey: "sku" },
    { header: t("unit"), accessorKey: "unit" },
    {
      header: t("category"),
      cell: ({ row }) => row.original.category?.name || "-",
    },
    {
      header: t("supplier"),
      cell: ({ row }) => row.original.supplier?.name || "-",
    },
    {
      header: t("quantity"),
      accessorKey: "quantity",
      cell: ({ row }) => {
        const qty = parseFloat(row.original.quantity || 0);
        const reorder = parseFloat(row.original.reorder_level || 0);
        const isLow = qty <= reorder && reorder > 0;
        return (
          <Badge colorScheme={isLow ? "red" : "green"}>
            {qty} {row.original.unit}
          </Badge>
        );
      },
    },
    { header: t("cost_price"), accessorKey: "cost_price", cell: ({ row }) => formatAmount(parseFloat(row.original.cost_price || 0)) },
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
            cursor="pointer" onClick={() => navigate(INVENTORY_ITEM_EDIT_PATH(row.original.id))}
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
      <Card mb={5}>
        <CardBody>
          <Breadcrumb fontSize={{ base: "sm", md: "md" }}>
            <BreadcrumbItem>
              <BreadcrumbLink as={ReactRouterLink} to={DASHBOARD_PATH}>{t("dashboard")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{t("all_inventory_items")}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </CardBody>
      </Card>

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
            addURL={INVENTORY_ITEM_ADD_PATH}
            totalItems={totalItems}
            searchPlaceholder={`${t("search")}...`}
          />
        </CardBody>
      </Card>
    </Box>
  );
}
