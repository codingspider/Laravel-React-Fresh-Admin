import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, useToast, Icon, IconButton, Text, Menu, MenuButton, MenuList,
  MenuItem, Badge, SimpleGrid, Heading, Select, Input
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
  LIST_EMPLOYEE,
} from "../../../routes/apiRoutes";
import {
  HRM_ATTENDANCE_LIST_PATH,
  HRM_ATTENDANCE_CREATE_PATH,
  DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";

export default function AttendanceList() {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(15);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [summary, setSummary] = useState({});
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [employees, setEmployees] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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
    if (employeeFilter) params.employee_id = employeeFilter;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;

    api.get("/attendance", { params })
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
      .catch(() => { });
  };

  useEffect(() => {
    const app_name = localStorage.getItem("app_name");
    document.title = `${app_name} | ${t("attendance")}`;
    fetchData();
    fetchEmployees();
  }, [pageIndex, globalFilter, employeeFilter, dateFrom, dateTo, t]);

  const columns = [
    {
      header: "#",
      cell: ({ row }) => <Text fontSize="sm" fontWeight="500" color={colors.textMuted}>{row.index + 1 + pageIndex * pageSize}</Text>,
    },
    {
      header: t("employee"),
      accessorKey: "employee",
      cell: ({ getValue, row }) => (
        <Box>
          <Text fontSize="sm" fontWeight="600">{getValue()?.full_name || getValue()?.name || "-"}</Text>
          <Text fontSize="xs" color={colors.textMuted}>{getValue()?.employee_id || ""}</Text>
        </Box>
      ),
    },
    {
      header: t("date"),
      accessorKey: "date",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue() || "-"}</Text>,
    },
    {
      header: t("clock_in"),
      accessorKey: "clock_in",
      cell: ({ getValue }) => <Text fontSize="sm" color={colors.textSecondary}>{getValue() || "-"}</Text>,
    },
    {
      header: t("clock_out"),
      accessorKey: "clock_out",
      cell: ({ getValue }) => <Text fontSize="sm" color={colors.textSecondary}>{getValue() || "-"}</Text>,
    },
    {
      header: t("work_hours"),
      accessorKey: "work_hours",
      cell: ({ getValue }) => <Text fontSize="sm" color={colors.textSecondary}>{getValue() || "0"}</Text>,
    },
    {
      header: t("status"),
      accessorKey: "status",
      cell: ({ getValue }) => {
        const val = getValue();
        return (
          <Badge colorScheme={val === "present" ? "green" : val === "absent" ? "red" : val === "late" ? "yellow" : val === "half_day" ? "blue" : "purple"} variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs">
            {val || "present"}
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
            <MenuItem icon={<Icon as={Edit} boxSize={4} />} borderRadius="md" fontSize="sm" onClick={() => navigate(`/hrm/attendance/edit/${row.original.id}`)}>
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
        await api.delete(`/attendance/${id}`);
        toast({ title: t("data_deleted_successfully"), status: "success", duration: 3000, isClosable: true });
        fetchData();
      } catch (error) {
        toast({ title: t("error_deleting_data"), description: error.response?.data?.message || t("something_went_wrong"), status: "error", duration: 3000, isClosable: true });
      }
    }
  };

  return (
    <Box>
      <PageHeader
        title={t("attendance")}
        subtitle={t("manage_attendance")}
        breadcrumbs={[{ label: t("dashboard"), path: DASHBOARD_PATH }, { label: t("attendance"), isCurrent: true }]}
        action={HRM_ATTENDANCE_CREATE_PATH}
        actionLabel={t("add_attendance")}
      >
        <TableExportButtons data={data} columns={columns} filename="attendance" />
      </PageHeader>

      <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} mb={4}>
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <Select size="sm" value={employeeFilter} onChange={(e) => { setEmployeeFilter(e.target.value); setPageIndex(0); }} bg={colors.bgInput}
            borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}>
            <option value="">{t("all_employees")}</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.full_name || e.name}</option>
            ))}
          </Select>
          <Input type="date" size="sm" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPageIndex(0); }} bg={colors.bgInput}
            borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} />
          <Input type="date" size="sm" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPageIndex(0); }} bg={colors.bgInput}
            borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} />
        </SimpleGrid>
      </Box>

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
