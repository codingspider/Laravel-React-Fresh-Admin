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
    HStack,
    useToast,
    Flex,
    Text,
    Select,
    Checkbox,
    Wrap,
    WrapItem,
    Badge,
    Divider,
    Stack,
    useColorModeValue
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { DASHBOARD_PATH, ROLE_LIST_PATH } from "../../../routes/superAdminRoutes";
import { STORE_ROLE } from "../../../routes/apiRoutes";

const Create = () => {
    const { register, handleSubmit, reset } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const pageBg = useColorModeValue("gray.50", "gray.900");
    const cardBg = useColorModeValue("white", "gray.800");
    const fieldBg = useColorModeValue("gray.50", "gray.900");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const subtleBorderColor = useColorModeValue("gray.100", "gray.700");
    const headingColor = useColorModeValue("gray.800", "gray.100");
    const textColor = useColorModeValue("gray.700", "gray.100");
    const mutedTextColor = useColorModeValue("gray.500", "gray.300");
    const softTextColor = useColorModeValue("gray.600", "gray.300");
    const permissionSelectedColor = useColorModeValue("teal.600", "teal.300");
    const permissionHoverBorder = useColorModeValue("teal.200", "teal.500");

    // State for permissions
    const [permissionsList, setPermissionsList] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    useEffect(() => {
        const mockData = [
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
                    { id: "role_list", label: "List" },
                    { id: "role_create", label: "Create" },
                    { id: "role_edit", label: "Edit" },
                    { id: "role_delete", label: "Delete" },
                ]
            },

            {
                module: "Reports",
                permissions: [
                { id: "view_report", label: "View Report" },
                ],
            },
            {
                module: "Settings",
                permissions: [
                    { id: "view_dashboard_data", label: "View Dashboard Data" },
                    { id: "access_business_settings", label: "Access Business Settings" },
                    { id: "access_invoice_settings", label: "Access Invoice Settings" },
                ]
            }
        ];
        setPermissionsList(mockData);
    }, []);

    // Handle individual checkbox change
    const handlePermissionChange = (permissionId) => {
        if (selectedPermissions.includes(permissionId)) {
            setSelectedPermissions(selectedPermissions.filter((id) => id !== permissionId));
        } else {
            setSelectedPermissions([...selectedPermissions, permissionId]);
        }
    };

    // Handle "Select All" for a specific module
    const handleSelectAllModule = (modulePermissions) => {
        const allModuleIds = modulePermissions.map(p => p.id);
        const allSelected = allModuleIds.every(id => selectedPermissions.includes(id));

        if (allSelected) {
            // Deselect all in this module
            setSelectedPermissions(prev => prev.filter(id => !allModuleIds.includes(id)));
        } else {
            // Select all in this module (avoid duplicates)
            setSelectedPermissions(prev => [...new Set([...prev, ...allModuleIds])]);
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            // Combine form data with selected permissions
            const payload = {
                ...data,
                permissions: selectedPermissions
            };

            console.log(payload);

            const res = await api.post(STORE_ROLE, payload);
            reset();
            setSelectedPermissions([]);
            
            toast({
                position: "bottom-right",
                title: res.data.message || t("success"),
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(`${ROLE_LIST_PATH}`);
        } catch (err) {
            const errorResponse = err?.response?.data;
            if (errorResponse?.errors) {
                const errorMessage = Object.values(errorResponse.errors)
                    .flat()
                    .join(" ");
                toast({
                    position: "bottom-right",
                    title: t("error"),
                    description: errorMessage,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } else if (errorResponse?.message) {
                toast({
                    position: "bottom-right",
                    title: t("error"),
                    description: errorResponse.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const app_name = localStorage.getItem("app_name") || "SuperAdmin";
        document.title = `${app_name} | Create Role`;
    }, []);

    return (
        <Box className="form-dark-surface" bg={pageBg} minH="100vh" py={3}>
            <Box mx="auto">
                
                {/* Modern Breadcrumb */}
                <Card mb={4} bg={cardBg} shadow="sm" borderRadius="lg" border="none">       
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
                                <BreadcrumbLink color={headingColor} fontWeight="bold">
                                    {t("add")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                {/* Main Form Card */}
                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={cardBg}>
                    <CardHeader
                        bg={cardBg}
                        borderBottom="1px solid"
                        borderColor={subtleBorderColor}
                        pb={6}
                    >
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="md" color={headingColor} fontWeight="bold">
                                    {t("add")}
                                </Heading>
                                <Text fontSize="sm" color={mutedTextColor} mt={1}>
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
                    
                    <CardBody p={8}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                
                                {/* Role Name Input */}
                                <FormControl isRequired>
                                    <FormLabel 
                                        fontSize="sm" 
                                        fontWeight="semibold" 
                                        color={textColor}
                                        mb={2}
                                    >
                                        {t("role_name")}
                                    </FormLabel>
                                    <Input
                                        {...register("name", { required: true })}
                                        type="text"
                                        placeholder={t("role_name_placeholder")}
                                        bg={fieldBg}
                                        border="1px solid"
                                        borderColor={borderColor}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor }}
                                        size="md"
                                        transition="all 0.2s"
                                    />
                                </FormControl>

                                {/* Selection Stats (Optional visual filler or summary) */}
                                <Box>
                                    <FormLabel 
                                        fontSize="sm" 
                                        fontWeight="semibold" 
                                        color={textColor}
                                        mb={2}
                                    >
                                        {t("selection_summary")}
                                    </FormLabel>
                                    <Flex 
                                        align="center" 
                                        bg={fieldBg} 
                                        border="1px solid" 
                                        borderColor={borderColor} 
                                        borderRadius="md" 
                                        h="42px" // Match input height
                                        px={4}
                                        color={softTextColor}
                                        fontSize="sm"
                                    >
                                        <Badge colorScheme="teal" borderRadius="full" px={2} mr={2}>
                                            {selectedPermissions.length}
                                        </Badge>
                                        {t("permissions_selected")}
                                    </Flex>
                                </Box>
                            </SimpleGrid>

                            <Divider my={8} borderColor={subtleBorderColor} />

                            {/* Permissions Section */}
                            <Box mb={8}>
                                <Flex justify="space-between" align="center" mb={4}>
                                    <Heading size="sm" color={headingColor} fontWeight="bold">
                                        {t("assign_permissions")}
                                    </Heading>
                                    {/* You could add a "Select All Permissions" global button here if needed */}
                                </Flex>

                                <Stack spacing={6}>
                                    {permissionsList.map((group, index) => {
                                        // Calculate if all in this group are selected
                                        const groupIds = group.permissions.map(p => p.id);
                                        const isAllSelected = groupIds.length > 0 && groupIds.every(id => selectedPermissions.includes(id));
                                        const isIndeterminate = !isAllSelected && groupIds.some(id => selectedPermissions.includes(id));

                                        return (
                                            <Box 
                                                key={index} 
                                                p={5} 
                                                border="1px solid" 
                                                borderColor={borderColor} 
                                                borderRadius="lg" 
                                                bg={cardBg}
                                                _hover={{ borderColor: permissionHoverBorder, boxShadow: "sm" }}
                                                transition="all 0.2s"
                                            >
                                                {/* Module Header with Select All */}
                                                <Flex 
                                                    justify="space-between" 
                                                    align="center" 
                                                    mb={4} 
                                                    pb={2} 
                                                    borderBottom="1px dashed" 
                                                    borderColor={subtleBorderColor}
                                                >
                                                    <Text fontWeight="bold" color={textColor} fontSize="md">
                                                        {group.module}
                                                    </Text>
                                                    <Button 
                                                        size="xs" 
                                                        variant="ghost"
                                                        colorScheme="teal" 
                                                        onClick={() => handleSelectAllModule(group.permissions)}
                                                    >
                                                        {isAllSelected ? t("deselect_all") : t("select_all")}
                                                    </Button>
                                                </Flex>

                                                {/* Horizontal Checkboxes */}
                                                <Flex wrap="wrap" gap={6}>
                                                {group.permissions.map((perm) => (
                                                    <Checkbox
                                                    key={perm.id}
                                                    isChecked={selectedPermissions.includes(perm.id)}
                                                    onChange={() => handlePermissionChange(perm.id)}
                                                    colorScheme="teal"
                                                    size="md"
                                                    sx={{
                                                        '[data-checked] + .chakra-checkbox__label': {
                                                        color: permissionSelectedColor,
                                                        fontWeight: '600'
                                                        }
                                                    }}
                                                    >
                                                    {perm.label}
                                                    </Checkbox>
                                                ))}
                                                </Flex>
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            </Box>

                            {/* Action Buttons */}
                            <Flex 
                                mt={8} 
                                justify={{ base: "stretch", md: "flex-end" }} 
                                gap={4}
                                borderTop="1px solid"
                                borderColor={subtleBorderColor}
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
                                    _hover={{ bg: fieldBg }}
                                >
                                    {t("cancel")}
                                </Button>

                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    loadingText={t("saving")}
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
        </Box>
    );
};

export default Create;
