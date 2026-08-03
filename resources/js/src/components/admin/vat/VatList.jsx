import React, { useEffect, useState, useCallback } from "react";
import {
    Box,
    useToast,
    Icon,
    IconButton,
    Text,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { MoreHorizontal, Plus } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../axios";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import TableExportButtons from "../../ui/TableExportButtons";
import { LIST_VAT, DELETE_VAT } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";

export default function VatList({ vats, onSuccess, onOpenCreate, onOpenEdit }) {
    const [globalFilter, setGlobalFilter] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(15);
    const { t } = useTranslation();
    const toast = useToast();
    const colors = useThemeColors();

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
                await api.delete(DELETE_VAT(id));
                toast({
                    title: t("data_deleted_successfully"),
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                if (onSuccess) onSuccess();
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
                    {row.index + 1}
                </Text>
            ),
        },
        {
            header: t("vat_amount"),
            accessorKey: "vat_amount",
            cell: ({ getValue }) => (
                <Text fontSize="sm" fontWeight="600">
                    {getValue()}%
                </Text>
            ),
        },
        {
            header: t("use_for"),
            accessorKey: "use_for",
            cell: ({ getValue }) => {
                const val = getValue();
                let items = [];
                try {
                    items = typeof val === "string" ? JSON.parse(val) : val || [];
                } catch { items = []; }
                return (
                    <Text fontSize="sm" textTransform="capitalize">
                        {Array.isArray(items) ? items.join(", ") : val || "-"}
                    </Text>
                );
            },
        },
        {
            header: t("tax_included"),
            accessorKey: "item_tax_include",
            cell: ({ getValue }) => (
                <Text fontSize="sm" color={getValue() == 1 ? "green.500" : "red.500"}>
                    {getValue() == 1 ? t("tax_included") : t("tax_not_included")}
                </Text>
            ),
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
                            onClick={() => onOpenEdit(row.original)}
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

    const tableData = Array.isArray(vats) ? vats : [];
    const totalItems = tableData.length;
    const startIdx = pageIndex * pageSize;
    const paginatedData = tableData.slice(startIdx, startIdx + pageSize);
    const pageCount = Math.ceil(totalItems / pageSize);

    return (
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
                data={paginatedData}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                pageIndex={pageIndex}
                pageSize={pageSize}
                setPageIndex={setPageIndex}
                pageCount={pageCount}
                isLoading={false}
                hideAddBtn="true"
                totalItems={totalItems}
            >
                <Button
                    variant="primary"
                    leftIcon={<Icon as={Plus} boxSize={4} />}
                    size="md"
                    onClick={onOpenCreate}
                >
                    {t("add_new")}
                </Button>
            </TanStackTable>
        </Box>
    );
}
