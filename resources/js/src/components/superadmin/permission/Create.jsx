import {
    Box,
    Button,
    Heading,
    SimpleGrid,
    FormControl,
    FormLabel,
    Input,
    useToast,
    Flex,
    Text,
    Checkbox,
    Badge,
    Divider,
    Stack,
    Spinner,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import { STORE_ROLE } from "../../../routes/apiRoutes";
import PageHeader from "../../ui/PageHeader";
import FormCard from "../../ui/FormCard";
import useThemeColors from "../../../hooks/useThemeColors";

const PERMISSIONS_ENDPOINT = "/permissions";
const LIST_PATH = "/role/list";

const Create = () => {
    const { register, handleSubmit, reset } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
    const toast = useToast();
    const navigate = useNavigate();
    const colors = useThemeColors();

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
                position: "top-right",
                title: res.data.message || t("success"),
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(LIST_PATH);
        } catch (err) {
            const errorResponse = err?.response?.data;
            if (errorResponse?.errors) {
                const errorMessage = Object.values(errorResponse.errors).flat().join(" ");
                toast({
                    position: "top-right",
                    title: t("error"),
                    description: errorMessage,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } else if (errorResponse?.message) {
                toast({
                    position: "top-right",
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
                    { label: t("roles"), path: LIST_PATH },
                    { label: t("add"), isCurrent: true },
                ]}
            />

            <FormCard
                title={t("role_details")}
                subtitle={t("define_role_name_and_permissions")}
                backUrl={LIST_PATH}
                onSubmit={handleSubmit(onSubmit)}
                maxWidth="full"
                footer={
                    <>
                        <Button
                            as={ReactRouterLink}
                            to={LIST_PATH}
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
                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("role_name")}</FormLabel>
                        <Input
                            {...register("name", { required: true })}
                            placeholder={t("role_name_placeholder")}
                            bg={colors.bgInput}
                            border="1px solid"
                            borderColor={colors.borderInput}
                            borderRadius="md"
                            focusBorderColor="teal.500"
                            _hover={{ borderColor: "gray.300" }}
                            size="md"
                            transition="all 0.2s"
                        />
                    </FormControl>

                    <Box>
                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("selection_summary")}</FormLabel>
                        <Flex
                            align="center"
                            bg={colors.bgInput}
                            border="1px solid"
                            borderColor={colors.borderInput}
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

                <Divider my={6} borderColor={colors.borderSubtle} />

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
                                        borderColor={colors.borderDefault}
                                        borderRadius="lg"
                                        bg={colors.bgCard}
                                        _hover={{ borderColor: "teal.200", boxShadow: "sm" }}
                                        transition="all 0.2s"
                                    >
                                        <Flex
                                            justify="space-between"
                                            align="center"
                                            mb={4}
                                            pb={2}
                                            borderBottom="1px dashed"
                                            borderColor={colors.borderSubtle}
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
