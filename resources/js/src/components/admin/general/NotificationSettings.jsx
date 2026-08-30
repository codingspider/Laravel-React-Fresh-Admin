import React, { useCallback, useEffect, useState } from "react";
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    SimpleGrid,
    Spinner,
    Switch,
    Text,
    Textarea,
    useToast,
    VStack,
    HStack,
    Badge,
    IconButton,
    Tooltip,
    Alert,
    AlertIcon,
} from "@chakra-ui/react";
import { MdAdd, MdEdit, MdDelete, MdSend } from "react-icons/md";
import { useTranslation } from "react-i18next";
import api from "../../../axios";
import useThemeColors from "../../../hooks/useThemeColors";
import {
    BRANCH_OPTIONS,
    GET_NOTIFICATION_SETTING_V1,
    UPDATE_NOTIFICATION_SETTING_V1,
    TEST_SMS_V1,
    TEST_EMAIL_V1,
    LIST_SMS_TEMPLATES_V1,
    STORE_SMS_TEMPLATE_V1,
    UPDATE_SMS_TEMPLATE_V1,
    DELETE_SMS_TEMPLATE_V1,
} from "../../../routes/apiRoutes";

const defaultConfig = {
    email_enabled: true,
    whatsapp_enabled: false,
    email: { host: "", port: 587, username: "", password: "", encryption: "tls", from_email: "", from_name: "" },
    whatsapp: { sid: "", token: "", from: "" },
};

const mergeConfig = (config) => ({
    ...defaultConfig,
    ...config,
    email: { ...defaultConfig.email, ...(config?.email || {}) },
    whatsapp: { ...defaultConfig.whatsapp, ...(config?.whatsapp || {}) },
});

