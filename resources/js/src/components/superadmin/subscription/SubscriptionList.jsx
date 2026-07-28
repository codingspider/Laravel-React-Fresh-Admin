import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    useToast,
    Icon,
    HStack,
    Text,
    Badge,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Select,
    Flex,
    useColorModeValue,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { MoreHorizontal } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../axios";
import {
    SUBSCRIPTION_ADD_PATH,
    SUBSCRIPTION_EDIT_PATH,
    DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import { LIST_SUBSCRIPTION, DELETE_SUBSCRIPTION } from "../../../routes/apiRoutes";

export default function SubscriptionList() {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(10);
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [statusFilter, setStatusFilter] = useState("");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();

    const fetchSubscriptions = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(LIST_SUBSCRIPTION, {
                params: {
                    page: pageIndex + 1,
                    per_page: pageSize,
                    search: globalFilter || "",
                    status: statusFilter || "",
                    payment_status: paymentStatusFilter || "",
                },
            });

            const items = res.data?.data?.data || res.data?.data || [];
            const total = res.data?.meta?.total || res.data?.data?.total || items.length;

            setData(items);
            setPageCount(Math.ceil(total / pageSize));
            setTotalItems(total);
        } catch (err) {
            console.error("fetchSubscriptions error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [pageIndex, globalFilter, pageSize, statusFilter, paymentStatusFilter]);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Subscriptions`;
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    const deleteSubscription = async (id) => {
        const result = await Swal.fire({
            title: t("delete_subscription"),
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
                await api.delete(DELETE_SUBSCRIPTION(id));
                toast({
                    position: "top-right",
                    title: t("subscription_deleted_successfully"),
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                fetchSubscriptions();
            } catch (error) {
                toast({
                    position: "top-right",
                    title: t("error_deleting_subscription"),
                    description: error.response?.data?.message || t("something_went_wrong"),
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };

    const paymentStatusColor = (status) => {
        const colors = { paid: "green", pending: "yellow", failed: "red", refunded: "orange" };
        return colors[status] || "gray";
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
            header: t("restaurant"),
            accessorFn: (row) => row.restaurant?.name || row.restaurant_name || "-",
            cell: ({ getValue }) => (
                <Text fontSize="sm" fontWeight="600">
                    {getValue()}
                </Text>
            ),
        },
        {
            header: t("plan"),
            accessorFn: (row) => row.plan?.name || row.plan_name || "-",
            cell: ({ getValue }) => (
                <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs">
                    {getValue()}
                </Badge>
            ),
        },
        {
            header: t("starts_at"),
            accessorKey: "starts_at",
            cell: ({ getValue }) => (
                <Text fontSize="sm">{getValue() ? new Date(getValue()).toLocaleDateString() : "-"}</Text>
            ),
        },
        {
            header: t("ends_at"),
            accessorKey: "ends_at",
            cell: ({ getValue }) => (
                <Text fontSize="sm">{getValue() ? new Date(getValue()).toLocaleDateString() : "-"}</Text>
            ),
        },
        {
            header: t("payment_status"),
            accessorFn: (row) => row.payment_status || "-",
            cell: ({ getValue }) => {
                const val = getValue();
                return (
                    <Badge
                        colorScheme={paymentStatusColor(val)}
                        variant="subtle"
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        fontSize="xs"
                        fontWeight="600"
                        textTransform="capitalize"
                    >
                        {val}
                    </Badge>
                );
            },
        },
        {
            header: t("payment_method"),
            accessorFn: (row) => row.payment_method || "-",
            cell: ({ getValue }) => (
                <Text fontSize="sm" textTransform="capitalize">{getValue()}</Text>
            ),
        },
        {
            header: t("status"),
            accessorFn: (row) => (row.status === "active" ? "Active" : "Inactive"),
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
                        icon={<Icon as={MoreHorizontal} boxSize={4} />}
                        as={HStack}
                        variant="ghost"
                        size="sm"
                        borderRadius="lg"
                        cursor="pointer"
                        aria-label={t("actions")}
                    />
                    <MenuList minW="140px" p={1.5}>
                        <MenuItem
                            icon={<Icon as={EditIcon} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            onClick={() => navigate(SUBSCRIPTION_EDIT_PATH.replace(":id", row.original.id))}
                        >
                            {t("edit")}
                        </MenuItem>
                        <MenuItem
                            icon={<Icon as={DeleteIcon} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            color="red.500"
                            _hover={{ bg: "red.50", _dark: { bg: "red.900" } }}
                            onClick={() => deleteSubscription(row.original.id)}
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
                title={t("subscription_management")}
                subtitle={t("manage_restaurant_subscriptions")}
                breadcrumbs={[
                    { label: t("dashboard"), path: DASHBOARD_PATH },
                    { label: t("subscriptions"), isCurrent: true },
                ]}
                action={SUBSCRIPTION_ADD_PATH}
                actionLabel={t("add_subscription")}
            />

            <Box
                bg={useColorModeValue("white", "gray.800")}
                p={{ base: 4, md: 6 }}
                borderRadius="xl"
                boxShadow="card"
                border="1px solid"
                borderColor={useColorModeValue("gray.200", "gray.700")}
            >
                <Flex mb={4} gap={3} align="center" flexWrap="wrap">
                    <Select
                        maxW="180px"
                        size="md"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPageIndex(0); }}
                        placeholder={t("all_status")}
                        borderRadius="lg"
                    >
                        <option value="active">{t("active")}</option>
                        <option value="inactive">{t("inactive")}</option>
                    </Select>
                    <Select
                        maxW="200px"
                        size="md"
                        value={paymentStatusFilter}
                        onChange={(e) => { setPaymentStatusFilter(e.target.value); setPageIndex(0); }}
                        placeholder={t("all_payment_status")}
                        borderRadius="lg"
                    >
                        <option value="paid">{t("paid")}</option>
                        <option value="pending">{t("pending")}</option>
                        <option value="failed">{t("failed")}</option>
                        <option value="refunded">{t("refunded")}</option>
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
                    addURL={SUBSCRIPTION_ADD_PATH}
                    totalItems={totalItems}
                />
            </Box>
        </Box>
    );
}
