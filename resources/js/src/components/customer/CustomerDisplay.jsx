import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Flex,
    Text,
    Heading,
    Badge,
    Button,
    IconButton,
    Tooltip,
    VStack,
    HStack,
    Divider,
    Spinner,
    SimpleGrid,
    Icon,
    useColorModeValue,
} from '@chakra-ui/react';
import {
    MonitorPlay,
    RefreshCw,
    Volume2,
    VolumeX,
    Bell,
    BellOff,
    Clock,
    Users,
    User,
    Utensils,
    TicketPercent,
    QrCode,
    PackageX,
    MapPin,
    Table2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import api from '../../axios';
import useThemeColors from '../../hooks/useThemeColors';
import { CUSTOMER_DISPLAY_BOARD } from '../../routes/apiRoutes';

const DEFAULT_POLL_MS = 10000;

const STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        bg: { light: 'gray.50', dark: 'gray.800' },
        color: { light: 'gray.600', dark: 'gray.300' },
        border: { light: 'gray.300', dark: 'gray.600' },
    },
    confirmed: {
        label: 'Confirmed',
        bg: { light: 'blue.50', dark: 'blue.900' },
        color: { light: 'blue.600', dark: 'blue.300' },
        border: { light: 'blue.500', dark: 'blue.400' },
    },
    preparing: {
        label: 'Preparing',
        bg: { light: 'orange.50', dark: 'orange.900' },
        color: { light: 'orange.600', dark: 'orange.300' },
        border: { light: 'orange.500', dark: 'orange.400' },
    },
    ready: {
        label: 'Ready',
        bg: { light: 'teal.50', dark: 'teal.900' },
        color: { light: 'teal.600', dark: 'teal.300' },
        border: { light: 'teal.500', dark: 'teal.400' },
    },
};

const formatCurrency = (amount, symbol) => {
    const value = Number(amount) || 0;
    const formatted = value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return symbol ? `${symbol}${formatted}` : formatted;
};

const playBeep = () => {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 660;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch {
        // Audio unavailable — ignore silently.
    }
};

const formatElapsed = (minutes) => {
    const m = Number(minutes) || 0;
    if (m < 60) return `${String(m).padStart(2, '0')}m`;
    const h = Math.floor(m / 60);
    const s = m % 60;
    return `${h}h ${String(s).padStart(2, '0')}m`;
};