const NotificationSettings = () => {
    const colors = useThemeColors();
    const { t } = useTranslation();
    const toast = useToast();

    const [branches, setBranches] = useState([]);
    const [branchId, setBranchId] = useState(null);
    const [config, setConfig] = useState(defaultConfig);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [templates, setTemplates] = useState([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [templateModal, setTemplateModal] = useState({ open: false, editing: null });
    const [testModal, setTestModal] = useState({ open: false, body: "", to: "", channel: "whatsapp", template: null });
    const [emailModal, setEmailModal] = useState({ open: false, to: "" });
    const [sendingEmail, setSendingEmail] = useState(false);

    const inputProps = {
        bg: colors.bgInput,
        border: "1px solid",
        borderColor: colors.borderInput,
        borderRadius: "md",
        focusBorderColor: "teal.500",
        _hover: { borderColor: "gray.300" },
        size: "md",
        transition: "all 0.2s",
    };

    const labelProps = { fontSize: "sm", fontWeight: "semibold", color: colors.textPrimary, mb: 1 };

    const showError = (err) => {
        const errorResponse = err?.response?.data;
        const errorMessage = errorResponse?.errors
            ? Object.values(errorResponse.errors).flat().join(" ")
            : errorResponse?.message || t("something_went_wrong");
        toast({ title: t("error"), description: errorMessage, status: "error", duration: 4000, isClosable: true });
    };

    const fetchSettings = useCallback(async (branch) => {
        try {
            const res = await api.get(GET_NOTIFICATION_SETTING_V1, { params: branch ? { branch_id: branch } : {} });
            const data = res.data?.data || {};
            setBranchId(data.branch_id ?? null);
            setConfig(mergeConfig(data.config));
        } catch (err) {
            showError(err);
        }
    }, []);

    const fetchTemplates = useCallback(async (branch) => {
        setTemplatesLoading(true);
        try {
            const res = await api.get(LIST_SMS_TEMPLATES_V1, { params: branch ? { branch_id: branch } : {} });
            const items = res.data?.data || res.data?.data?.data || [];
            setTemplates(items);
        } catch (err) {
            showError(err);
        }
        setTemplatesLoading(false);
    }, []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [branchRes] = await Promise.all([api.get(BRANCH_OPTIONS)]);
                const branchData = branchRes.data?.data || branchRes.data?.data?.data || [];
                setBranches(branchData);

                const res = await api.get(GET_NOTIFICATION_SETTING_V1);
                const data = res.data?.data || {};
                const resolvedBranch = data.branch_id ?? null;
                setBranchId(resolvedBranch);
                setConfig(mergeConfig(data.config));

                if (resolvedBranch) {
                    await fetchTemplates(resolvedBranch);
                }
            } catch (err) {
                showError(err);
            }
            setLoading(false);
        })();
    }, [fetchTemplates]);

    const handleBranchChange = async (value) => {
        const branch = value ? Number(value) : null;
        setBranchId(branch);
        setLoading(true);
        await fetchSettings(branch);
        await fetchTemplates(branch);
        setLoading(false);
    };

    const setConfigPath = (path, value) => {
        setConfig((prev) => {
            const next = { ...prev };
            const keys = path.split(".");
            let cursor = next;
            for (let i = 0; i < keys.length - 1; i++) {
                cursor = cursor[keys[i]];
            }
            cursor[keys[keys.length - 1]] = value;
            return next;
        });
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await api.put(UPDATE_NOTIFICATION_SETTING_V1, { branch_id: branchId, config });
            toast({ title: t("settings_saved"), status: "success", duration: 3000, isClosable: true });
        } catch (err) {
            showError(err);
        }
        setSaving(false);
    };

    const openTemplateModal = (template) => {
        setTemplateModal({
            open: true,
            editing: template || null,
            name: template?.name || "",
            channel: "whatsapp",
            body: template?.body || "",
            is_active: template?.is_active ?? true,
        });
    };

    const saveTemplate = async () => {
        const payload = {
            branch_id: branchId,
            name: templateModal.name,
            channel: "whatsapp",
            body: templateModal.body,
            is_active: templateModal.is_active,
        };
        try {
            if (templateModal.editing) {
                await api.put(UPDATE_SMS_TEMPLATE_V1(templateModal.editing.id), payload);
                toast({ title: t("template_updated"), status: "success", duration: 3000, isClosable: true });
            } else {
                await api.post(STORE_SMS_TEMPLATE_V1, payload);
                toast({ title: t("template_saved"), status: "success", duration: 3000, isClosable: true });
            }
            setTemplateModal({ open: false, editing: null });
            await fetchTemplates(branchId);
        } catch (err) {
            showError(err);
        }
    };

    const deleteTemplate = async (template) => {
        if (!window.confirm(t("delete_template_confirm"))) return;
        try {
            await api.delete(DELETE_SMS_TEMPLATE_V1(template.id), { data: { branch_id: branchId } });
            toast({ title: t("template_deleted"), status: "success", duration: 3000, isClosable: true });
            await fetchTemplates(branchId);
        } catch (err) {
            showError(err);
        }
    };

    const toggleTemplate = async (template) => {
        try {
            await api.put(UPDATE_SMS_TEMPLATE_V1(template.id), {
                branch_id: branchId,
                is_active: !template.is_active,
            });
            await fetchTemplates(branchId);
        } catch (err) {
            showError(err);
        }
    };

    const openTestModal = (template) => {
        setTestModal({
            open: true,
            template,
            channel: "whatsapp",
            body: template?.body || "",
            to: "",
        });
    };

    const sendTest = async () => {
        try {
            await api.post(TEST_SMS_V1, {
                branch_id: branchId,
                channel: "whatsapp",
                to: testModal.to,
                body: testModal.body,
            });
            toast({ title: t("test_sent"), status: "success", duration: 3000, isClosable: true });
            setTestModal((prev) => ({ ...prev, open: false }));
        } catch (err) {
            const errorResponse = err?.response?.data;
            toast({
                title: t("test_send_failed"),
                description: errorResponse?.message || t("something_went_wrong"),
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        }
    };

    const sendTestEmail = async () => {
        setSendingEmail(true);
        try {
            await api.post(TEST_EMAIL_V1, { branch_id: branchId, to: emailModal.to });
            toast({ title: t("test_email_sent"), status: "success", duration: 3000, isClosable: true });
            setEmailModal({ open: false, to: "" });
        } catch (err) {
            const errorResponse = err?.response?.data;
            toast({
                title: t("test_email_failed"),
                description: errorResponse?.message || t("something_went_wrong"),
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        }
        setSendingEmail(false);
    };

    if (loading) {
        return (
            <Flex justify="center" py={10}>
                <Spinner size="xl" color="teal.500" />
            </Flex>
        );
    }

    const whatsappTemplates = templates.filter((t) => t.channel === "whatsapp");

    return (
        <Box>
            <Alert status="info" mb={6} borderRadius="md" fontSize="sm">
                <AlertIcon />
                {t("notification_settings_help")} {t("select_branch_to_configure")}
            </Alert>

            {/* Branch selector */}
            <FormControl mb={6} maxW="sm">
                <FormLabel {...labelProps}>{t("branch")}</FormLabel>
                <Select
                    value={branchId ?? ""}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    {...inputProps}
                >
                    {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                </Select>
            </FormControl>

            {/* Channel toggles */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={8}>
                {[
                    { key: "email_enabled", label: t("email_notifications"), icon: "✉️" },
                    { key: "whatsapp_enabled", label: t("whatsapp_notifications"), icon: "💬" },
                ].map(({ key, label, icon }) => (
                    <Flex
                        key={key}
                        justify="space-between"
                        align="center"
                        p={4}
                        bg={colors.bgSubtle}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor={colors.borderInput}
                    >
                        <HStack spacing={2}>
                            <Text fontSize="lg">{icon}</Text>
                            <Text fontWeight="semibold" fontSize="sm" color={colors.textPrimary}>{label}</Text>
                        </HStack>
                        <Switch
                            colorScheme="teal"
                            isChecked={!!config[key]}
                            onChange={(e) => setConfigPath(key, e.target.checked)}
                            size="lg"
                        />
                    </Flex>
                ))}
            </SimpleGrid>

            {/* ── Email (SMTP) Settings ── */}
            <Box mb={8}>
                <Flex justify="space-between" align="center" mb={1}>
                    <HStack spacing={2}>
                        <Badge colorScheme="blue" fontSize="xs">EMAIL</Badge>
                        <Text fontWeight="bold" color={colors.textPrimary}>{t("smtp_settings")}</Text>
                    </HStack>
                    <Button
                        size="sm"
                        leftIcon={<MdSend />}
                        variant="outline"
                        colorScheme="teal"
                        onClick={() => setEmailModal({ open: true, to: "" })}
                    >
                        {t("test_email")}
                    </Button>
                </Flex>
                <Text fontSize="xs" color={colors.textSecondary} mb={3}>{t("test_email_help")}</Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                    <FormControl>
                        <FormLabel {...labelProps}>{t("host")}</FormLabel>
                        <Input {...inputProps} value={config.email.host} onChange={(e) => setConfigPath("email.host", e.target.value)} />
                    </FormControl>
                    <FormControl>
                        <FormLabel {...labelProps}>{t("port")}</FormLabel>
                        <Input type="number" {...inputProps} value={config.email.port} onChange={(e) => setConfigPath("email.port", e.target.value)} />
                    </FormControl>
                    <FormControl>
                        <FormLabel {...labelProps}>{t("username")}</FormLabel>
                        <Input {...inputProps} value={config.email.username} onChange={(e) => setConfigPath("email.username", e.target.value)} />
                    </FormControl>
                    <FormControl>
                        <FormLabel {...labelProps}>{t("password")}</FormLabel>
                        <Input type="password" {...inputProps} value={config.email.password} onChange={(e) => setConfigPath("email.password", e.target.value)} />
                    </FormControl>
                    <FormControl>
                        <FormLabel {...labelProps}>{t("encryption")}</FormLabel>
                        <Select {...inputProps} value={config.email.encryption} onChange={(e) => setConfigPath("email.encryption", e.target.value)}>
                            <option value="tls">TLS</option>
                            <option value="ssl">SSL</option>
                        </Select>
                    </FormControl>
                    <FormControl>
                        <FormLabel {...labelProps}>{t("from_email")}</FormLabel>
                        <Input {...inputProps} value={config.email.from_email} onChange={(e) => setConfigPath("email.from_email", e.target.value)} />
                    </FormControl>
                    <FormControl>
                        <FormLabel {...labelProps}>{t("from_name")}</FormLabel>
                        <Input {...inputProps} value={config.email.from_name} onChange={(e) => setConfigPath("email.from_name", e.target.value)} />
                    </FormControl>
                </SimpleGrid>
            </Box>

            {/* ── WhatsApp (Twilio) Settings ── */}
            <Box mb={8}>
                <Flex justify="space-between" align="center" mb={1}>
                    <HStack spacing={2}>
                        <Badge colorScheme="green" fontSize="xs">WHATSAPP</Badge>
                        <Text fontWeight="bold" color={colors.textPrimary}>Twilio {t("whatsapp")} Settings</Text>
                    </HStack>
                </Flex>
                <Text fontSize="xs" color={colors.textSecondary} mb={3}>
                    {t("credentials_help")} Configure your Twilio WhatsApp API credentials below.
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                    <FormControl>
                        <FormLabel {...labelProps}>{t("account_sid")}</FormLabel>
                        <Input {...inputProps} value={config.whatsapp.sid} onChange={(e) => setConfigPath("whatsapp.sid", e.target.value)} placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                    </FormControl>
                    <FormControl>
                        <FormLabel {...labelProps}>{t("auth_token")}</FormLabel>
                        <Input type="password" {...inputProps} value={config.whatsapp.token} onChange={(e) => setConfigPath("whatsapp.token", e.target.value)} />
                    </FormControl>
                    <FormControl>
                        <FormLabel {...labelProps}>{t("whatsapp")} {t("from_number")}</FormLabel>
                        <Input {...inputProps} value={config.whatsapp.from} onChange={(e) => setConfigPath("whatsapp.from", e.target.value)} placeholder="+14155238886" />
                    </FormControl>
                </SimpleGrid>
            </Box>

            {/* Save settings */}
            <Flex justify="flex-end" mb={10}>
                <Button
                    colorScheme="teal"
                    bg="teal.500"
                    color="white"
                    fontWeight="semibold"
                    px={8}
                    h={12}
                    isLoading={saving}
                    loadingText={t("saving_data")}
                    onClick={saveSettings}
                >
                    {t("save")}
                </Button>
            </Flex>

            {/* ── WhatsApp Templates ── */}
            <Box>
                <Flex justify="space-between" align="center" mb={1}>
                    <HStack spacing={2}>
                        <Badge colorScheme="green" fontSize="xs">WHATSAPP</Badge>
                        <Text fontWeight="bold" color={colors.textPrimary}>{t("sms_templates")}</Text>
                    </HStack>
                    <Button size="sm" leftIcon={<MdAdd />} colorScheme="teal" onClick={() => openTemplateModal(null)}>
                        {t("add_template")}
                    </Button>
                </Flex>
                <Text fontSize="xs" color={colors.textSecondary} mb={4}>{t("sms_templates_help")}</Text>

                {templatesLoading ? (
                    <Flex justify="center" py={6}>
                        <Spinner color="teal.500" />
                    </Flex>
                ) : (
                    <VStack spacing={3} align="stretch">
                        {whatsappTemplates.map((template) => {
                            const isSystem = template.restaurant_id === null;
                            return (
                                <Flex
                                    key={template.id}
                                    justify="space-between"
                                    align="center"
                                    p={4}
                                    bg={colors.bgSubtle}
                                    borderRadius="lg"
                                    border="1px solid"
                                    borderColor={colors.borderInput}
                                >
                                    <Box flex={1} mr={4}>
                                        <Text fontWeight="semibold" color={colors.textPrimary} fontSize="sm">
                                            {template.name} {isSystem && <Badge colorScheme="gray" ml={1}>{t("default_branch")}</Badge>}
                                        </Text>
                                        <Text fontSize="xs" color={colors.textSecondary} noOfLines={2}>{template.body}</Text>
                                    </Box>
                                    <HStack spacing={1}>
                                        {!isSystem && (
                                            <Switch
                                                colorScheme="teal"
                                                isChecked={!!template.is_active}
                                                onChange={() => toggleTemplate(template)}
                                                size="sm"
                                            />
                                        )}
                                        <Tooltip label={t("test_message")}>
                                            <IconButton size="sm" variant="ghost" icon={<MdSend />} onClick={() => openTestModal(template)} />
                                        </Tooltip>
                                        {!isSystem && (
                                            <>
                                                <Tooltip label={t("edit_template")}>
                                                    <IconButton size="sm" variant="ghost" icon={<MdEdit />} onClick={() => openTemplateModal(template)} />
                                                </Tooltip>
                                                <Tooltip label={t("delete_template")}>
                                                    <IconButton size="sm" variant="ghost" colorScheme="red" icon={<MdDelete />} onClick={() => deleteTemplate(template)} />
                                                </Tooltip>
                                            </>
                                        )}
                                    </HStack>
                                </Flex>
                            );
                        })}
                        {whatsappTemplates.length === 0 && (
                            <Text fontSize="sm" color={colors.textSecondary}>{t("no_templates")}</Text>
                        )}
                    </VStack>
                )}
            </Box>

            {/* ── Template Modal ── */}
            <Modal isOpen={templateModal.open} onClose={() => setTemplateModal({ open: false, editing: null })} size="xl">
                <ModalOverlay />
                <ModalContent bg={colors.bgCard}>
                    <ModalHeader color={colors.textPrimary}>
                        {templateModal.editing ? t("edit_template") : t("add_template")}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl isRequired>
                                <FormLabel {...labelProps}>{t("template_name")}</FormLabel>
                                <Input
                                    {...inputProps}
                                    value={templateModal.name || ""}
                                    onChange={(e) => setTemplateModal((prev) => ({ ...prev, name: e.target.value }))}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel {...labelProps}>{t("message_body")}</FormLabel>
                                <Textarea
                                    rows={5}
                                    {...inputProps}
                                    value={templateModal.body || ""}
                                    onChange={(e) => setTemplateModal((prev) => ({ ...prev, body: e.target.value }))}
                                />
                                <Text fontSize="xs" color={colors.textSecondary} mt={1}>{t("template_body_help")}</Text>
                            </FormControl>
                            <Flex justify="space-between" align="center">
                                <Text fontSize="sm" fontWeight="semibold" color={colors.textPrimary}>{t("status")}</Text>
                                <Switch
                                    colorScheme="teal"
                                    isChecked={templateModal.is_active ?? true}
                                    onChange={(e) => setTemplateModal((prev) => ({ ...prev, is_active: e.target.checked }))}
                                />
                            </Flex>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={() => setTemplateModal({ open: false, editing: null })}>{t("cancel")}</Button>
                        <Button colorScheme="teal" onClick={saveTemplate}>{templateModal.editing ? t("update") : t("save")}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ── Test WhatsApp Modal ── */}
            <Modal isOpen={testModal.open} onClose={() => setTestModal((prev) => ({ ...prev, open: false }))}>
                <ModalOverlay />
                <ModalContent bg={colors.bgCard}>
                    <ModalHeader color={colors.textPrimary}>{t("test_message")}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <HStack spacing={2} mb={2}>
                                <Badge colorScheme="green">WHATSAPP</Badge>
                                <Text fontSize="sm" color={colors.textSecondary}>via Twilio</Text>
                            </HStack>
                            <FormControl isRequired>
                                <FormLabel {...labelProps}>{t("to_number")}</FormLabel>
                                <Input
                                    {...inputProps}
                                    placeholder="+8801XXXXXXXXX"
                                    value={testModal.to}
                                    onChange={(e) => setTestModal((prev) => ({ ...prev, to: e.target.value }))}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel {...labelProps}>{t("message_body")}</FormLabel>
                                <Textarea
                                    rows={4}
                                    {...inputProps}
                                    value={testModal.body}
                                    onChange={(e) => setTestModal((prev) => ({ ...prev, body: e.target.value }))}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={() => setTestModal((prev) => ({ ...prev, open: false }))}>{t("cancel")}</Button>
                        <Button leftIcon={<MdSend />} colorScheme="teal" onClick={sendTest}>{t("send")}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ── Test Email Modal ── */}
            <Modal isOpen={emailModal.open} onClose={() => setEmailModal({ open: false, to: "" })}>
                <ModalOverlay />
                <ModalContent bg={colors.bgCard}>
                    <ModalHeader color={colors.textPrimary}>{t("test_email")}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Text fontSize="sm" color={colors.textSecondary}>{t("test_email_help")}</Text>
                            <FormControl isRequired>
                                <FormLabel {...labelProps}>{t("email_recipient")}</FormLabel>
                                <Input
                                    type="email"
                                    {...inputProps}
                                    placeholder="user@example.com"
                                    value={emailModal.to}
                                    onChange={(e) => setEmailModal((prev) => ({ ...prev, to: e.target.value }))}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={() => setEmailModal({ open: false, to: "" })}>{t("cancel")}</Button>
                        <Button leftIcon={<MdSend />} colorScheme="teal" onClick={sendTestEmail} isLoading={sendingEmail} loadingText={t("saving_data")}>{t("send")}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default NotificationSettings;
