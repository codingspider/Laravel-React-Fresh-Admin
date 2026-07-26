import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    useToast,
    Icon,
    HStack,
    IconButton,
    Tooltip,
    Badge,
    Text,
    Flex,
    Avatar,
    useColorModeValue,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
} from "@chakra-ui/react";
import { Link as ChakraLink } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { MoreHorizontal, Eye, Copy } from "lucide-react";
import Swal from "sweetalert2";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import {
    PLAN_ADD_PATH,
    PLAN_EDIT_PATH,
    DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";
import TanStackTable from "../../../TanStackTable";
import PageHeader from "../../ui/PageHeader";
import { LIST_PLAN, DELETE_PLAN } from "../../../routes/apiRoutes";
import { useCurrencyFormatter } from "./../../../useCurrencyFormatter";

export default function PlanList() {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(10);
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const { formatAmount } = useCurrencyFormatter();

    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(LIST_PLAN, {
                params: {
                    page: pageIndex + 1,
                    per_page: pageSize,
                    search: globalFilter || "",
                },
            });

            const items = res.data?.data?.data || [];
            const total = res.data?.data?.total || items.length;

            setData(items);
            setPageCount(Math.ceil(total / pageSize));
            setTotalItems(total);
        } catch (err) {
            console.error("fetchPlans error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Plans`;
        fetchPlans();
    }, [pageIndex, globalFilter]);

    const deletePlan = async (id) => {
        const result = await Swal.fire({
            title: "Delete Plan?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#0d9488",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            customClass: {
                popup: 'swal-popup',
            },
        });

        if (result.isConfirmed) {
            try {
                await api.delete(DELETE_PLAN(id));
                toast({
                    position: "top-right",
                    title: "Plan deleted successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                fetchPlans();
            } catch (error) {
                toast({
                    position: "top-right",
                    title: "Error deleting plan",
                    description: error.response?.data?.message || "Something went wrong.",
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
            cell: ({ row }) => (
                <HStack spacing={3}>
                    <Avatar size="sm" name={row.original.name} bg="brand.500" color="white" fontSize="xs" />
                    <Text fontSize="sm" fontWeight="600">
                        {row.original.name}
                    </Text>
                </HStack>
            ),
        },
        {
            header: t("price"),
            accessorFn: (row) => formatAmount(row.price),
            cell: ({ getValue }) => (
                <Text fontSize="sm" fontWeight="600" color="green.600">
                    {getValue()}
                </Text>
            ),
        },
        {
            header: t("billing_cycle"),
            accessorKey: "billing_cycle",
            cell: ({ getValue }) => (
                <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs">
                    {getValue()}
                </Badge>
            ),
        },
        {
            header: t("user_limit"),
            accessorKey: "user_limit",
            cell: ({ getValue }) => (
                <Text fontSize="sm" fontWeight="500">
                    {getValue()}
                </Text>
            ),
        },
        {
            header: t("invoice_limit"),
            accessorKey: "invoice_limit",
            cell: ({ getValue }) => (
                <Text fontSize="sm" fontWeight="500">
                    {getValue()}
                </Text>
            ),
        },
        {
            header: t("status"),
            accessorFn: (row) => (row.is_active == 1 ? "Active" : "Inactive"),
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
            header: "Actions",
            cell: ({ row }) => (
                <Menu>
                    <MenuButton
                        as={IconButton}
                        icon={<Icon as={MoreHorizontal} boxSize={4} />}
                        variant="ghost"
                        size="sm"
                        borderRadius="lg"
                        aria-label="Actions"
                    />
                    <MenuList minW="140px" p={1.5}>
                        <MenuItem
                            icon={<Icon as={Eye} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            onClick={() => navigate(PLAN_EDIT_PATH(row.original.id))}
                        >
                            View
                        </MenuItem>
                        <MenuItem
                            icon={<Icon as={EditIcon} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            onClick={() => navigate(PLAN_EDIT_PATH(row.original.id))}
                        >
                            Edit
                        </MenuItem>
                        <MenuItem
                            icon={<Icon as={DeleteIcon} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            color="red.500"
                            _hover={{ bg: "red.50", _dark: { bg: "red.900" } }}
                            onClick={() => deletePlan(row.original.id)}
                        >
                            Delete
                        </MenuItem>
                    </MenuList>
                </Menu>
            ),
        },
    ];

    return (
        <Box>
            <PageHeader
                title="Plan Management"
                subtitle="Manage your subscription plans"
                breadcrumbs={[
                    { label: "Dashboard", path: DASHBOARD_PATH },
                    { label: "Plans", isCurrent: true },
                ]}
                action={PLAN_ADD_PATH}
                actionLabel="Add Plan"
            />

            <Box
                bg={useColorModeValue("white", "gray.800")}
                p={{ base: 4, md: 6 }}
                borderRadius="xl"
                boxShadow="card"
                border="1px solid"
                borderColor={useColorModeValue("gray.200", "gray.700")}
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
                    addURL={PLAN_ADD_PATH}
                    totalItems={totalItems}
                />
            </Box>
        </Box>
    );
}
