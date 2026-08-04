import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, useToast, Icon, IconButton, Text, Menu, MenuButton, MenuList,
  MenuItem, Badge, SimpleGrid, Heading, Select,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../axios";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import TableExportButtons from "../../ui/TableExportButtons";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";
import {
  LIST_PAYROLL,
  DELETE_PAYROLL,
} from "../../../routes/apiRoutes";
import {
  HRM_PAYROLL_LIST_PATH,
  HRM_PAYROLL_CREATE_PATH,
  HRM_PAYROLL_EDIT_PATH,
  HRM_PAYROLL_VIEW_PATH,
  DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";

export default function PayrollList() {
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
  const { formatAmount } = useCurrencyFormatter();

  const fetchData = () => {
    setIsLoading(true);
    const params = {
      page: pageIndex + 1,
      per_page: pageSize,
      search: globalFilter || "",
    };
    if (statusFilter) params.status = statusFilter;

    api.get(LIST_PAYROLL, { params })
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
    document.title = `${app_name} | ${t("payroll")}`;
    fetchData();
  }, [pageIndex, globalFilter, statusFilter, pageSize]);

  const deleteItem = (id) => {
    Swal.fire({
      title: t("are_you_sure"),
      text: t("this_action_cannot_be_undone"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("yes_delete_it"),
      cancelButtonText: t("cancel"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(DELETE_PAYROLL(id));
          toast({ title: res.data.message || t("payroll_deleted"), status: "success", duration: 3000, isClosable: true });
          fetchData();
        } catch (err) {
          toast({ title: t("error"), status: "error", duration: 3000, isClosable: true });
        }
      }
    });
  };

  const columns = [
    {
      header: "#",
      cell: ({ row }) => <Text fontSize="sm" fontWeight="500" color={colors.textMuted}>{row.index + 1}</Text>,
    },
    {
      header: t("employee"),
      cell: ({ row }) => (
        <Box>
          <Text fontSize="sm" fontWeight="600">{row.original.employee?.first_name} {row.original.employee?.last_name}</Text>
          <Text fontSize="xs" color={colors.textMuted}>{row.original.employee?.employee_id}</Text>
        </Box>
      ),
    },
    {
      header: t("period"),
      cell: ({ row }) => {
        const fmtDate = (d) => {
          if (!d) return "-";
          const dateStr = String(d).split("T")[0];
          const [y, m, day] = dateStr.split("-").map(Number);
          const date = new Date(y, m - 1, day);
          return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
        };
        const start = fmtDate(row.original.pay_period_start);
        const end = fmtDate(row.original.pay_period_end);
        return (
          <Text fontSize="sm" color={colors.textSecondary}>
            {start} - {end}
          </Text>
        );
      },
    },
    {
      header: t("basic_salary"),
      accessorKey: "basic_salary",
      cell: ({ getValue }) => <Text fontSize="sm" color={colors.textSecondary}>{formatAmount(getValue())}</Text>,
    },
    {
      header: t("net_salary"),
      accessorKey: "net_salary",
      cell: ({ getValue }) => <Text fontSize="sm" fontWeight="bold" color="green.500">{formatAmount(getValue())}</Text>,
    },
    {
      header: t("status"),
      accessorKey: "status",
      cell: ({ getValue }) => {
        const val = getValue();
        const colorScheme = val === "paid" ? "green" : val === "cancelled" ? "red" : "yellow";
        return (
          <Badge colorScheme={colorScheme} variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs">
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
          <MenuList minW="180px" p={1.5}>
            <MenuItem icon={<Icon as={Eye} boxSize={4} />} borderRadius="md" fontSize="sm" onClick={() => navigate(HRM_PAYROLL_VIEW_PATH(row.original.id))}>
              {t("view")}
            </MenuItem>
            <MenuItem icon={<Icon as={Edit} boxSize={4} />} borderRadius="md" fontSize="sm" onClick={() => navigate(HRM_PAYROLL_EDIT_PATH(row.original.id))}>
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
        title={t("payroll")}
        subtitle={t("manage_payroll")}
        breadcrumbs={[{ label: t("dashboard"), path: DASHBOARD_PATH }, { label: t("payroll"), isCurrent: true }]}
        action={HRM_PAYROLL_CREATE_PATH}
        actionLabel={t("add_payroll")}
      >
        <TableExportButtons data={data} columns={columns} filename="payroll" />
      </PageHeader>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
        <Box bg={colors.bgCard} p={5} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
          <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("total_payroll_records")}</Text>
          <Heading size="lg" color="teal.500" mt={1}>{summary.total_payroll || totalItems}</Heading>
        </Box>
      </SimpleGrid>

      <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
        <Box mb={4}>
          <Select
            placeholder={t("all_statuses")}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPageIndex(0); }}
            maxW="200px"
            bg={colors.bgInput}
            border="1px solid"
            borderColor={colors.borderInput}
            borderRadius="md"
            focusBorderColor="teal.500"
            _hover={{ borderColor: "gray.300" }}
            size="sm"
            transition="all 0.2s"
          >
            <option value="pending">{t("pending")}</option>
            <option value="paid">{t("paid")}</option>
            <option value="cancelled">{t("cancelled")}</option>
          </Select>
        </Box>
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
