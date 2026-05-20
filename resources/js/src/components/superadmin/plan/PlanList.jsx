import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardBody,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    SimpleGrid,
    Td,
    Box,
    useToast,
} from "@chakra-ui/react";
import { Link as ChakraLink } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import Swal from "sweetalert2";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { PLAN_ADD_PATH, PLAN_EDIT_PATH, DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import TanStackTable from "../../../TanStackTable";
import { LIST_PLAN } from "../../../routes/apiRoutes";
import { useCurrencyFormatter } from './../../../useCurrencyFormatter';
import { DELETE_PLAN } from "../../../routes/apiRoutes";


export default function PlanList() {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const pageSize = 10;
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const { formatAmount, currency } = useCurrencyFormatter();

    // Fetch data whenever page or search changes
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

            const bottles = res.data?.data?.data || [];
            const total = res.data?.data?.total || bottles.length;

            // Update table
            setData(bottles);
            setPageCount(Math.ceil(total / pageSize));
        } catch (err) {
            console.error("fetchPlans error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const app_name = localStorage.getItem('app_name');
        document.title = `${app_name} | Plan Management`;
        fetchPlans();
    }, [pageIndex, globalFilter]);

    const deletePlan = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Data will be deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Delete!",
        });

        if (result.isConfirmed) {
            try {
                await api.delete(DELETE_PLAN(id));
                toast({
                    position: "bottom-right",
                    title: "Data deleted successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                fetchPlans();
            } catch (error) {
                toast({
                    position: "bottom-right",
                    title: "Error deleting data",
                    description:
                        error.response?.data?.message ||
                        "Something went wrong.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };

    const columns = [
        { header: t("sl"), cell: ({ row }) => row.index + 1},
        { header: t('name'), accessorKey: "name"},
        { header: t("price"), accessorFn: row => formatAmount(row.price)},
        { header: t('billing_cycle'), accessorKey: "billing_cycle"},
        { header: t('user_limit'), accessorKey: "user_limit"},
        { header: t('invoice_limit'), accessorKey: "invoice_limit"},
        { header: t('status'), accessorFn: row => row.is_active == 1 ? 'Active' : 'Inactive' || ""},
        {
            header: "Actions",
            cell: ({ row }) => (
                <>
                    <Box display="flex" gap={2}>
                        <ChakraLink
                            border="1px solid black"
                            padding={2}
                            borderRadius="md"
                            onClick={() =>
                                navigate(PLAN_EDIT_PATH(row.original.id))
                            }
                        >
                            <EditIcon />
                        </ChakraLink>

                        <ChakraLink
                            border="1px solid black"
                            padding={2}
                            borderRadius="md"
                            cursor="pointer"
                            onClick={() => deletePlan(row.original.id)}
                        >
                            <DeleteIcon color="red.500" />
                        </ChakraLink>
                    </Box>
                </>
            ), enableColumnFilter: false,
        },
    ];

    return (
        <>
            {/* Breadcrumb */}
            <Card mb={5}>
                <CardBody>
                    <Breadcrumb fontSize={{ base: "sm", md: "md" }}>
                        <BreadcrumbItem>
                            <BreadcrumbLink
                                as={ReactRouterLink}
                                to={DASHBOARD_PATH}
                            >
                                {t("dashboard")}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink
                                as={ReactRouterLink}
                                to={PLAN_ADD_PATH}
                            >
                                {t("add")}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                </CardBody>
            </Card>

            <SimpleGrid columns={{ base: 1, md: 1 }} mt={5}>
                <Card>
                    <CardBody>
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
                        />
                    </CardBody>
                </Card>
            </SimpleGrid>
        </>
    );
}
