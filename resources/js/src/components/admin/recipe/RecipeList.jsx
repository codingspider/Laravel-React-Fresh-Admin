import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, useToast, Icon, IconButton, Text, Badge, Menu, MenuButton, MenuList, MenuItem, Select,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { MoreHorizontal } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../axios";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import TableExportButtons from "../../ui/TableExportButtons";
import { LIST_RECIPE, DELETE_RECIPE, RECIPE_OPTIONS } from "../../../routes/apiRoutes";
import { RECIPE_LIST_PATH, RECIPE_ADD_PATH, RECIPE_EDIT_PATH, DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";

export default function RecipeList() {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(15);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const colors = useThemeColors();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(LIST_RECIPE, {
        params: {
          page: pageIndex + 1,
          per_page: pageSize,
          search: globalFilter || "",
          category_id: categoryFilter || "",
        },
      });
      const items = res.data?.data?.data || res.data?.data || [];
      const total = res.data?.meta?.total || res.data?.data?.total || items.length;
      setData(items);
      setPageCount(Math.ceil(total / pageSize));
      setTotalItems(total);
    } catch (err) {
      console.error("fetchData error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, globalFilter, pageSize, categoryFilter]);

  useEffect(() => {
    const app_name = localStorage.getItem("app_name");
    document.title = `${app_name} | ${t("recipe_management")}`;
    fetchData();
    api.get(RECIPE_OPTIONS).then((res) => setCategories(res.data?.data?.categories || [])).catch(() => {});
  }, [fetchData, t]);

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
        await api.delete(DELETE_RECIPE(id));
        toast({ title: t("data_deleted_successfully"), status: "success", duration: 3000, isClosable: true });
        fetchData();
      } catch (error) {
        toast({
          title: t("error_deleting_data"),
          description: error.response?.data?.message || t("something_went_wrong"),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const columns = [
    {
      header: "#",
      cell: ({ row }) => <Text fontSize="sm" fontWeight="500" color={colors.textMuted}>{row.index + 1}</Text>,
    },
    {
      header: t("name"),
      accessorKey: "name",
      cell: ({ getValue }) => <Text fontSize="sm" fontWeight="600">{getValue()}</Text>,
    },
    {
      header: t("category"),
      accessorKey: "category",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue()?.name || "-"}</Text>,
    },
    {
      header: t("selling_price"),
      accessorKey: "selling_price",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue() || "0.00"}</Text>,
    },
    {
      header: t("total_cost"),
      accessorKey: "total_cost",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue() || "0.00"}</Text>,
    },
    {
      header: t("profit"),
      accessorKey: "profit",
      cell: ({ getValue }) => (
        <Text fontSize="sm" fontWeight="600" color={Number(getValue()) >= 0 ? "green.500" : "red.500"}>
          {getValue() ?? "0.00"}
        </Text>
      ),
    },
    {
      header: t("profit_margin"),
      accessorKey: "profit_margin",
      cell: ({ getValue }) => <Text fontSize="sm">{getValue() ?? "0"}%</Text>,
    },
    {
      header: t("ingredients"),
      accessorKey: "ingredients",
      cell: ({ row }) => <Badge colorScheme="teal" variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs">{(row.original?.ingredients || []).length}</Badge>,
    },
    {
      header: t("status"),
      accessorKey: "status",
      cell: ({ getValue }) => {
        const active = getValue() === "active";
        return (
          <Badge colorScheme={active ? "green" : "red"} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="600">
            {active ? t("active") : t("inactive")}
          </Badge>
        );
      },
    },
    {
      header: t("actions"),
      cell: ({ row }) => (
        <Menu>
          <MenuButton as={IconButton} icon={<Icon as={MoreHorizontal} boxSize={4} />} variant="ghost" size="sm" borderRadius="lg" aria-label={t("actions")} />
          <MenuList minW="140px" p={1.5}>
            <MenuItem icon={<Icon as={EditIcon} boxSize={4} />} borderRadius="md" fontSize="sm" onClick={() => navigate(RECIPE_EDIT_PATH(row.original.id), { state: { recipe: row.original } })}>
              {t("edit")}
            </MenuItem>
            <MenuItem
              icon={<Icon as={DeleteIcon} boxSize={4} />} borderRadius="md" fontSize="sm" color="red.500"
              _hover={{ bg: "red.50", _dark: { bg: "red.900" } }} onClick={() => deleteItem(row.original.id)}
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
        title={t("recipe_management")}
        subtitle={t("manage_recipes_and_ingredients")}
        breadcrumbs={[{ label: t("dashboard"), path: DASHBOARD_PATH }, { label: t("recipes"), isCurrent: true }]}
        action={RECIPE_ADD_PATH}
        actionLabel={t("add_recipe")}
      >
        <TableExportButtons data={data} columns={columns} filename="recipes" />
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
          addURL={RECIPE_ADD_PATH}
          totalItems={totalItems}
        >
          <Select
            maxW="180px" size="md" value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPageIndex(0); }}
            placeholder={t("all_categories")} borderRadius="lg"
          >
            {(Array.isArray(categories) ? categories : []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </TanStackTable>
      </Box>
    </Box>
  );
}
