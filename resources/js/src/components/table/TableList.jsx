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
    Select,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { MoreHorizontal, QrCode } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../axios";
import TanStackTable from "../../TanStackTable";
import PageHeader from "../ui/PageHeader";
import TableExportButtons from "../ui/TableExportButtons";
import BranchFilter from "../ui/BranchFilter";
import { LIST_TABLE, DELETE_TABLE } from "../../routes/apiRoutes";
import useThemeColors from "../../hooks/useThemeColors";
import QRCodeModal from "./QRCodeModal";

const statusColors = {
    available: "green",
    occupied: "red",
    reserved: "yellow",
    cleaning: "orange",
    maintenance: "gray",
};

export default function TableList() {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(10);
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [statusFilter, setStatusFilter] = useState("");
    const [branchFilter, setBranchFilter] = useState(null);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const colors = useThemeColors();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(LIST_TABLE, {
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
        document.title = `${app_name} | Table Management`;
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
                await api.delete(DELETE_TABLE(id));
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
            header: t("name"),
            accessorKey: "name",
            cell: ({ getValue }) => (
                <Text fontSize="sm" fontWeight="600">
                    {getValue()}
                </Text>
            ),
        },
        {
            header: t("floor"),
            cell: ({ row }) => (
                <Text fontSize="sm">{row.original.floor?.name || "-"}</Text>
            ),
        },
        {
            header: t("capacity"),
            accessorKey: "capacity",
            cell: ({ getValue }) => (
                <Text fontSize="sm">{getValue() || "-"}</Text>
            ),
        },
        {
            header: t("status"),
            accessorKey: "status",
            cell: ({ getValue }) => {
                const val = getValue();
                return (
                    <Badge
                        colorScheme={statusColors[val] || "gray"}
                        variant="subtle"
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        fontSize="xs"
                        fontWeight="600"
                        textTransform="capitalize"
                    >
                        {t(val)}
                    </Badge>
                );
            },
        },
        {
            header: t("qr_code"),
            accessorKey: "qr_code_url",
            cell: ({ getValue }) => {
                const val = getValue();
                return val ? (
                    <Badge colorScheme="green" variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="600">
                        {t("generated")}
                    </Badge>
                ) : (
                    <Badge colorScheme="gray" variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs">
                        {t("none")}
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
                            icon={<Icon as={QrCode} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            onClick={() => { setSelectedTable(row.original); setQrModalOpen(true); }}
                        >
                            {t("qr_code")}
                        </MenuItem>
                        <MenuItem
                            icon={<Icon as={EditIcon} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            onClick={() => navigate(`/table-management/table/edit/${row.original.id}`, { state: { table: row.original } })}
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
                title={t("table_management")}
                subtitle={t("manage_all_tables")}
                breadcrumbs={[
                    { label: t("dashboard"), path: "/dashboard" },
                    { label: t("tables"), isCurrent: true },
                ]}
                action="/table-management/table/create"
                actionLabel={t("add_table")}
            >
                <TableExportButtons data={data} columns={columns} filename="tables" />
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
                    addURL="/table-management/table/create"
                    totalItems={totalItems}
                    hideAddBtn="true"
                >
                    <Select
                        maxW="160px"
                        size="md"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPageIndex(0); }}
                        placeholder={t("all_status")}
                        borderRadius="lg"
                    >
                        {Object.keys(statusColors).map((s) => (
                            <option key={s} value={s}>{t(s)}</option>
                        ))}
                    </Select>
                    <BranchFilter value={branchFilter} onChange={setBranchFilter} />
                </TanStackTable>
            </Box>

            <QRCodeModal
                isOpen={qrModalOpen}
                onClose={() => { setQrModalOpen(false); setSelectedTable(null); }}
                table={selectedTable}
            />
        </Box>
    );
}
