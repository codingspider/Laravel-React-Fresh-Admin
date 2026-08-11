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
    Spinner,
    HStack,
    VStack,
    Select,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import { GET_EDIT_ROLE, UPDATE_ROLE, BRANCH_OPTIONS } from "../../../routes/apiRoutes";
import { useTranslation } from "react-i18next";
import PageHeader from "../../ui/PageHeader";
import FormCard from "../../ui/FormCard";
import useThemeColors from "../../../hooks/useThemeColors";
import { usePermission } from "../../../context/PermissionContext";

const PERMISSIONS_ENDPOINT = "/permissions";
const LIST_PATH = "/role/list";

const SUPER_ADMIN_PERMISSIONS = [
    'view_plans', 'create_plans', 'update_plans', 'delete_plans',
    'view_packages', 'create_packages', 'update_packages', 'delete_packages',
    'view_subscriptions', 'create_subscriptions', 'update_subscriptions', 'delete_subscriptions',
    'view_restaurants', 'create_restaurants', 'update_restaurants', 'delete_restaurants',
    'view_currencies', 'create_currencies', 'update_currencies', 'delete_currencies',
    'view_backups', 'create_backups', 'restore_backups', 'delete_backups',
    'view_activity_logs',
    'access_business_settings', 'access_invoice_settings',
    'view_reports', 'view_sale_report', 'view_purchase_report', 'view_tax_report', 'view_expense_report',
];

