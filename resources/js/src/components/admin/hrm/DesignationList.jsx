import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, useToast, Icon, IconButton, Text, Menu, MenuButton, MenuList,
  MenuItem, Badge, SimpleGrid, Heading,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../axios";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import TableExportButtons from "../../ui/TableExportButtons";
import useThemeColors from "../../../hooks/useThemeColors";
import {
  LIST_DESIGNATION,
  DELETE_DESIGNATION,
  LIST_DEPARTMENT,
} from "../../../routes/apiRoutes";
import {
  HRM_DESIGNATION_LIST_PATH,
  HRM_DESIGNATION_CREATE_PATH,
  DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";

export default function DesignationList() {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(15);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const colors = useThemeColors();

  const fetchData = () => {
    setIsLoading(true);
    const params = {
      page: pageIndex + 1,
      per_page: pageSize,
      search: globalFilter || "",
    };
    if (statusFilter) params.status = statusFilter;

    api.get(LIST_DESIGNATION, { params })
      .then((res) => {
        const items = res.data?.data?.data || res.data?.data || [];
        const total = res.data?.meta?.total || res.data?.data?.total || items.length;
        setData(items);
        setPageCount(Math.ceil(total / pageSize));
        setTotalItems(total);
      })
      .catch((err) => {
        console.error("fetchData error:", err);
        toast({ title: t("error"), status: "error", duration: 3000, isClosable: true });
      })
      .finally(() => setIsLoading(false));
  };

  const fetchDepartments = () => {
    api.get(LIST_DEPARTMENT, { params: { per_page: 200 } })
      .then((res) => setDepartments(res.data?.data?.data || res.data?.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    const app_name = localStorage.getItem("app_name");
    document.title = `${app_name} | ${t("designations")}`;
    fetchData();
    fetchDepartments();
  }, [pageIndex, globalFilter, statusFilter, pageSize, t]);

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
        await api.delete(DELETE_DESIGNATION(id));
        toast({ title: t("data_deleted_successfully"), status: "success", duration: 3000, isClosable: true });
        fetchData();
      } catch (error) {
        toast({ title: t("error_deleting_data"), description: error.response?.data?.message || t("something_went_wrong"), status: "error", duration: 3000, isClosable: true });
      }
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
          <Text fontSize="xs" color={colors.textMuted}>{row.original.slug || ""}</Text>
        </Box>
      ),
    },
    {
      header: t("department"),
      accessorKey: "department",
      cell: ({ getValue }) => <Text fontSize="sm" color={colors.textSecondary}>{getValue()?.name || "-"}</Text>,
    },
    {
      header: t("status"),
      accessorKey: "status",
      cell: ({ getValue }) => {
        const val = getValue();
        return (
          <Badge colorScheme={val === "active" ? "green" : "red"} variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs">
            {val || "inactive"}
          </Badge>
        );
      },
    },
    {
      header: t("actions"),
      cell: ({ row }) => (
        <Menu>
          <MenuButton as={IconButton} icon={<Icon as={MoreHorizontal} boxSize={4} />} variant="ghost" size="sm" borderRadius="lg" aria-label={t("actions")} />
          <MenuList minW="180px" p={1.5}>
            <MenuItem icon={<Icon as={Edit} boxSize={4} />} borderRadius="md" fontSize="sm" onClick={() => navigate(`/hrm/designation/edit/${row.original.id}`)}>
              {t("edit")}
            </MenuItem>
            <MenuItem icon={<Icon as={Trash2} boxSize={4} />} borderRadius="md" fontSize="sm" color="red.500" onClick={() => deleteItem(row.original.id)}>
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
        title={t("designations")}
        subtitle={t("manage_designations")}
        breadcrumbs={[{ label: t("dashboard"), path: DASHBOARD_PATH }, { label: t("designations"), isCurrent: true }]}
        action={HRM_DESIGNATION_CREATE_PATH}
        actionLabel={t("add_designation")}
      >
        <TableExportButtons data={data} columns={columns} filename="designations" />
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
        />
      </Box>
    </Box>
  );
}
