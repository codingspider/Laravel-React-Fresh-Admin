import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate, Link as ReactRouterLink } from "react-router-dom";
import {
  Badge, Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Card, CardBody,
  Text, useToast, HStack, useColorModeValue,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import TanStackTable from "../../../TanStackTable";
import api from "../../../axios";
import { DELETE_SUPPLIER, LIST_SUPPLIER } from "../../../routes/apiRoutes";
import { DASHBOARD_PATH, SUPPLIER_ADD_PATH, SUPPLIER_EDIT_PATH } from "../../../routes/superAdminRoutes";

export default function SupplierList() {
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
      const res = await api.get(LIST_SUPPLIER, {
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
        toast({ title: t("error_loading_suppliers"), status: "error", duration: 3000, isClosable: true });
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [pageIndex]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const deleteItem = async (id) => {
    const result = await Swal.fire({
      title: t("are_you_sure"),
      text: t("supplier_will_be_deleted"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("confirm_delete"),
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(DELETE_SUPPLIER(id));
      toast({ title: t("supplier_deleted"), status: "success", duration: 3000, isClosable: true });
      fetchData();
    } catch {
      toast({ title: t("error"), status: "error", duration: 3000, isClosable: true });
    }
  };

  const columns = useMemo(() => [
    { header: t("sl_no"), cell: ({ row }) => row.index + 1 },
    { header: t("name"), accessorKey: "name" },
    { header: t("company"), accessorKey: "company", cell: ({ row }) => row.original.company || "-" },
    { header: t("email"), accessorKey: "email", cell: ({ row }) => row.original.email || "-" },
    { header: t("phone"), accessorKey: "phone", cell: ({ row }) => row.original.phone || "-" },
    { header: t("city"), accessorKey: "city", cell: ({ row }) => row.original.city || "-" },
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
            cursor="pointer" onClick={() => navigate(SUPPLIER_EDIT_PATH(row.original.id))}
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
              <BreadcrumbLink>{t("all_suppliers")}</BreadcrumbLink>
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
            addURL={SUPPLIER_ADD_PATH}
            totalItems={totalItems}
            searchPlaceholder={`${t("search")}...`}
          />
        </CardBody>
      </Card>
    </Box>
  );
}
