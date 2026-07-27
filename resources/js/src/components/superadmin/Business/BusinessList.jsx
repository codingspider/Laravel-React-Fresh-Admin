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
import { BUSINESS_ADD_PATH, DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import TanStackTable from "../../../TanStackTable";
import { LIST_BUSINESS } from "../../../routes/apiRoutes";
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';
import { DELETE_PLAN } from "../../../routes/apiRoutes";
import { BUSINESS_EDIT_PATH } from './../../../routes/superAdminRoutes';


export default function BusinessList() {
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
            const res = await api.get(LIST_BUSINESS, {
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
        document.title = `${app_name} | Business Management`;
        fetchPlans();
    }, [pageIndex, globalFilter]);

    const deleteBusiness = async (id) => {
        const result = await Swal.fire({
            title: t("are_you_sure"),
            text: t("data_will_be_deleted"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: t("yes_delete"),
        });

        if (result.isConfirmed) {
            try {
                await api.delete(DELETE_PLAN(id));
                toast({
                    position: "bottom-right",
                    title: t("data_deleted_successfully"),
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                fetchPlans();
            } catch (error) {
                toast({
                    position: "bottom-right",
                    title: t("error_deleting_data"),
                    description:
                        error.response?.data?.message || t("something_went_wrong"),
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };

    const columns = [
        { header: t("sl"), cell: ({ row }) => row.index + 1 },
        { header: t('name'), accessorKey: "name" },
        { header: t("start_date"), accessorKey: "start_date" },
        { header: t('country'), accessorKey: "country" },
        { header: t('state'), accessorKey: "state" },
        { header: t('address'), accessorKey: "landmark" },
        { header: t('status'), accessorFn: row => row.is_active == 1 ? 'Active' : 'Inactive' || "" },
        {
            header: t("actions"),
            cell: ({ row }) => (
                <>
                    <Box display="flex" gap={2}>
                        <ChakraLink
                            border="1px solid black"
                            padding={2}
                            borderRadius="md"
                            onClick={() =>
                                navigate(BUSINESS_EDIT_PATH(row.original.id))
                            }
                        >
                            <EditIcon />
                        </ChakraLink>

                        <ChakraLink
                            border="1px solid black"
                            padding={2}
                            borderRadius="md"
                            cursor="pointer"
                            onClick={() => deleteBusiness(row.original.id)}
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
                                to={BUSINESS_ADD_PATH}
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
                            addURL={BUSINESS_ADD_PATH}
                        />
                    </CardBody>
                </Card>
            </SimpleGrid>
        </>
    );
}
