import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    useToast,
    Icon,
    IconButton,
    Text,
    Image,
    Badge,
    Flex,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Select,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { MoreHorizontal } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../axios";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import TableExportButtons from "../../ui/TableExportButtons";
import BranchFilter from "../../ui/BranchFilter";
import { LIST_INVENTORY_ITEM, DELETE_INVENTORY_ITEM } from "../../../routes/apiRoutes";
import {
    INVENTORY_ITEM_ADD_PATH,
    INVENTORY_ITEM_EDIT_PATH,
    DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

export default function InventoryItemList() {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(10);
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [statusFilter, setStatusFilter] = useState("");
    const [branchFilter, setBranchFilter] = useState(null);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(LIST_INVENTORY_ITEM, {
                params: {
                    page: pageIndex + 1,
                    per_page: pageSize,
                    search: globalFilter || "",
                    status: statusFilter || "",
                    branch_id: branchFilter || "",
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
    }, [pageIndex, globalFilter, pageSize, statusFilter, branchFilter]);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Inventory Item Management`;
        fetchData();
    }, [fetchData]);

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
                await api.delete(DELETE_INVENTORY_ITEM(id));
                toast({
                    title: t("data_deleted_successfully"),
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
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
            cell: ({ row }) => (
                <Text fontSize="sm" fontWeight="500" color="gray.500">
                    {row.index + 1 + pageIndex * pageSize}
                </Text>
            ),
        },
        {
            header: t("image"),
            accessorKey: "image_url",
            cell: ({ getValue }) => {
                const img = getValue();
                return img ? (
                    <Image src={img} alt="" boxSize="40px" borderRadius="md" objectFit="cover" />
                ) : (
                    <Text fontSize="sm" color="gray.400">-</Text>
                );
            },
        },
        {
            header: t("name"),
            accessorKey: "name",
            cell: ({ getValue }) => (
                <Text fontSize="sm" fontWeight="600">
                    {getValue()}
                </Text>
            ),
        },
        {
            header: t("sku"),
            accessorKey: "sku",
            cell: ({ getValue }) => (
                <Text fontSize="sm" fontFamily="mono">
                    {getValue() || "-"}
                </Text>
            ),
        },
        {
            header: t("unit"),
            accessorKey: "unit",
            cell: ({ getValue }) => (
                <Text fontSize="sm">{getValue() || "-"}</Text>
            ),
        },
        {
            header: t("category"),
            cell: ({ row }) => (
                <Text fontSize="sm">{row.original.category?.name || "-"}</Text>
            ),
        },
        {
            header: t("supplier"),
            cell: ({ row }) => (
                <Text fontSize="sm">{row.original.supplier?.name || "-"}</Text>
            ),
        },
        {
            header: t("quantity"),
            cell: ({ row }) => {
                const qty = row.original.quantity;
                const reorder = row.original.reorder_level;
                const isLow = reorder > 0 && qty <= reorder;
                return (
                    <Flex align="center" gap={2}>
                        <Text fontSize="sm">{qty} {row.original.unit || ""}</Text>
                        {isLow && (
                            <Badge colorScheme="red" variant="subtle" fontSize="xs" borderRadius="full">
                                {t("low_stock")}
                            </Badge>
                        )}
                    </Flex>
                );
            },
        },
        {
            header: t("cost_price"),
            accessorKey: "cost_price",
            cell: ({ getValue }) => (
                <Text fontSize="sm">{formatAmount(getValue())}</Text>
            ),
        },
        {
            header: t("status"),
            accessorKey: "is_active",
            cell: ({ getValue }) => {
                const active = getValue();
                return (
                    <Badge
                        colorScheme={active ? "green" : "red"}
                        variant="subtle"
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        fontSize="xs"
                        fontWeight="600"
                    >
                        {active ? t("active") : t("inactive")}
                    </Badge>
                );
            },
        },
        {
            header: t("branch"),
            cell: ({ row }) => (
                <Text fontSize="sm">{row.original.branch?.name || "-"}</Text>
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
                            icon={<Icon as={EditIcon} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            onClick={() => navigate(INVENTORY_ITEM_EDIT_PATH(row.original.id), { state: { item: row.original } })}
                        >
                            {t("edit")}
                        </MenuItem>
                        <MenuItem
                            icon={<Icon as={DeleteIcon} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            color="red.500"
                            _hover={{ bg: "red.50", _dark: { bg: "red.900" } }}
                            onClick={() => deleteItem(row.original.id)}
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
                title={t("inventory_item_management")}
                subtitle={t("manage_all_inventory_items")}
                breadcrumbs={[
                    { label: t("dashboard"), path: DASHBOARD_PATH },
                    { label: t("inventory_items"), isCurrent: true },
                ]}
                action={INVENTORY_ITEM_ADD_PATH}
                actionLabel={t("add_inventory_item")}
            >
                <TableExportButtons data={data} columns={columns} filename="inventory-items" />
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
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    setPageIndex={setPageIndex}
                    pageCount={pageCount}
                    isLoading={isLoading}
                    hideAddBtn="true"
                    totalItems={totalItems}
                >
                    <Select
                        maxW="160px"
                        size="md"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPageIndex(0); }}
                        placeholder={t("all_status")}
                        borderRadius="lg"
                    >
                        <option value="1">{t("active")}</option>
                        <option value="0">{t("inactive")}</option>
                    </Select>
                    <BranchFilter value={branchFilter} onChange={setBranchFilter} />
                </TanStackTable>
            </Box>
        </Box>
    );
}