const OrderCard = ({ order, currencySymbol }) => {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const statusBg = useColorModeValue(status.bg.light, status.bg.dark);
    const statusColor = useColorModeValue(status.color.light, status.color.dark);
    const statusBorder = useColorModeValue(status.border.light, status.border.dark);
    const cardBg = useColorModeValue('white', 'gray.800');
    const border = useColorModeValue('gray.200', 'gray.700');

    return (
        <Box
            bg={cardBg}
            border="1px solid"
            borderColor={border}
            borderRadius="xl"
            boxShadow={colors.shadowCard}
            p={4}
            h="full"
            display="flex"
            flexDirection="column"
        >
            <HStack justify="space-between" align="flex-start">
                <VStack align="flex-start" spacing={0.5}>
                    <HStack spacing={2}>
                        {order.table?.name && (
                            <HStack spacing={1} color={colors.textSecondary}>
                                <Icon as={Table2} boxSize={4} />
                                <Text fontWeight="bold" fontSize="lg">
                                    {order.table.name}
                                </Text>
                            </HStack>
                        )}
                        <Badge bg={statusBg} color={statusColor} border="1px solid" borderColor={statusBorder} px={2} py={0.5} borderRadius="full">
                            {t(status.label)}
                        </Badge>
                    </HStack>
                    {order.customer?.name && (
                        <HStack spacing={1} color={colors.brandSolid}>
                            <Icon as={User} boxSize={4} />
                            <Text fontWeight="bold" fontSize="md">
                                {order.customer.name}
                            </Text>
                        </HStack>
                    )}
                    <Text fontSize="sm" color={colors.textMuted}>
                        {order.invoice_number}
                    </Text>
                </VStack>
                <HStack spacing={1} color={colors.textMuted}>
                    <Icon as={Clock} boxSize={4} />
                    <Text fontSize="sm">{formatElapsed(order.elapsed_minutes)}</Text>
                </HStack>
            </HStack>

            <Divider my={3} borderColor={border} />

            <VStack align="stretch" spacing={2} flex="1">
                {order.items?.map((item) => (
                    <Flex key={item.id} justify="space-between" gap={2}>
                        <Flex align="center" gap={2} minW="0">
                            <Badge bg={colors.brandSubtle} color={colors.brandSubtleText} px={2} borderRadius="md">
                                {item.quantity}
                            </Badge>
                            <VStack align="flex-start" spacing={0.5} minW="0">
                                <Text fontWeight="medium" isTruncated>
                                    {item.item_name}
                                </Text>
                                {item.modifiers?.length > 0 && (
                                    <Text fontSize="xs" color={colors.textMuted} isTruncated>
                                        {item.modifiers.map((m) => m.name || m).join(', ')}
                                    </Text>
                                )}
                                {item.notes && (
                                    <Text fontSize="xs" color={colors.textMuted} fontStyle="italic" isTruncated>
                                        {item.notes}
                                    </Text>
                                )}
                            </VStack>
                        </Flex>
                        <Text fontSize="sm" whiteSpace="nowrap" color={colors.textSecondary}>
                            {formatCurrency(item.total, currencySymbol)}
                        </Text>
                    </Flex>
                ))}
            </VStack>

            <Divider my={3} borderColor={border} />

            <VStack spacing={1} align="stretch">
                <HStack justify="space-between" fontSize="sm">
                    <Text color={colors.textSecondary}>{t('Subtotal')}</Text>
                    <Text color={colors.textSecondary}>{formatCurrency(order.subtotal, currencySymbol)}</Text>
                </HStack>
                {Number(order.discount_amount) > 0 && (
                    <HStack justify="space-between" fontSize="sm">
                        <Text color={colors.textSecondary}>
                            {t('Discount')}
                            {Number(order.discount_percent) > 0 && ` (${order.discount_percent}%)`}
                            {order.coupon_code ? ` · ${order.coupon_code}` : ''}
                        </Text>
                        <Text color={colors.statusError}>− {formatCurrency(order.discount_amount, currencySymbol)}</Text>
                    </HStack>
                )}
                {Number(order.delivery_charge) > 0 && (
                    <HStack justify="space-between" fontSize="sm">
                        <Text color={colors.textSecondary}>{t('Delivery Charge')}</Text>
                        <Text color={colors.textSecondary}>{formatCurrency(order.delivery_charge, currencySymbol)}</Text>
                    </HStack>
                )}
                <HStack justify="space-between" fontSize="sm">
                    <Text color={colors.textSecondary}>{t('Tax')}</Text>
                    <Text color={colors.textSecondary}>{formatCurrency(order.tax_amount, currencySymbol)}</Text>
                </HStack>
                <HStack justify="space-between" pt={1}>
                    <Text fontWeight="bold">{t('Total')}</Text>
                    <Text fontWeight="bold" fontSize="xl" color={colors.brandSolid}>
                        {formatCurrency(order.total, currencySymbol)}
                    </Text>
                </HStack>
            </VStack>
        </Box>
    );
};

