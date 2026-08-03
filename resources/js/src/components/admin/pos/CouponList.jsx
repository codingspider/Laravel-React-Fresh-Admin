import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Text,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal, Edit, Trash2, Plus } from 'lucide-react';
import api from '../../../axios';
import TanStackTable from '../../../TanStackTable';
import PageHeader from '../../ui/PageHeader';
import TableExportButtons from '../../ui/TableExportButtons';
import { POS_COUPONS, POS_COUPON } from '../../../routes/apiRoutes';
import { DASHBOARD_PATH } from '../../../routes/superAdminRoutes';
import useThemeColors from '../../../hooks/useThemeColors';
import { usePermission } from '../../../context/PermissionContext';
import CouponFormModal from './CouponFormModal';

export default function CouponList() {
  const { t } = useTranslation();
  const toast = useToast();
  const colors = useThemeColors();
  const { can } = usePermission();

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(15);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const fetchData = useCallback(async (signal) => {
    try {
      setIsLoading(true);
      const res = await api.get(POS_COUPONS, {
        params: {
          page: pageIndex + 1,
          per_page: pageSize,
          search: search || "",
        },
        signal,
      });
      const items = res.data?.data?.data || res.data?.data || [];
      const total = res.data?.meta?.total || res.data?.data?.total || items.length;
      setData(items);
      setPageCount(Math.ceil(total / pageSize));
      setTotalItems(total);
    } catch (err) {
      if (err?.code !== "ERR_CANCELED" && err?.name !== "CanceledError" && err?.name !== "AbortError") {
        console.error("fetchData error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, search, pageSize]);

  useEffect(() => {
    const app_name = localStorage.getItem("app_name");
    document.title = `${app_name} | ${t("coupons")}`;
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData, t]);

  const openCreate = () => {
    setEditingCoupon(null);
    setModalOpen(true);
  };

  const openEdit = (coupon) => {
    setEditingCoupon(coupon);
    setModalOpen(true);
  };

  const handleSaved = (msg) => {
    toast({ title: msg, status: "success", duration: 3000, isClosable: true });
    setModalOpen(false);
    setEditingCoupon(null);
    fetchData();
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm(t("are_you_sure"))) return;
    try {
      const res = await api.delete(POS_COUPON(id));
      toast({ title: res.data?.message || t("coupon_deleted"), status: "success", duration: 3000, isClosable: true });
      fetchData();
    } catch (err) {
      toast({ title: t("error_deleting_data"), status: "error", duration: 3000, isClosable: true });
    }
  };

  const columns = [
    {
      header: "#",
      cell: ({ row }) => (
        <Text fontSize="sm" fontWeight="500" color={colors.textMuted}>{row.index + 1}</Text>
      ),
    },
    {
      header: t("code"),
      accessorKey: "code",
      cell: ({ getValue }) => (
        <Text fontSize="sm" fontWeight="700" fontFamily="mono">{getValue()}</Text>
      ),
    },
    {
      header: t("type"),
      accessorKey: "type",
      cell: ({ getValue }) => {
        const type = getValue();
        return (
          <Badge colorScheme={type === "fixed" ? "blue" : "purple"} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="600">
            {type === "fixed" ? t("fixed") : "%"}
          </Badge>
        );
      },
    },
    {
      header: t("value"),
      accessorKey: "value",
      cell: ({ getValue, row }) => {
        const val = getValue();
        const type = row.original.type;
        return <Text fontSize="sm">{type === "fixed" ? val : `${val}%`}</Text>;
      },
    },
    {
      header: t("min_order"),
      accessorKey: "min_order_amount",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue() || "-"}</Text>,
    },
    {
      header: t("used"),
      accessorKey: "used_count",
      cell: ({ getValue, row }) => (
        <Text fontSize="sm" color={colors.textSecondary}>
          {getValue()}{row.original.usage_limit ? `/${row.original.usage_limit}` : ""}
        </Text>
      ),
    },
    {
      header: t("status"),
      accessorKey: "is_active",
      cell: ({ getValue }) => {
        const active = getValue();
        return (
          <Badge colorScheme={active ? "green" : "red"} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="600">
            {active ? t("active") : t("inactive")}
          </Badge>
        );
      },
    },
    {
      header: t("expires"),
      accessorKey: "expires_at",
      cell: ({ getValue }) => (
        <Text fontSize="sm">{getValue() ? new Date(getValue()).toLocaleDateString() : "-"}</Text>
      ),
    },
    {
      header: t("actions"),
      cell: ({ row }) => (
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<Icon as={MoreHorizontal} boxSize={4} />}
            variant="ghost"
            size="sm"
            borderRadius="lg"
            aria-label={t("actions")}
          />
          <MenuList minW="140px" p={1.5}>
            <MenuItem
              icon={<Icon as={Edit} boxSize={4} />}
              borderRadius="md"
              fontSize="sm"
              onClick={() => openEdit(row.original)}
            >
              {t("edit")}
            </MenuItem>
            <MenuItem
              icon={<Icon as={Trash2} boxSize={4} />}
              borderRadius="md"
              fontSize="sm"
              color="red.500"
              _hover={{ bg: "red.50", _dark: { bg: "red.900" } }}
              onClick={() => deleteCoupon(row.original.id)}
            >
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
        title={t("coupon_management")}
        subtitle={t("manage_coupons")}
        breadcrumbs={[
          { label: t("dashboard"), path: DASHBOARD_PATH },
          { label: t("coupons"), isCurrent: true },
        ]}
      >
        {can('view_pos') && (
          <Button variant="primary" leftIcon={<Icon as={Plus} boxSize={4} />} size="md" onClick={openCreate}>
            {t("create_coupon")}
          </Button>
        )}
        <TableExportButtons data={data} columns={columns} filename="coupons" />
      </PageHeader>

      <Box
        bg={colors.bgCard}
        p={{ base: 4, md: 6 }}
        borderRadius="xl"
        boxShadow="card"
        border="1px solid"
        borderColor={colors.borderDefault}
      >
        <TanStackTable
          columns={columns}
          data={data}
          onSearch={(value) => { setSearch(value); setPageIndex(0); }}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          pageCount={pageCount}
          isLoading={isLoading}
          totalItems={totalItems}
          hideAddBtn="true"
        />
      </Box>

      <CouponFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingCoupon(null); }}
        coupon={editingCoupon}
        onSaved={handleSaved}
      />
    </Box>
  );
}
