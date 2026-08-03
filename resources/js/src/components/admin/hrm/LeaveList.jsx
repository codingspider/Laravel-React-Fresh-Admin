import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, useToast, Icon, IconButton, Text, Menu, MenuButton, MenuList,
  MenuItem, Badge, SimpleGrid, Heading, Select,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { MoreHorizontal, Edit, Trash2, Check, X } from "lucide-react";
import api from "../../../axios";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import TableExportButtons from "../../ui/TableExportButtons";
import useThemeColors from "../../../hooks/useThemeColors";
import {
  LIST_EMPLOYEE,
  DELETE_LEAVE,
  APPROVE_LEAVE,
} from "../../../routes/apiRoutes";
import {
  HRM_LEAVE_LIST_PATH,
  HRM_LEAVE_CREATE_PATH,
  DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";

export default function LeaveList() {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(15);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [summary, setSummary] = useState({});
  const [statusFilter, setStatusFilter] = useState("");
  const [employees, setEmployees] = useState([]);
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

    api.get("/leaves", { params })
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

  const fetchEmployees = () => {
    api.get(LIST_EMPLOYEE, { params: { per_page: 200 } })
      .then((res) => setEmployees(res.data?.data?.data || res.data?.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    const app_name = localStorage.getItem("app_name");
    document.title = `${app_name} | ${t("leave_requests")}`;
    fetchData();
    fetchEmployees();
  }, [pageIndex, globalFilter, statusFilter, t]);

  const deleteItem = async (id) => {
    if (!window.confirm(t("are_you_sure"))) return;
    try {
      const res = await api.delete(DELETE_LEAVE(id));
      toast({ title: res.data.message || t("leave_request_deleted"), status: "success", duration: 3000, isClosable: true });
      fetchData();
    } catch (err) {
      toast({ title: t("error"), status: "error", duration: 3000, isClosable: true });
    }
  };

  const approveItem = async (id, approved) => {
    try {
      const res = await api.post(APPROVE_LEAVE(id), { status: approved ? "approved" : "rejected" });
      toast({ title: res.data.message || t("leave_request_approved"), status: "success", duration: 3000, isClosable: true });
      fetchData();
    } catch (err) {
      toast({ title: t("error"), status: "error", duration: 3000, isClosable: true });
    }
  };

  const columns = [
    {
      header: "#",
      cell: ({ row }) => <Text fontSize="sm" fontWeight="500" color={colors.textMuted}>{row.index + 1}</Text>,
    },
    {
      header: t("employee"),
      accessorKey: "employee",
      cell: ({ getValue }) => (
        <Box>
          <Text fontSize="sm" fontWeight="600">{getValue()?.full_name || getValue()?.name || "-"}</Text>
          <Text fontSize="xs" color={colors.textMuted}>{getValue()?.employee_id || ""}</Text>
        </Box>
      ),
    },
    {
      header: t("type"),
      accessorKey: "type",
      cell: ({ getValue }) => <Text fontSize="sm" color={colors.textSecondary}>{getValue() || "-"}</Text>,
    },
    {
      header: t("start_date"),
      accessorKey: "start_date",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue() || "-"}</Text>,
    },
    {
      header: t("end_date"),
      accessorKey: "end_date",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue() || "-"}</Text>,
    },
    {
      header: t("days"),
      accessorKey: "days",
      cell: ({ getValue }) => <Text fontSize="sm" color={colors.textSecondary}>{getValue() || 0}</Text>,
    },
    {
      header: t("status"),
      accessorKey: "status",
      cell: ({ getValue }) => {
        const val = getValue();
        const colorMap = { pending: "yellow", approved: "green", rejected: "red", cancelled: "gray" };
        return (
          <Badge colorScheme={colorMap[val] || "gray"} variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs">
            {val || "pending"}
          </Badge>
        );
      },
    },
    {
      header: t("actions"),
      cell: ({ row }) => (
        <Menu>
          <MenuButton as={IconButton} icon={<Icon as={MoreHorizontal} boxSize={4} />} variant="ghost" size="sm" borderRadius="lg" aria-label={t("actions")} />
          <MenuList minW="200px" p={1.5}>
            {row.original.status === "pending" && (
              <>
                <MenuItem icon={<Icon as={Check} boxSize={4} />} borderRadius="md" fontSize="sm" onClick={() => approveItem(row.original.id, true)}>
                  {t("approve")}
                </MenuItem>
                <MenuItem icon={<Icon as={X} boxSize={4} />} borderRadius="md" fontSize="sm" color="red.500" onClick={() => approveItem(row.original.id, false)}>
                  {t("reject")}
                </MenuItem>
              </>
            )}
            <MenuItem icon={<Icon as={Edit} boxSize={4} />} borderRadius="md" fontSize="sm" onClick={() => navigate(`/hrm/leave/edit/${row.original.id}`)}>
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
        title={t("leave_requests")}
        subtitle={t("manage_leave_requests")}
        breadcrumbs={[{ label: t("dashboard"), path: DASHBOARD_PATH }, { label: t("leave_requests"), isCurrent: true }]}
        action={HRM_LEAVE_CREATE_PATH}
        actionLabel={t("add_leave_request")}
      >
        <TableExportButtons data={data} columns={columns} filename="leave-requests" />
      </PageHeader>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
        <Box bg={colors.bgCard} p={5} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
          <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("total_leave_requests")}</Text>
          <Heading size="lg" color="teal.500" mt={1}>{summary.total_leave_requests || 0}</Heading>
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