const CustomerDisplay = () => {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const [searchParams] = useSearchParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [live, setLive] = useState(true);
    const [now, setNow] = useState(new Date());
    const orderIdsRef = useRef(new Set());

    const restaurantId = searchParams.get('restaurant_id') || undefined;

    const pollMs = data?.settings?.refresh_interval
        ? Math.max(5, data.settings.refresh_interval) * 1000
        : DEFAULT_POLL_MS;

    const fetchBoard = useCallback(async () => {
        try {
            const params = restaurantId ? { restaurant_id: restaurantId } : {};
            const response = await api.get(CUSTOMER_DISPLAY_BOARD, { params });
            const payload = response.data?.data || {};

            if (soundEnabled) {
                const currentIds = new Set((payload.orders || []).map((o) => o.id));
                const hasNew = (payload.orders || []).some(
                    (o) => !orderIdsRef.current.has(o.id)
                );
                if (hasNew && orderIdsRef.current.size > 0) {
                    playBeep();
                }
                orderIdsRef.current = currentIds;
            }

            setData(payload);
            setError(null);
        } catch (err) {
            setError(err?.response?.status === 404 ? 'no_restaurant' : 'load_failed');
        } finally {
            setLoading(false);
        }
    }, [restaurantId, soundEnabled]);

    useEffect(() => {
        fetchBoard();
    }, [fetchBoard]);

    useEffect(() => {
        if (!live) return undefined;
        const interval = setInterval(fetchBoard, pollMs);
        return () => clearInterval(interval);
    }, [fetchBoard, pollMs, live]);

    useEffect(() => {
        const clock = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(clock);
    }, []);

    const restaurant = data?.restaurant;
    const orders = data?.orders || [];
    const promotions = data?.promotions || [];
    const settings = data?.settings || {};

    const bgPage = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const border = useColorModeValue('gray.200', 'gray.700');
    const headerBg = useColorModeValue('white', 'gray.800');

    const dateTime = now.toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    if (loading) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg={bgPage}>
                <Spinner size="xl" color={colors.brandSolid} />
            </Flex>
        );
    }

    if (error === 'no_restaurant' || !restaurant) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg={bgPage} flexDirection="column" gap={4}>
                <Icon as={MonitorPlay} boxSize={12} color={colors.textMuted} />
                <Text fontSize="xl" color={colors.textSecondary}>
                    {t('No restaurant found for this display.')}
                </Text>
            </Flex>
        );
    }

    if (error === 'load_failed') {
        return (
            <Flex minH="100vh" align="center" justify="center" bg={bgPage} flexDirection="column" gap={4}>
                <Icon as={PackageX} boxSize={12} color={colors.statusError} />
                <Text fontSize="xl" color={colors.textSecondary}>{t('Failed to load the customer display.')}</Text>
                <Button leftIcon={<RefreshCw />} colorScheme="teal" onClick={fetchBoard}>
                    {t('Retry')}
                </Button>
            </Flex>
        );
    }

    return (
        <Box minH="100vh" bg={bgPage} p={4}>
            <Flex
                as="header"
                align="center"
                justify="space-between"
                bg={headerBg}
                border="1px solid"
                borderColor={border}
                borderRadius="xl"
                p={4}
                mb={4}
                gap={4}
                flexWrap="wrap"
            >
                <HStack spacing={3}>
                    {restaurant.logo ? (
                        <Box
                            as="img"
                            src={restaurant.logo}
                            alt={restaurant.name || 'logo'}
                            boxSize="56px"
                            objectFit="cover"
                            borderRadius="lg"
                            border="1px solid"
                            borderColor={border}
                        />
                    ) : (
                        <Flex boxSize="56px" align="center" justify="center" borderRadius="lg" bg={colors.brandSubtle} color={colors.brandSubtleText}>
                            <Icon as={Utensils} boxSize={7} />
                        </Flex>
                    )}
                    <VStack align="flex-start" spacing={0}>
                        <Heading size="lg">{restaurant.name || t('Customer Display')}</Heading>
                        {restaurant.address && (
                            <HStack spacing={1} color={colors.textMuted} fontSize="sm">
                                <Icon as={MapPin} boxSize={3.5} />
                                <Text>{restaurant.address}</Text>
                            </HStack>
                        )}
                    </VStack>
                </HStack>

                <HStack spacing={2} flexWrap="wrap">
                    <HStack spacing={1} color={colors.textSecondary}>
                        <Icon as={Clock} boxSize={4} />
                        <Text>{dateTime}</Text>
                    </HStack>
                    <HStack spacing={1} color={colors.textSecondary} px={2} py={1} borderRadius="md" bg={colors.bgSubtle}>
                        <Icon as={Users} boxSize={4} />
                        <Text fontWeight="bold">{orders.length} {t('Active')}</Text>
                    </HStack>
                    <Tooltip label={t('Sound notifications')}>
                        <IconButton
                            icon={soundEnabled ? <Volume2 /> : <VolumeX />}
                            aria-label={t('Toggle sound')}
                            size="sm"
                            variant="outline"
                            onClick={() => setSoundEnabled((v) => !v)}
                        />
                    </Tooltip>
                    <Tooltip label={t('Live refresh')}>
                        <IconButton
                            icon={live ? <Bell /> : <BellOff />}
                            aria-label={t('Toggle live refresh')}
                            size="sm"
                            variant={live ? 'solid' : 'outline'}
                            colorScheme={live ? 'teal' : 'gray'}
                            onClick={() => setLive((v) => !v)}
                        />
                    </Tooltip>
                    <Tooltip label={t('Refresh now')}>
                        <IconButton
                            icon={<RefreshCw />}
                            aria-label={t('Refresh now')}
                            size="sm"
                            variant="outline"
                            onClick={fetchBoard}
                        />
                    </Tooltip>
                </HStack>
            </Flex>

            {settings.show_promotions && promotions.length > 0 && (
                <Box bg={colors.brandSubtle} color={colors.brandSubtleText} borderRadius="xl" p={2.5} mb={4} overflow="hidden" whiteSpace="nowrap">
                    <Flex gap={8} alignItems="center" overflowX="auto" css={{ scrollbarWidth: 'none' }}>
                        <HStack spacing={1} fontWeight="bold" flexShrink={0}>
                            <Icon as={TicketPercent} boxSize={5} />
                            <Text>{t('Today’s Offers')}:</Text>
                        </HStack>
                        {promotions.map((promo) => (
                            <Flex key={promo.id} gap={1} alignItems="center" flexShrink={0}>
                                <Badge colorScheme="teal" variant="solid" px={2} borderRadius="md">
                                    {promo.code}
                                </Badge>
                                <Text fontSize="sm">
                                    {promo.type === 'fixed'
                                        ? `${formatCurrency(promo.value, restaurant.currency_symbol)} ${t('off')}`
                                        : `${promo.value}% ${t('off')}`}
                                    {promo.min_order_amount > 0 && ` · ${t('min')} ${formatCurrency(promo.min_order_amount, restaurant.currency_symbol)}`}
                                </Text>
                            </Flex>
                        ))}
                    </Flex>
                </Box>
            )}

            {orders.length === 0 ? (
                <Flex
                    minH="55vh"
                    align="center"
                    justify="center"
                    flexDirection="column"
                    gap={4}
                    bg={cardBg}
                    border="1px dashed"
                    borderColor={border}
                    borderRadius="xl"
                >
                    <Icon as={PackageX} boxSize={14} color={colors.textMuted} />
                    <Heading size="md" color={colors.textSecondary}>
                        {t('No active orders')}
                    </Heading>
                    <Text color={colors.textMuted}>{t('New orders will appear here automatically.')}</Text>
                </Flex>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3, '2xl': 4 }} spacing={4}>
                    {orders.map((order) => (
                        <OrderCard key={order.id} order={order} currencySymbol={restaurant.currency_symbol} />
                    ))}
                </SimpleGrid>
            )}

            {settings.show_payment_qr && settings.payment_qr_image && (
                <Flex
                    mt={4}
                    align="center"
                    justify="center"
                    bg={cardBg}
                    border="1px solid"
                    borderColor={border}
                    borderRadius="xl"
                    p={4}
                    gap={4}
                    flexWrap="wrap"
                >
                    <Icon as={QrCode} boxSize={10} color={colors.brandSolid} />
                    <Box>
                        <Heading size="sm">{t('Scan to Pay')}</Heading>
                        <Text fontSize="sm" color={colors.textMuted}>
                            {t('Scan the QR code with your payment app to complete your order.')}
                        </Text>
                    </Box>
                    <Box
                        as="img"
                        src={settings.payment_qr_image}
                        alt={t('Payment QR code')}
                        boxSize="120px"
                        objectFit="contain"
                        border="1px solid"
                        borderColor={border}
                        borderRadius="lg"
                        bg="white"
                    />
                </Flex>
            )}

            <Text mt={4} textAlign="center" fontSize="sm" color={colors.textMuted}>
                {restaurant.name} · {dateTime}
            </Text>
        </Box>
    );
};

export default CustomerDisplay;
