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
    HStack,
    useToast,
    Flex,
    Text,
    Checkbox,
    Badge,
    Divider,
    Stack,
    Spinner,
    useColorModeValue,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { DASHBOARD_PATH, ROLE_LIST_PATH } from "../../../routes/superAdminRoutes";
import { STORE_ROLE } from "../../../routes/apiRoutes";
import PageHeader from "../../ui/PageHeader";
import FormCard from "../../ui/FormCard";

const PERMISSIONS_ENDPOINT = "/api/permissions";

const Create = () => {
    const { register, handleSubmit, reset } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
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
    const permissionHoverBorder = useColorModeValue("teal.200", "teal.500");

    const [permissionsList, setPermissionsList] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                setIsLoadingPermissions(true);
                const res = await api.get(PERMISSIONS_ENDPOINT);
                const allPermissions = res.data?.data || res.data || [];

                const grouped = {};
                allPermissions.forEach((perm) => {
                    const permName = typeof perm === "string" ? perm : perm.name;
                    const parts = permName.split("_");
                    let module;
                    if (["view", "create", "update", "delete", "access", "assign", "process"].includes(parts[0])) {
                        module = parts.slice(1, -1).join("_") || parts.slice(1).join("_") || parts[0];
                    } else {
                        module = parts[0];
                    }

                    const label = permName
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase());

                    if (!grouped[module]) {
                        grouped[module] = { module: module.charAt(0).toUpperCase() + module.slice(1), permissions: [] };
                    }
                    grouped[module].permissions.push({ id: permName, label });
                });

                setPermissionsList(Object.values(grouped));
            } catch (err) {
                console.error("fetchPermissions error:", err);
                const fallbackData = [
                    {
                        module: "User Management",
                        permissions: [
                            { id: "view_user", label: "View User" },
                            { id: "create_user", label: "Create User" },
                            { id: "update_user", label: "Update User" },
                            { id: "delete_user", label: "Delete User" },
                        ],
                    },
                    {
                        module: "Role Management",
                        permissions: [
                            { id: "role_list", label: "Role List" },
                            { id: "role_create", label: "Role Create" },
                            { id: "role_edit", label: "Role Edit" },
                            { id: "role_delete", label: "Role Delete" },
                        ],
                    },
                ];
                setPermissionsList(fallbackData);
            } finally {
                setIsLoadingPermissions(false);
            }
        };
        fetchPermissions();
    }, []);

    const handlePermissionChange = (permissionId) => {
        setSelectedPermissions((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleSelectAllModule = (modulePermissions) => {
        const allModuleIds = modulePermissions.map((p) => p.id);
        const allSelected = allModuleIds.every((id) => selectedPermissions.includes(id));

        if (allSelected) {
            setSelectedPermissions((prev) => prev.filter((id) => !allModuleIds.includes(id)));
        } else {
            setSelectedPermissions((prev) => [...new Set([...prev, ...allModuleIds])]);
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data, permissions: selectedPermissions };
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
            navigate(ROLE_LIST_PATH);
        } catch (err) {
            const errorResponse = err?.response?.data;
            if (errorResponse?.errors) {
                const errorMessage = Object.values(errorResponse.errors).flat().join(" ");
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

    return (
        <Box>
            <PageHeader
                title={t("add_role")}
                subtitle={t("create_new_role")}
                breadcrumbs={[
                    { label: t("dashboard"), path: DASHBOARD_PATH },
                    { label: t("roles"), path: ROLE_LIST_PATH },
                    { label: t("add"), isCurrent: true },
                ]}
            />

            <FormCard
                title={t("role_details")}
                subtitle={t("define_role_name_and_permissions")}
                backUrl={ROLE_LIST_PATH}
                onSubmit={handleSubmit(onSubmit)}
                footer={
                    <>
                        <Button
                            as={ReactRouterLink}
                            to={ROLE_LIST_PATH}
                            variant="outline"
                            colorScheme="gray"
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            loadingText={t("saving")}
                            colorScheme="teal"
                        >
                            {t("save")}
                        </Button>
                    </>
                }
            >
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl isRequired>
                        <FormLabel>{t("role_name")}</FormLabel>
                        <Input
                            {...register("name", { required: true })}
                            placeholder={t("role_name_placeholder")}
                        />
                    </FormControl>

                    <Box>
                        <FormLabel>{t("selection_summary")}</FormLabel>
                        <Flex
                            align="center"
                            bg={fieldBg}
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="md"
                            h="42px"
                            px={4}
                            fontSize="sm"
                        >
                            <Badge colorScheme="teal" borderRadius="full" px={2} mr={2}>
                                {selectedPermissions.length}
                            </Badge>
                            {t("permissions_selected")}
                        </Flex>
                    </Box>
                </SimpleGrid>

                <Divider my={6} borderColor={subtleBorderColor} />

                <Box mb={8}>
                    <Flex justify="space-between" align="center" mb={4}>
                        <Heading size="sm" fontWeight="bold">
                            {t("assign_permissions")}
                        </Heading>
                    </Flex>

                    {isLoadingPermissions ? (
                        <Flex justify="center" py={8}>
                            <Spinner size="lg" color="brand.500" />
                        </Flex>
                    ) : (
                        <Stack spacing={6}>
                            {permissionsList.map((group, index) => {
                                const groupIds = group.permissions.map((p) => p.id);
                                const isAllSelected = groupIds.length > 0 && groupIds.every((id) => selectedPermissions.includes(id));

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
                                        <Flex
                                            justify="space-between"
                                            align="center"
                                            mb={4}
                                            pb={2}
                                            borderBottom="1px dashed"
                                            borderColor={subtleBorderColor}
                                        >
                                            <Text fontWeight="bold" fontSize="md">
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

                                        <Flex wrap="wrap" gap={6}>
                                            {group.permissions.map((perm) => (
                                                <Checkbox
                                                    key={perm.id}
                                                    isChecked={selectedPermissions.includes(perm.id)}
                                                    onChange={() => handlePermissionChange(perm.id)}
                                                    colorScheme="teal"
                                                    size="md"
                                                >
                                                    {perm.label}
                                                </Checkbox>
                                            ))}
                                        </Flex>
                                    </Box>
                                );
                            })}
                        </Stack>
                    )}
                </Box>
            </FormCard>
        </Box>
    );
};

export default Create;
