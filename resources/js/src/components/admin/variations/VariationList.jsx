import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    useToast,
    Icon,
    IconButton,
    Text,
    Flex,
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
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import TableExportButtons from "../../ui/TableExportButtons";
import { LIST_VARIATION, DELETE_VARIATION } from "../../../routes/apiRoutes";
import {
    VARIATION_ADD_PATH,
    VARIATION_EDIT_PATH,
    ADMIN_DASHBOARD_PATH,
} from "../../../routes/adminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

export default function VariationList() {
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
    const { formatAmount } = useCurrencyFormatter();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(LIST_VARIATION, {
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
        document.title = `${app_name} | Variation Management`;
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
                await api.delete(DELETE_VARIATION(id));
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
            header: t("items"),
            accessorKey: "variation_items",
            cell: ({ getValue }) => {
                const items = getValue();
                if (!items || items.length === 0) return <Text fontSize="sm" color="gray.400">-</Text>;
                return (
                    <Flex direction="column" gap={1}>
                        {items.map((item, idx) => (
                            <Badge
                                key={idx}
                                variant="subtle"
                                colorScheme="blue"
                                borderRadius="full"
                                px={2}
                                py={0.5}
                                fontSize="xs"
                                width="fit-content"
                            >
                                {item.name} — {formatAmount(item.price)}
                            </Badge>
                        ))}
                    </Flex>
                );
            },
        },
        {
            header: t("branches"),
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
                            onClick={() => navigate(VARIATION_EDIT_PATH(row.original.id), { state: { variation: row.original } })}
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
                title={t("variation_management")}
                subtitle={t("manage_all_variations")}
                breadcrumbs={[
                    { label: t("dashboard"), path: ADMIN_DASHBOARD_PATH },
                    { label: t("variations"), isCurrent: true },
                ]}
                action={VARIATION_ADD_PATH}
                actionLabel={t("add_variation")}
            >
                <TableExportButtons data={data} columns={columns} filename="variations" />
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
                    addURL={VARIATION_ADD_PATH}
                    totalItems={totalItems}
                />
            </Box>
        </Box>
    );
}
