import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    useToast,
    Icon,
    HStack,
    IconButton,
    Text,
    Flex,
    Badge,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Wrap,
    WrapItem,
    Select,
    useColorModeValue,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { MoreHorizontal } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../axios";
import {
    PACKAGE_ADD_PATH,
    PACKAGE_VIEW_PATH,
    PACKAGE_EDIT_PATH,
    DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import { LIST_PACKAGE, DELETE_PACKAGE } from "../../../routes/apiRoutes";

export default function PackageList() {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(10);
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [statusFilter, setStatusFilter] = useState("");
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();

    const fetchPackages = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(LIST_PACKAGE, {
                params: {
                    page: pageIndex + 1,
                    per_page: pageSize,
                    search: globalFilter || "",
                    status: statusFilter || "",
                },
            });

            const items = res.data?.data?.data || res.data?.data || [];
            const total = res.data?.meta?.total || res.data?.data?.total || items.length;

            setData(items);
            setPageCount(Math.ceil(total / pageSize));
            setTotalItems(total);
        } catch (err) {
            console.error("fetchPackages error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [pageIndex, globalFilter, pageSize, statusFilter]);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Packages`;
        fetchPackages();
    }, [fetchPackages]);

    const deletePackage = async (id) => {
        const result = await Swal.fire({
            title: t("delete_package"),
            text: t("action_cannot_be_undone"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#0d9488",
            cancelButtonColor: "#6b7280",
            confirmButtonText: t("yes_delete_it"),
            cancelButtonText: t("cancel"),
            reverseButtons: true,
            customClass: { popup: "swal-popup" },
        });

        if (result.isConfirmed) {
            try {
                await api.delete(DELETE_PACKAGE(id));
                toast({
                    position: "top-right",
                    title: t("package_deleted_successfully"),
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                fetchPackages();
            } catch (error) {
                toast({
                    position: "top-right",
                    title: t("error_deleting_package"),
                    description: error.response?.data?.message || t("something_went_wrong"),
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };

    const moduleBadgeColor = (mod) => {
        const colors = {
            hrm: "purple", crm: "blue", inventory: "orange", pos: "green",
            reports: "cyan", kitchen: "red", accounts: "teal", purchasing: "yellow",
            orders: "pink", delivery: "indigo", marketing: "magenta", loyalty: "gold",
            recipe: "brown", reviews: "lime", notification: "gray", accounting: "navy",
            payroll: "maroon", shift: "olive", analytics: "violet", invoices: "sky",
        };
        return colors[mod] || "gray";
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
            cell: ({ row }) => (
                <Text fontSize="sm" fontWeight="600">
                    {row.original.name}
                </Text>
            ),
        },
        {
            header: t("description"),
            accessorKey: "description",
            cell: ({ getValue }) => (
                <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }} noOfLines={2} maxW="200px">
                    {getValue() || "-"}
                </Text>
            ),
        },
        {
            header: t("modules"),
            accessorFn: (row) => row.modules,
            cell: ({ getValue }) => {
                const modules = getValue() || [];
                if (!modules.length) return <Text fontSize="sm" color="gray.400">-</Text>;
                return (
                    <Wrap spacing={1}>
                        {modules.slice(0, 3).map((mod, i) => (
                            <WrapItem key={i}>
                                <Badge
                                    colorScheme={moduleBadgeColor(mod)}
                                    variant="subtle"
                                    borderRadius="full"
                                    px={2}
                                    py={0.5}
                                    fontSize="xs"
                                    textTransform="capitalize"
                                >
                                    {mod}
                                </Badge>
                            </WrapItem>
                        ))}
                        {modules.length > 3 && (
                            <WrapItem>
                                <Badge colorScheme="gray" variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs">
                                    +{modules.length - 3}
                                </Badge>
                            </WrapItem>
                        )}
                    </Wrap>
                );
            },
        },
        {
            header: t("status"),
            accessorFn: (row) => (row.status === "active" || row.is_active == 1 ? "Active" : "Inactive"),
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
                            icon={<Icon as={ViewIcon} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            onClick={() => navigate(PACKAGE_VIEW_PATH.replace(":id", row.original.id))}
                        >
                            {t("view")}
                        </MenuItem>
                        <MenuItem
                            icon={<Icon as={EditIcon} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            onClick={() => navigate(PACKAGE_EDIT_PATH.replace(":id", row.original.id))}
                        >
                            {t("edit")}
                        </MenuItem>
                        <MenuItem
                            icon={<Icon as={DeleteIcon} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            color="red.500"
                            _hover={{ bg: "red.50", _dark: { bg: "red.900" } }}
                            onClick={() => deletePackage(row.original.id)}
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
                title={t("package_management")}
                subtitle={t("manage_subscription_packages")}
                breadcrumbs={[
                    { label: t("dashboard"), path: DASHBOARD_PATH },
                    { label: t("packages"), isCurrent: true },
                ]}
                action={PACKAGE_ADD_PATH}
                actionLabel={t("add_package")}
            />

            <Box
                bg={useColorModeValue("white", "gray.800")}
                p={{ base: 4, md: 6 }}
                borderRadius="xl"
                boxShadow="card"
                border="1px solid"
                borderColor={useColorModeValue("gray.200", "gray.700")}
            >
                <Flex mb={4} gap={3} align="center">
                    <Select
                        maxW="200px"
                        size="md"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPageIndex(0); }}
                        placeholder={t("all_status")}
                        borderRadius="lg"
                    >
                        <option value="active">{t("active")}</option>
                        <option value="inactive">{t("inactive")}</option>
                    </Select>
                </Flex>

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
                    addURL={PACKAGE_ADD_PATH}
                    totalItems={totalItems}
                />
            </Box>
        </Box>
    );
}
