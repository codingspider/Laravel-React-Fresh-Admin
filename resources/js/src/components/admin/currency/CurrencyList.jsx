import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    useToast,
    Icon,
    IconButton,
    Text,
    Badge,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { MoreHorizontal } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../axios";
import {
    CURRENCY_ADD_PATH,
    CURRENCY_EDIT_PATH,
    DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import { LIST_CURRENCY, DELETE_CURRENCY } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import TableExportButtons from "../../ui/TableExportButtons";

export default function CurrencyList() {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(15);
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const colors = useThemeColors();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(LIST_CURRENCY, {
                params: {
                    page: pageIndex + 1,
                    per_page: pageSize,
                    search: globalFilter || "",
                },
            });

            const items = res.data?.data || [];
            const total = res.data?.meta?.total || items.length;

            setData(items);
            setPageCount(Math.ceil(total / pageSize));
            setTotalItems(total);
        } catch (err) {
            console.error("fetchData error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [pageIndex, globalFilter, pageSize]);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Currency Management`;
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
                await api.delete(DELETE_CURRENCY(id));
                toast({
                    position: "top-right",
                    title: t("data_deleted_successfully"),
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                fetchData();
            } catch (error) {
                toast({
                    position: "top-right",
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
                    {row.index + 1}
                </Text>
            ),
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
            header: t("code"),
            accessorKey: "code",
            cell: ({ getValue }) => (
                <Text fontSize="sm">{getValue()}</Text>
            ),
        },
        {
            header: t("symbol"),
            accessorKey: "symbol",
            cell: ({ getValue }) => (
                <Text fontSize="sm">{getValue()}</Text>
            ),
        },
        {
            header: t("symbol_position"),
            accessorFn: (row) => (row.symbol_first ? t("before") : t("after")),
            cell: ({ getValue }) => (
                <Text fontSize="sm">{getValue()}</Text>
            ),
        },
        {
            header: t("decimal_mark"),
            accessorKey: "decimal_mark",
            cell: ({ getValue }) => (
                <Text fontSize="sm">{getValue()}</Text>
            ),
        },
        {
            header: t("thousands_separator"),
            accessorKey: "thousands_separator",
            cell: ({ getValue }) => (
                <Text fontSize="sm">{getValue()}</Text>
            ),
        },
        {
            header: t("precision"),
            accessorKey: "precision",
            cell: ({ getValue }) => (
                <Text fontSize="sm">{getValue()}</Text>
            ),
        },
        {
            header: t("status"),
            accessorFn: (row) => (row.is_active ? "Active" : "Inactive"),
            cell: ({ getValue }) => {
                const isActive = getValue() === "Active";
                return (
                    <Badge
                        colorScheme={isActive ? "green" : "gray"}
                        variant="subtle"
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        fontSize="xs"
                        fontWeight="600"
                    >
                        {getValue()}
                    </Badge>
                );
            },
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
                            onClick={() => navigate(CURRENCY_EDIT_PATH(row.original.id))}
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
                title={t("currency_management")}
                subtitle={t("manage_currencies")}
                breadcrumbs={[
                    { label: t("dashboard"), path: DASHBOARD_PATH },
                    { label: t("currencies"), isCurrent: true },
                ]}
                action={CURRENCY_ADD_PATH}
                actionLabel={t("add_currency")}
            >
                <TableExportButtons data={data} columns={columns} filename="currencies" />
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
                    addURL={CURRENCY_ADD_PATH}
                    totalItems={totalItems}
                />
            </Box>
        </Box>
    );
}
