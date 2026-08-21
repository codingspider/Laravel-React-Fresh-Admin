import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    Card,
    CardBody,
    Switch,
    Input,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    SimpleGrid,
    Heading,
    Divider,
    useToast,
    Spinner,
    Flex,
    Checkbox,
    Icon,
    Badge,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Save, ExternalLink, QrCode, ImagePlus, Trash2 } from 'lucide-react';
import api from '../../axios';
import { CUSTOMER_DISPLAY_SETTINGS } from '../../routes/apiRoutes';
import useThemeColors from '../../hooks/useThemeColors';
import { usePermission } from '../../context/PermissionContext';
import PageHeader from '../ui/PageHeader';

const ALL_STATUSES = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
];

const CustomerDisplaySettings = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const colors = useThemeColors();
    const { restaurant, user } = usePermission();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPaymentQr, setShowPaymentQr] = useState(true);
    const [showPromotions, setShowPromotions] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(10);
    const [activeStatuses, setActiveStatuses] = useState(ALL_STATUSES.map((s) => s.value));
    const [qrImage, setQrImage] = useState(null);
    const [qrFile, setQrFile] = useState(null);

    const restaurantId = restaurant?.id || user?.restaurant_id;

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(CUSTOMER_DISPLAY_SETTINGS);
            const settings = response.data?.data?.settings || {};
            setShowPaymentQr(settings.show_payment_qr ?? true);
            setShowPromotions(settings.show_promotions ?? true);
            setRefreshInterval(settings.refresh_interval ?? 10);
            setActiveStatuses(settings.active_statuses?.length ? settings.active_statuses : ALL_STATUSES.map((s) => s.value));
            setQrImage(settings.payment_qr_image || null);
        } catch (error) {
            toast({
                title: t('Failed to load settings'),
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    }, [toast, t]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const toggleStatus = (value) => {
        setActiveStatuses((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('show_payment_qr', showPaymentQr ? '1' : '0');
            formData.append('show_promotions', showPromotions ? '1' : '0');
            formData.append('refresh_interval', String(refreshInterval));
            activeStatuses.forEach((status) => formData.append('active_statuses[]', status));
            if (qrFile) {
                formData.append('payment_qr_image', qrFile);
            }

            const response = await api.put(CUSTOMER_DISPLAY_SETTINGS, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const settings = response.data?.data?.settings || {};
            setQrImage(settings.payment_qr_image || null);
            setQrFile(null);

            toast({
                title: t('Settings saved successfully'),
                status: 'success',
                duration: 4000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: t('Failed to save settings'),
                description: error?.response?.data?.message,
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setSaving(false);
        }
    };

    const openMonitor = () => {
        window.open(buildMonitorUrl(), '_blank', 'noopener,noreferrer');
    };

    const buildMonitorUrl = () => {
        const params = new URLSearchParams();
        if (restaurantId) params.set('restaurant_id', restaurantId);
        if (user?.branch_id) params.set('branch_id', user.branch_id);
        const qs = params.toString();
        return qs ? `/customer-display?${qs}` : '/customer-display';
    };

    const monitorUrl = `${window.location.origin}${buildMonitorUrl()}`;

    const panelBg = colors.bgCard;
    const panelBorder = colors.borderDefault;
    const textPrimary = colors.textPrimary;
    const textSecondary = colors.textSecondary;
    const subtleBg = colors.bgSubtle;
    const inputBg = colors.bgInput;
    const inputBorder = colors.borderInput;

    if (loading) {
        return (
            <Flex minH="60vh" align="center" justify="center">
                <Spinner size="xl" color={colors.brandSolid} />
            </Flex>
        );
    }

    return (
        <Box>
            <PageHeader
                title="Customer Display Settings"
                subtitle="Configure the public order tracking screen shown to customers."
            >
                <Button variant="outline" leftIcon={<ExternalLink />} onClick={openMonitor}>
                    {t('Open Monitor')}
                </Button>
                <Button colorScheme="teal" leftIcon={<Save />} onClick={handleSave} isLoading={saving}>
                    {t('Save')}
                </Button>
            </PageHeader>

            <VStack spacing={5} align="stretch">
                <Card bg={panelBg} borderColor={panelBorder} borderWidth="1px">
                    <CardBody>
                        <Heading size="md" color={textPrimary} mb={1}>
                            {t('Display Options')}
                        </Heading>
                        <Text fontSize="sm" color={textSecondary} mb={4}>
                            {t('Choose what customers see on the shared monitor.')}
                        </Text>

                        <VStack spacing={4} align="stretch">
                            <HStack justify="space-between" p={3} borderRadius="lg" bg={subtleBg}>
                                <Box>
                                    <Text fontWeight="medium" color={textPrimary}>{t('Show Payment QR')}</Text>
                                    <Text fontSize="sm" color={textSecondary}>
                                        {t('Display the payment QR code on the customer screen.')}
                                    </Text>
                                </Box>
                                <Switch
                                    isChecked={showPaymentQr}
                                    onChange={(e) => setShowPaymentQr(e.target.checked)}
                                    colorScheme="teal"
                                />
                            </HStack>

                            <HStack justify="space-between" p={3} borderRadius="lg" bg={subtleBg}>
                                <Box>
                                    <Text fontWeight="medium" color={textPrimary}>{t('Show Promotions')}</Text>
                                    <Text fontSize="sm" color={textSecondary}>
                                        {t('Display active coupons and offers as a ticker.')}
                                    </Text>
                                </Box>
                                <Switch
                                    isChecked={showPromotions}
                                    onChange={(e) => setShowPromotions(e.target.checked)}
                                    colorScheme="teal"
                                />
                            </HStack>

                            <HStack justify="space-between" p={3} borderRadius="lg" bg={subtleBg}>
                                <Box>
                                    <Text fontWeight="medium" color={textPrimary}>{t('Auto Refresh')}</Text>
                                    <Text fontSize="sm" color={textSecondary}>
                                        {t('How often the screen refreshes, in seconds.')}
                                    </Text>
                                </Box>
                                <NumberInput
                                    value={refreshInterval}
                                    min={5}
                                    max={120}
                                    onChange={(value) => setRefreshInterval(Number(value) || 10)}
                                    size="md"
                                    width="140px"
                                    bg={inputBg}
                                    borderColor={inputBorder}
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </HStack>
                        </VStack>
                    </CardBody>
                </Card>

                <Card bg={panelBg} borderColor={panelBorder} borderWidth="1px">
                    <CardBody>
                        <Heading size="md" color={textPrimary} mb={1}>
                            {t('Order Statuses')}
                        </Heading>
                        <Text fontSize="sm" color={textSecondary} mb={4}>
                            {t('Which order statuses appear on the board.')}
                        </Text>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                            {ALL_STATUSES.map((status) => (
                                <Checkbox
                                    key={status.value}
                                    isChecked={activeStatuses.includes(status.value)}
                                    onChange={() => toggleStatus(status.value)}
                                    colorScheme="teal"
                                    size="lg"
                                >
                                    {t(status.label)}
                                </Checkbox>
                            ))}
                        </SimpleGrid>
                    </CardBody>
                </Card>

                <Card bg={panelBg} borderColor={panelBorder} borderWidth="1px">
                    <CardBody>
                        <Heading size="md" color={textPrimary} mb={1}>
                            {t('Payment QR Code')}
                        </Heading>
                        <Text fontSize="sm" color={textSecondary} mb={4}>
                            {t('Upload your merchant payment QR code (UPI, bank, or gateway). Customers scan it to pay for their order.')}
                        </Text>

                        <HStack spacing={5} align="flex-start" flexWrap="wrap">
                            <Flex
                                align="center"
                                justify="center"
                                boxSize="140px"
                                borderRadius="lg"
                                bg={subtleBg}
                                border="1px dashed"
                                borderColor={panelBorder}
                            >
                                {qrImage ? (
                                    <Box
                                        as="img"
                                        src={qrImage}
                                        alt={t('Payment QR code')}
                                        boxSize="130px"
                                        objectFit="contain"
                                        borderRadius="md"
                                    />
                                ) : (
                                    <VStack spacing={1} color={textSecondary}>
                                        <Icon as={QrCode} boxSize={8} />
                                        <Text fontSize="xs">{t('No QR uploaded')}</Text>
                                    </VStack>
                                )}
                            </Flex>

                            <VStack align="flex-start" spacing={3}>
                                <HStack spacing={3}>
                                    <Button as="label" htmlFor="qr-upload" variant="outline" leftIcon={<ImagePlus />} cursor="pointer">
                                        {t('Upload QR Image')}
                                    </Button>
                                    <Input
                                        id="qr-upload"
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        hidden
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setQrFile(file);
                                                setQrImage(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                    {qrImage && (
                                        <Button
                                            variant="ghost"
                                            colorScheme="red"
                                            leftIcon={<Trash2 />}
                                            onClick={() => {
                                                setQrFile(null);
                                                setQrImage(null);
                                            }}
                                        >
                                            {t('Remove')}
                                        </Button>
                                    )}
                                </HStack>
                                <Text fontSize="sm" color={textSecondary}>
                                    {t('Recommended: square PNG or JPEG, at least 300×300 px.')}
                                </Text>
                            </VStack>
                        </HStack>
                    </CardBody>
                </Card>

                <Card bg={panelBg} borderColor={panelBorder} borderWidth="1px">
                    <CardBody>
                        <Heading size="md" color={textPrimary} mb={1}>
                            {t('Public Monitor URL')}
                        </Heading>
                        <Text fontSize="sm" color={textSecondary} mb={3}>
                            {t('Open this URL on your secondary screen. No login is required — anyone can watch live order updates.')}
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                            <Badge colorScheme="teal" px={3} py={1} borderRadius="md" fontSize="sm" wordBreak="break-all">
                                {monitorUrl}
                            </Badge>
                            <Button size="sm" variant="outline" leftIcon={<ExternalLink />} onClick={openMonitor}>
                                {t('Open in new tab')}
                            </Button>
                        </HStack>
                    </CardBody>
                </Card>
            </VStack>
        </Box>
    );
};

export default CustomerDisplaySettings;
