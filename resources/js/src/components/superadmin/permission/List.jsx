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
    Image
} from "@chakra-ui/react";
import { Link as ChakraLink } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import Swal from "sweetalert2";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import TanStackTable from "../../../TanStackTable";
import { useCurrencyFormatter } from './../../../useCurrencyFormatter';
import { ROLE_ADD_PATH, ROLE_EDIT_PATH, DASHBOARD_PATH} from './../../../routes/superAdminRoutes';
import { DELETE_ROLE, LIST_ROLE } from "../../../routes/apiRoutes";

export default function List() {
    const [globalFilter, setGlobalFilter] = useState("");
    const [data, setData] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const pageSize = 10;
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const { formatAmount, currency } = useCurrencyFormatter();

    // Fetch data whenever page or search changes
    const fetchRole = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(LIST_ROLE, {
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
            console.error("fetchRole error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const app_name = localStorage.getItem('app_name');
        document.title = `${app_name} | Permission Management`;
        fetchRole();
    }, [pageIndex, globalFilter]);

    const deleteRole = async (id) => {
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
                await api.delete(DELETE_ROLE(id));
                toast({
                    position: "bottom-right",
                    title: "Data deleted successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                fetchRole();
            } catch (error) {
                console.log(error);
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
                                navigate(ROLE_EDIT_PATH.replace(":id", row.original.id))
                            }
                        >
                            <EditIcon />
                        </ChakraLink>

                        <ChakraLink
                            border="1px solid black"
                            padding={2}
                            borderRadius="md"
                            cursor="pointer"
                            onClick={() => deleteRole(row.original.id)}
                        >
                            <DeleteIcon color="red.500" />
                        </ChakraLink>
                    </Box>
                </>
            ), enableColumnFilter: false,
        },
    ];

    return (
        <Box className="form-dark-surface">
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
                                to={ROLE_ADD_PATH}
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
                            addURL={ROLE_ADD_PATH}
                        />
                    </CardBody>
                </Card>
            </SimpleGrid>
        </Box>
    );
}
