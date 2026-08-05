import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, useToast, Icon, IconButton, Text, Menu, MenuButton, MenuList,
  MenuItem, Badge, SimpleGrid, Heading,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { MoreHorizontal, Edit, Trash2, Plus } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../axios";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import TableExportButtons from "../../ui/TableExportButtons";
import useThemeColors from "../../../hooks/useThemeColors";
import {
  LIST_DEPARTMENT,
  DELETE_DEPARTMENT,
} from "../../../routes/apiRoutes";
import {
  HRM_DEPARTMENT_LIST_PATH,
  HRM_DEPARTMENT_CREATE_PATH,
  HRM_DEPARTMENT_EDIT_PATH,
  DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";

export default function DepartmentList() {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(15);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [summary, setSummary] = useState({});
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

    api.get(LIST_DEPARTMENT, { params })
      .then((res) => {
        const items = res.data?.data?.data || res.data?.data || [];
        const total = res.data?.meta?.total || res.data?.data?.total || items.length;
        setData(items);
        setPageCount(Math.ceil(total / pageSize));
        setTotalItems(total);
        setSummary(res.data?.summary || {});
      })
      .catch((err) => {
        console.error("fetchData error:", err);
        toast({ title: t("error"), status: "error", duration: 3000, isClosable: true });
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const app_name = localStorage.getItem("app_name");
    document.title = `${app_name} | ${t("departments")}`;
    fetchData();
  }, [pageIndex, globalFilter, statusFilter, pageSize]);

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
        await api.delete(DELETE_DEPARTMENT(id));
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
          {row.original.slug && <Text fontSize="xs" color={colors.textMuted}>{row.original.slug}</Text>}
        </Box>
      ),
    },
    {
      header: t("description"),
      accessorKey: "description",
      cell: ({ getValue }) => <Text fontSize="sm" color={colors.textSecondary}>{getValue() || "-"}</Text>,
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
            <MenuItem icon={<Icon as={Edit} boxSize={4} />} borderRadius="md" fontSize="sm" onClick={() => navigate(HRM_DEPARTMENT_EDIT_PATH(row.original.id))}>
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
        title={t("departments")}
        subtitle={t("manage_departments")}
        breadcrumbs={[{ label: t("dashboard"), path: DASHBOARD_PATH }, { label: t("departments"), isCurrent: true }]}
        action={HRM_DEPARTMENT_CREATE_PATH}
        actionLabel={t("add_department")}
      >
        <TableExportButtons data={data} columns={columns} filename="departments" />
      </PageHeader>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
        <Box bg={colors.bgCard} p={5} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
          <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("total_departments")}</Text>
          <Heading size="lg" color="teal.500" mt={1}>{summary.total_departments || 0}</Heading>
        </Box>
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
        />
      </Box>
    </Box>
  );
}
