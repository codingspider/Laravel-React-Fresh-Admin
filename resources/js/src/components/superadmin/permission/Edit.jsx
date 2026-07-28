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
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { DASHBOARD_PATH, ROLE_LIST_PATH } from "../../../routes/superAdminRoutes";
import { GET_EDIT_ROLE, UPDATE_ROLE } from "../../../routes/apiRoutes";
import { useTranslation } from "react-i18next";
import PageHeader from "../../ui/PageHeader";
import FormCard from "../../ui/FormCard";

const PERMISSIONS_ENDPOINT = "/api/permissions";

const Edit = () => {
    const { register, handleSubmit, reset } = useForm();
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();
    const { t } = useTranslation();
    const pageBg = useColorModeValue("gray.50", "gray.900");
    const cardBg = useColorModeValue("white", "gray.800");
    const fieldBg = useColorModeValue("gray.50", "gray.900");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const subtleBorderColor = useColorModeValue("gray.100", "gray.700");
    const headingColor = useColorModeValue("gray.800", "gray.100");
    const textColor = useColorModeValue("gray.700", "gray.100");
    const permissionHoverBorder = useColorModeValue("teal.200", "teal.500");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [permissionsList, setPermissionsList] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingData(true);
                const [permRes, roleRes] = await Promise.all([
                    api.get(PERMISSIONS_ENDPOINT),
                    api.get(GET_EDIT_ROLE(id)),
                ]);

                const allPermissions = permRes.data?.data || permRes.data || [];
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
                    const label = permName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                    if (!grouped[module]) {
                        grouped[module] = { module: module.charAt(0).toUpperCase() + module.slice(1), permissions: [] };
                    }
                    grouped[module].permissions.push({ id: permName, label });
                });
                setPermissionsList(Object.values(grouped));

                const role = roleRes.data.data;
                reset({ name: role.name });
                setSelectedPermissions(role.permissions || []);
            } catch (error) {
                console.error(error);
                toast({
                    position: "top-right",
                    title: t("error_loading_role"),
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setIsLoadingData(false);
            }
        };
        if (id) fetchData();
    }, [id, reset]);

    const handlePermissionChange = (permissionId) => {
        setSelectedPermissions((prev) =>
            prev.includes(permissionId) ? prev.filter((p) => p !== permissionId) : [...prev, permissionId]
        );
    };

    const handleSelectAllModule = (modulePermissions) => {
        const ids = modulePermissions.map((p) => p.id);
        const allSelected = ids.every((id) => selectedPermissions.includes(id));

        if (allSelected) {
            setSelectedPermissions((prev) => prev.filter((pid) => !ids.includes(pid)));
        } else {
            setSelectedPermissions((prev) => [...new Set([...prev, ...ids])]);
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data, permissions: selectedPermissions };
            const res = await api.put(UPDATE_ROLE(id), payload);
            toast({
                title: res.data.message || t("success"),
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "bottom-right",
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
            } else {
                toast({
                    title: t("error"),
                    description: errorResponse?.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom-right",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
                <Spinner size="xl" color="brand.500" />
            </Box>
        );
    }

    return (
        <Box>
            <PageHeader
                title={t("edit_role")}
                subtitle={t("update_role_and_permissions")}
                breadcrumbs={[
                    { label: t("dashboard"), path: DASHBOARD_PATH },
                    { label: t("roles"), path: ROLE_LIST_PATH },
                    { label: t("edit"), isCurrent: true },
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

                    <Stack spacing={6}>
                        {permissionsList.map((group, index) => {
                            const groupIds = group.permissions.map((p) => p.id);
                            const isAllSelected = groupIds.length > 0 && groupIds.every((pid) => selectedPermissions.includes(pid));

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
                </Box>
            </FormCard>
        </Box>
    );
};

export default Edit;
