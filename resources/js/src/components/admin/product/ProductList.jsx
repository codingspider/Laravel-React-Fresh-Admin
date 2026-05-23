import React, { useEffect, useState } from "react";
import { useNavigate, Link as ReactRouterLink } from "react-router-dom";
import {
    Badge,
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Card,
    CardBody,
    Image,
    SimpleGrid,
    Text,
    useToast,
} from "@chakra-ui/react";
import { Link as ChakraLink } from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import TanStackTable from "../../../TanStackTable";
import api from "../../../axios";
import { DELETE_ITEM, LIST_ITEM } from "../../../routes/apiRoutes";
import { DASHBOARD_PATH, PRODUCT_ADD_PATH, PRODUCT_EDIT_PATH } from "../../../routes/superAdminRoutes";

export default function ProductList() {
    const [globalFilter, setGlobalFilter] = useState("");
    const [data, setData] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const pageSize = 10;
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(LIST_ITEM, {
                params: {
                    page: pageIndex + 1,
                    per_page: pageSize,
                    search: globalFilter || "",
                },
            });

            const products = res.data?.data?.data || [];
            const total = res.data?.data?.total || products.length;

            setData(products);
            setPageCount(Math.ceil(total / pageSize));
        } catch (err) {
            toast({
                position: "bottom-right",
                title: "Error loading products",
                description: err.response?.data?.message || "Something went wrong.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const appName = localStorage.getItem("app_name");
        document.title = `${appName} | Product Management`;
        fetchProducts();
    }, [pageIndex, globalFilter]);

    const deleteProduct = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Product will be deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Delete!",
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await api.delete(DELETE_ITEM(id));
            toast({
                position: "bottom-right",
                title: "Product deleted successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            fetchProducts();
        } catch (error) {
            toast({
                position: "bottom-right",
                title: "Error deleting product",
                description: error.response?.data?.message || "Something went wrong.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const columns = [
        { header: t("sl"), cell: ({ row }) => row.index + 1 },
        {
            header: t("image"),
            accessorKey: "main_image",
            cell: ({ row }) => row.original.main_image ? (
                <Image
                    src={row.original.main_image}
                    alt={row.original.name}
                    boxSize="44px"
                    objectFit="cover"
                    borderRadius="md"
                />
            ) : (
                <Box boxSize="44px" bg="gray.100" borderRadius="md" />
            ),
        },
        { header: t("name"), accessorKey: "name" },
        { header: t("sku"), accessorKey: "sku" },
        {
            header: t("category"),
            cell: ({ row }) => row.original.category?.name || "-",
        },
        {
            header: t("branch"),
            cell: ({ row }) => row.original.branch?.name || "-",
        },
        {
            header: t("status"),
            cell: ({ row }) => (
                <Badge colorScheme={row.original.is_active ? "green" : "red"}>
                    {row.original.is_active ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            header: "Actions",
            cell: ({ row }) => (
                <Box display="flex" gap={2}>
                    <ChakraLink
                        border="1px solid"
                        borderColor="gray.300"
                        padding={2}
                        borderRadius="md"
                        onClick={() => navigate(PRODUCT_EDIT_PATH(row.original.id))}
                    >
                        <EditIcon />
                    </ChakraLink>

                    <ChakraLink
                        border="1px solid"
                        borderColor="gray.300"
                        padding={2}
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() => deleteProduct(row.original.id)}
                    >
                        <DeleteIcon color="red.500" />
                    </ChakraLink>
                </Box>
            ),
            enableColumnFilter: false,
        },
    ];

    return (
        <Box className="form-dark-surface">
            <Card mb={5}>
                <CardBody>
                    <Breadcrumb fontSize={{ base: "sm", md: "md" }}>
                        <BreadcrumbItem>
                            <BreadcrumbLink as={ReactRouterLink} to={DASHBOARD_PATH}>
                                {t("dashboard")}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink as={ReactRouterLink} to={PRODUCT_ADD_PATH}>
                                <Text as="span">{t("add")}</Text>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                </CardBody>
            </Card>

            <SimpleGrid columns={{ base: 1 }} mt={5}>
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
                            addURL={PRODUCT_ADD_PATH}
                        />
                    </CardBody>
                </Card>
            </SimpleGrid>
        </Box>
    );
}