const Edit = () => {
    const { register, handleSubmit, reset } = useForm();
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();
    const { t } = useTranslation();
    const colors = useThemeColors();
    const { hasRole } = usePermission();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [adminPermissions, setAdminPermissions] = useState([]);
    const [superAdminPermissions, setSuperAdminPermissions] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");

    const isSuperAdmin = hasRole('super_admin');

    const getModuleLabel = (permName) => {
        if (permName.includes('plan')) return 'Plans';
        if (permName.includes('package')) return 'Packages';
        if (permName.includes('subscription')) return 'Subscriptions';
        if (permName.includes('restaurant')) return 'Restaurants';
        if (permName.includes('currency')) return 'Currencies';
        if (permName.includes('backup')) return 'Backups';
        if (permName.includes('report') || permName.includes('sale_report') || permName.includes('purchase_report') || permName.includes('tax_report') || permName.includes('expense_report')) return 'Reports';
        if (permName.includes('activity')) return 'Activity Logs';
        if (permName.includes('setting')) return 'Settings';
        const parts = permName.split("_");
        if (["view", "create", "update", "delete", "access", "assign", "process", "manage"].includes(parts[0])) {
            return parts.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        }
        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingData(true);
                const [permRes, roleRes] = await Promise.all([
                    api.get(PERMISSIONS_ENDPOINT),
                    api.get(GET_EDIT_ROLE(id)),
                ]);

                const allPermissions = permRes.data?.data || permRes.data || [];
                const adminGrouped = {};
                const superGrouped = {};

                allPermissions.forEach((perm) => {
                    const permName = typeof perm === "string" ? perm : perm.name;
                    const label = permName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                    const permObj = { id: permName, label };
                    const module = getModuleLabel(permName);

                    if (SUPER_ADMIN_PERMISSIONS.includes(permName)) {
                        if (!superGrouped[module]) superGrouped[module] = { module, permissions: [] };
                        superGrouped[module].permissions.push(permObj);
                    } else {
                        if (!adminGrouped[module]) adminGrouped[module] = { module, permissions: [] };
                        adminGrouped[module].permissions.push(permObj);
                    }
                });

                setAdminPermissions(Object.values(adminGrouped));
                setSuperAdminPermissions(Object.values(superGrouped));

                const role = roleRes.data.data;
                reset({ name: role.name });
                setSelectedPermissions(role.permissions || []);
                setSelectedBranch(role.branch_id || "");
            } catch (error) {
                console.error(error);
                toast({ title: t("error_loading_role"), status: "error", duration: 3000, isClosable: true });
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

    useEffect(() => {
        api.get(BRANCH_OPTIONS)
            .then((res) => {
                const data = res.data?.data || res.data?.data?.data || [];
                setBranches(Array.isArray(data) ? data : []);
            })
            .catch(() => { });
    }, []);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data, permissions: selectedPermissions, branch_id: selectedBranch || undefined };
            const res = await api.put(UPDATE_ROLE(id), payload);
            toast({ title: res.data.message || t("success"), status: "success", duration: 3000, isClosable: true });
            navigate(LIST_PATH);
        } catch (err) {
            const errorResponse = err?.response?.data;
            if (errorResponse?.errors) {
                toast({ title: t("error"), description: Object.values(errorResponse.errors).flat().join(" "), status: "error", duration: 3000, isClosable: true });
            } else {
                toast({ title: t("error"), description: errorResponse?.message, status: "error", duration: 3000, isClosable: true });
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
                    { label: t("roles"), path: LIST_PATH },
                    { label: t("edit"), isCurrent: true },
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
                        <Button as={ReactRouterLink} to={LIST_PATH} variant="outline" colorScheme="gray">
                            {t("cancel")}
                        </Button>
                        <Button type="submit" isLoading={isSubmitting} loadingText={t("saving")} colorScheme="teal">
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

                    <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("branch")}</FormLabel>
                        <Select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            placeholder={t("all_branches")}
                            bg={colors.bgInput}
                            border="1px solid"
                            borderColor={colors.borderInput}
                            borderRadius="md"
                            focusBorderColor="teal.500"
                            _hover={{ borderColor: "gray.300" }}
                            size="md"
                            transition="all 0.2s"
                        >
                            {(Array.isArray(branches) ? branches : []).map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </Select>
                    </FormControl>
                </SimpleGrid>

                <Divider my={6} borderColor={colors.borderSubtle} />

                <Box mb={8}>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5} mb={8}>
                        {adminPermissions.map((group, index) => {
                            const groupIds = group.permissions.map((p) => p.id);
                            const isAllSelected = groupIds.length > 0 && groupIds.every((pid) => selectedPermissions.includes(pid));
                            const selectedCount = groupIds.filter((id) => selectedPermissions.includes(id)).length;

                            const gradients = [
                                'linear-gradient(135deg, #0d9488, #14b8a6)',
                                'linear-gradient(135deg, #667eea, #764ba2)',
                                'linear-gradient(135deg, #f093fb, #f5576c)',
                                'linear-gradient(135deg, #f59e0b, #f97316)',
                                'linear-gradient(135deg, #43e97b, #38f9d7)',
                                'linear-gradient(135deg, #a18cd1, #fbc2eb)',
                                'linear-gradient(135deg, #4facfe, #00f2fe)',
                                'linear-gradient(135deg, #fccb90, #d57eeb)',
                            ];
                            const headerBg = gradients[index % gradients.length];

                            return (
                                <Box key={index} borderRadius="xl" overflow="hidden" border="1px solid" borderColor={colors.borderDefault} bg={colors.bgCard} _hover={{ boxShadow: 'md' }} transition="all 0.2s">
                                    <Flex justify="space-between" align="center" p={4} bg={headerBg} color="white">
                                        <HStack spacing={2}>
                                            <Heading size="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">{group.module}</Heading>
                                            {selectedCount > 0 && (
                                                <Badge bg="rgba(255,255,255,0.25)" color="white" borderRadius="full" fontSize="10px" px={2}>
                                                    {selectedCount}/{groupIds.length}
                                                </Badge>
                                            )}
                                        </HStack>
                                        <Button size="xs" variant="ghost" color="white" _hover={{ bg: 'rgba(255,255,255,0.15)' }} onClick={() => handleSelectAllModule(group.permissions)} fontWeight="600">
                                            {isAllSelected ? t("deselect_all") : t("select_all")}
                                        </Button>
                                    </Flex>
                                    <VStack spacing={3} align="stretch" p={4}>
                                        {group.permissions.map((perm) => (
                                            <Checkbox key={perm.id} isChecked={selectedPermissions.includes(perm.id)} onChange={() => handlePermissionChange(perm.id)} colorScheme="teal" size="sm" w="100%" py={1}>
                                                <Text fontSize="sm" ml={1}>{perm.label}</Text>
                                            </Checkbox>
                                        ))}
                                    </VStack>
                                </Box>
                            );
                        })}
                    </SimpleGrid>

                    {isSuperAdmin && superAdminPermissions.length > 0 && (
                        <Box>
                            <Divider my={6} borderColor={colors.borderSubtle} />
                            <Heading size="sm" fontWeight="bold" mb={2} color="purple.600">
                                {t("Super Admin Permissions")}
                            </Heading>
                            <Text fontSize="xs" color={colors.textSecondary} mb={4}>
                                {t("These permissions are only available to super admin roles")}
                            </Text>
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                                {superAdminPermissions.map((group, index) => {
                                    const groupIds = group.permissions.map((p) => p.id);
                                    const isAllSelected = groupIds.length > 0 && groupIds.every((pid) => selectedPermissions.includes(pid));
                                    const selectedCount = groupIds.filter((id) => selectedPermissions.includes(id)).length;

                                    return (
                                        <Box key={index} borderRadius="xl" overflow="hidden" border="1px solid" borderColor="purple.200" bg={colors.bgCard} _hover={{ boxShadow: 'md' }} transition="all 0.2s">
                                            <Flex justify="space-between" align="center" p={4} bg="linear-gradient(135deg, #7c3aed, #a855f7)" color="white">
                                                <HStack spacing={2}>
                                                    <Heading size="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">{group.module}</Heading>
                                                    {selectedCount > 0 && (
                                                        <Badge bg="rgba(255,255,255,0.25)" color="white" borderRadius="full" fontSize="10px" px={2}>
                                                            {selectedCount}/{groupIds.length}
                                                        </Badge>
                                                    )}
                                                </HStack>
                                                <Button size="xs" variant="ghost" color="white" _hover={{ bg: 'rgba(255,255,255,0.15)' }} onClick={() => handleSelectAllModule(group.permissions)} fontWeight="600">
                                                    {isAllSelected ? t("deselect_all") : t("select_all")}
                                                </Button>
                                            </Flex>
                                            <VStack spacing={3} align="stretch" p={4}>
                                                {group.permissions.map((perm) => (
                                                    <Checkbox key={perm.id} isChecked={selectedPermissions.includes(perm.id)} onChange={() => handlePermissionChange(perm.id)} colorScheme="purple" size="sm" w="100%" py={1}>
                                                        <Text fontSize="sm" ml={1}>{perm.label}</Text>
                                                    </Checkbox>
                                                ))}
                                            </VStack>
                                        </Box>
                                    );
                                })}
                            </SimpleGrid>
                        </Box>
                    )}
                </Box>
            </FormCard>
        </Box>
    );
};

export default Edit;
