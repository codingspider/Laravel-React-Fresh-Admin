import {
    Box,
    Button,
    Card,
    CardHeader,
    CardBody,
    Heading,
    SimpleGrid,
    FormControl,
    FormLabel,
    Input,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    useToast,
    Flex,
    Text,
    Checkbox,
    Badge,
    Divider,
    Stack
} from "@chakra-ui/react";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { DASHBOARD_PATH, ROLE_LIST_PATH } from "../../../routes/superAdminRoutes";
import { GET_EDIT_ROLE, STORE_ROLE, UPDATE_ROLE } from "../../../routes/apiRoutes";
import { useTranslation } from "react-i18next";

const Edit = () => {
    const { register, handleSubmit, reset } = useForm();
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();
    const { t } = useTranslation();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [permissionsList, setPermissionsList] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    // ✅ STATIC PERMISSION STRUCTURE (DO NOT OVERRIDE)
    const permissionStructure = [
        {
            module: "User Management",
            permissions: [
                { id: "view_user", label: "List" },
                { id: "create_user", label: "Create" },
                { id: "update_user", label: "Edit" },
                { id: "delete_user", label: "Delete" },
            ]
        },
        {
            module: "Role Management",
            permissions: [
                { id: "role-list", label: "List" },
                { id: "role-create", label: "Create" },
                { id: "role-edit", label: "Edit" },
                { id: "role-delete", label: "Delete" },
            ]
        },
        {
            module: "Supplier",
            permissions: [
                { id: "view_supplier", label: "View" },
                { id: "create_supplier", label: "Create" },
                { id: "update_supplier", label: "Edit" },
                { id: "delete_supplier", label: "Delete" },
            ],
        },
        {
            module: "Customer",
            permissions: [
                { id: "view_customer", label: "View" },
                { id: "create_customer", label: "Create" },
                { id: "update_customer", label: "Edit" },
                { id: "delete_customer", label: "Delete" },
            ],
        },
        {
            module: "Category",
            permissions: [
                { id: "view_category", label: "List" },
                { id: "create_category", label: "Create" },
                { id: "update_category", label: "Edit" },
                { id: "delete_category", label: "Delete" },
            ]
        },
        {
            module: "Unit",
            permissions: [
                { id: "view_unit", label: "List" },
                { id: "create_unit", label: "Create" },
                { id: "update_unit", label: "Edit" },
                { id: "delete_unit", label: "Delete" },
            ]
        },
        {
            module: "Products",
            permissions: [
                { id: "view_product", label: "List" },
                { id: "create_product", label: "Create" },
                { id: "update_product", label: "Edit" },
                { id: "delete_product", label: "Delete" },
            ]
        },
        {
            module: "Purchase",
            permissions: [
                { id: "view_purchase", label: "View" },
                { id: "create_purchase", label: "Create" },
                { id: "update_purchase", label: "Edit" },
                { id: "delete_purchase", label: "Delete" },
            ],
        },
        {
            module: "Sale",
            permissions: [
                { id: "view_sale", label: "View" },
                { id: "create_sale", label: "Create" },
                { id: "update_sale", label: "Edit" },
                { id: "delete_sale", label: "Delete" },
            ],
        },
        {
            module: "Reports",
            permissions: [
                { id: "view_purchase_sale_report", label: "Purchase/Sale Report" },
                { id: "view_contacts_report", label: "Contacts Report" },
                { id: "view_stock_report", label: "Stock Report" },
                { id: "view_tax_report", label: "Tax Report" },
                { id: "view_trending_product_report", label: "Trending Product Report" },
                { id: "view_register_report", label: "Register Report" },
                { id: "view_sales_representative", label: "Sales Representative" },
                { id: "view_expense_report", label: "Expense Report" },
            ],
        },
        {
            module: "Settings",
            permissions: [
                { id: "access_all_locations", label: "Access All Locations" },
                { id: "view_dashboard_data", label: "View Dashboard Data" },
                { id: "access_business_settings", label: "Access Business Settings" },
                { id: "access_invoice_settings", label: "Access Invoice Settings" },
            ]
        }
        // Add remaining modules same way...
    ];

    // Load static permissions once
    useEffect(() => {
        setPermissionsList(permissionStructure);
    }, []);

    // Fetch role for edit
    useEffect(() => {
        const fetchRole = async () => {
            try {
                const res = await api.get(GET_EDIT_ROLE(id));
                const role = res.data.data;

                reset({
                    name: role.name
                });


                setSelectedPermissions(role.permissions);

            } catch (error) {
                console.error(error);
            }
        };

        if (id) fetchRole();
    }, [id, reset]);

    // Toggle single permission
    const handlePermissionChange = (permissionId) => {
        setSelectedPermissions((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    // Select all per module
    const handleSelectAllModule = (modulePermissions) => {
        const ids = modulePermissions.map(p => p.id);

        const allSelected = ids.every(id =>
            selectedPermissions.includes(id)
        );

        if (allSelected) {
            setSelectedPermissions(prev =>
                prev.filter(id => !ids.includes(id))
            );
        } else {
            setSelectedPermissions(prev => [
                ...new Set([...prev, ...ids])
            ]);
        }
    };

    // Submit
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                permissions: selectedPermissions
            };

            const res = await api.put(UPDATE_ROLE(id), payload);

            toast({
                title: res.data.message || "Success",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "bottom-right",
            });

            navigate(ROLE_LIST_PATH);

        } catch (err) {
            toast({
                title: "Error",
                description: err?.response?.data?.message,
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom-right",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box p={4}>

            {/* Breadcrumb */}
            <Card mb={4} bg="white" shadow="sm" borderRadius="lg" border="none">
                <CardBody py={3}>
                    <Breadcrumb fontSize="sm" color="gray.500">
                        <BreadcrumbItem>
                            <BreadcrumbLink
                                as={ReactRouterLink}
                                to={DASHBOARD_PATH}
                                fontWeight="medium"
                                _hover={{ color: "teal.500" }}
                            >
                                {t("dashboard")}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <BreadcrumbLink
                                as={ReactRouterLink}
                                to={ROLE_LIST_PATH}
                                fontWeight="medium"
                                _hover={{ color: "teal.500" }}
                            >
                                {t("roles")}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink color="gray.800" fontWeight="bold">
                                {t("edit")}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                </CardBody>
            </Card>

            <Card>
                <CardHeader
                    bg="white"
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    pb={6}
                >
                    <Flex justify="space-between" align="center">
                        <Box>
                            <Heading size="md" color="gray.800" fontWeight="bold">
                                {t("edit")}
                            </Heading>
                            <Text fontSize="sm" color="gray.500" mt={1}>
                                Define role name and assign specific permissions
                            </Text>
                        </Box>
                        <Button
                            colorScheme="teal"
                            as={ReactRouterLink}
                            to={ROLE_LIST_PATH}
                            variant="outline"
                            display={{ base: "none", md: "inline-flex" }}
                            size="sm"
                            fontWeight="600"
                        >
                            {t("list")}
                        </Button>
                    </Flex>
                </CardHeader>


                <CardBody>
                    <form onSubmit={handleSubmit(onSubmit)}>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>

                            {/* Role Name Input */}
                            <FormControl isRequired>
                                <FormLabel
                                    fontSize="sm"
                                    fontWeight="semibold"
                                    color="gray.700"
                                    mb={2}
                                >
                                    {t("role_name")}
                                </FormLabel>
                                <Input
                                    {...register("name", { required: true })}
                                    type="text"
                                    placeholder="e.g. Editor, Manager, Viewer"
                                    bg="gray.50"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    borderRadius="md"
                                    focusBorderColor="teal.500"
                                    _hover={{ borderColor: "gray.300" }}
                                    size="md"
                                    transition="all 0.2s"
                                />
                            </FormControl>

                            {/* Selection Stats (Optional visual filler or summary) */}
                            <Box>
                                <FormLabel
                                    fontSize="sm"
                                    fontWeight="semibold"
                                    color="gray.700"
                                    mb={2}
                                >
                                    {t("selection_summary")}
                                </FormLabel>
                                <Flex
                                    align="center"
                                    bg="gray.50"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    borderRadius="md"
                                    h="42px" // Match input height
                                    px={4}
                                    color="gray.600"
                                    fontSize="sm"
                                >
                                    <Badge colorScheme="teal" borderRadius="full" px={2} mr={2}>
                                        {selectedPermissions.length}
                                    </Badge>
                                    permissions selected
                                </Flex>
                            </Box>
                        </SimpleGrid>

                        <Divider my={8} borderColor="gray.100" />

                        {/* Permissions */}
                        <Stack spacing={6}>
                            {permissionsList.map((group, index) => {

                                const groupIds = group.permissions.map(p => p.id);

                                const isAllSelected =
                                    groupIds.every(id =>
                                        selectedPermissions.includes(id)
                                    );

                                const isIndeterminate =
                                    groupIds.some(id =>
                                        selectedPermissions.includes(id)
                                    ) && !isAllSelected;

                                return (
                                    <Box key={index} p={4} border="1px solid #eee" borderRadius="md">

                                        {/* Module Header */}
                                        <Flex justify="space-between" mb={3}>
                                            <Text fontWeight="bold">
                                                {group.module}
                                            </Text>

                                            <Button
                                                size="xs"
                                                onClick={() =>
                                                    handleSelectAllModule(group.permissions)
                                                }
                                            >
                                                {isAllSelected ? "Deselect All" : "Select All"}
                                            </Button>
                                        </Flex>

                                        {/* Permissions */}
                                        <Flex wrap="wrap" gap={4}>
                                            {group.permissions.map((perm) => (
                                                <Checkbox
                                                    key={perm.id}
                                                    isChecked={selectedPermissions.includes(perm.id)}
                                                    onChange={() =>
                                                        handlePermissionChange(perm.id)
                                                    }
                                                >
                                                    {perm.label}
                                                </Checkbox>
                                            ))}
                                        </Flex>

                                    </Box>
                                );
                            })}
                        </Stack>

                        {/* Submit */}
                        <Flex
                            mt={8}
                            justify={{ base: "stretch", md: "flex-end" }}
                            gap={4}
                            borderTop="1px solid"
                            borderColor="gray.100"
                            pt={6}
                        >
                            <Button
                                type="button"
                                as={ReactRouterLink}
                                to={ROLE_LIST_PATH}
                                colorScheme="gray"
                                variant="outline"
                                fontWeight="semibold"
                                px={6}
                                h={12}
                                borderRadius="md"
                                w={{ base: "full", md: "auto" }}
                                _hover={{ bg: "gray.50" }}
                            >
                                {t("cancel")}
                            </Button>

                            <Button
                                type="submit"
                                isLoading={isSubmitting}
                                loadingText="Saving..."
                                colorScheme="teal"
                                bg="teal.500"
                                color="white"
                                fontWeight="semibold"
                                px={8}
                                h={12}
                                borderRadius="md"
                                w={{ base: "full", md: "auto" }}
                                _hover={{ bg: "teal.600" }}
                                _active={{ bg: "teal.700" }}
                                boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)"
                            >
                                {t("save")}
                            </Button>
                        </Flex>

                    </form>
                </CardBody>
            </Card>
        </Box>
    );
};

export default Edit;