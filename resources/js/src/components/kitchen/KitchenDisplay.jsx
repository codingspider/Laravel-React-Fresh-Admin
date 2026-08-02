import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Flex,
    Text,
    Heading,
    Badge,
    Button,
    IconButton,
    Select,
    Tooltip,
    VStack,
    HStack,
    Divider,
    Spinner,
    Stat,
    StatLabel,
    StatNumber,
    useToast,
    SimpleGrid,
    Icon,
    useColorModeValue,
} from '@chakra-ui/react';
import {
    RefreshCw,
    Volume2,
    VolumeX,
    Bell,
    BellOff,
    Clock,
    AlertTriangle,
    Timer,
    Users,
    ChefHat,
    Utensils,
    PackageX,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../axios';
import PageHeader from '../ui/PageHeader';
import useThemeColors from '../../hooks/useThemeColors';
import { usePermission } from '../../context/PermissionContext';
import {
    KDS_BOARD,
    KDS_CHEFS,
    KDS_UPDATE_STATUS,
    KDS_SET_PRIORITY,
    KDS_ASSIGN_CHEF,
} from '../../routes/apiRoutes';

const POLL_INTERVAL_MS = 10000;

const PRIORITY_ORDER = { urgent: 0, high: 1, normal: 2, low: 3 };

const COLUMN_CONFIG = [
    {
        key: 'new',
        label: 'New',
        color: 'statusInfo',
        cardBg: { light: 'blue.50', dark: 'blue.900' },
        cardBorder: { light: 'blue.500', dark: 'blue.400' },
    },
    {
        key: 'preparing',
        label: 'Preparing',
        color: 'statusWarning',
        cardBg: { light: 'orange.50', dark: 'orange.900' },
        cardBorder: { light: 'orange.500', dark: 'orange.400' },
    },
    {
        key: 'ready',
        label: 'Ready',
        color: 'brandSolid',
        cardBg: { light: 'teal.50', dark: 'teal.900' },
        cardBorder: { light: 'teal.500', dark: 'teal.400' },
    },
];

const formatElapsed = (minutes) => {
    const m = Number(minutes) || 0;
    const h = Math.floor(m / 60);
    const s = m % 60;
    return h > 0 ? `${h}h ${String(s).padStart(2, '0')}m` : `${String(s).padStart(2, '0')}m`;
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
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    } catch {
        // Audio unavailable — ignore silently.
    }
};

const OrderCard = ({
    order,
    chefs,
    canManage,
    canAccept,
    canAssign,
    onAction,
    onPriority,
    onAssignChef,
    columnBg,
    columnBorder,
}) => {
    const { t } = useTranslation();
    const colors = useThemeColors();

    const status = order.status;
    const isDelayed = order.is_delayed;

    const resolvedBorder = useColorModeValue(columnBorder.light, columnBorder.dark);
    const resolvedBg = useColorModeValue(columnBg.light, columnBg.dark);

    const borderColor = isDelayed
        ? colors.statusError
        : resolvedBorder;

    const cardBg = isDelayed
        ? colors.statusErrorBg
        : resolvedBg;

    const priorityBadgeColor =
        order.priority === 'urgent'
            ? 'red'
            : order.priority === 'high'
                ? 'orange'
                : order.priority === 'low'
                    ? 'gray'
                    : 'blue';

    const orderTypeLabel =
        order.order_type === 'dine_in'
            ? t('Dine In')
            : order.order_type === 'takeaway'
                ? t('Takeaway')
                : t('Delivery');

    const showAccept = status === 'pending' && (canAccept || canManage);
    const showCook = status === 'confirmed' && canManage;
    const showReady = status === 'preparing' && canManage;
    const showServe = status === 'ready' && canManage;
    const showCancel = canManage;

    return (
        <Box
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="lg"
            p={4}
            boxShadow={colors.shadowCard}
            transition="all 0.2s ease"
            _hover={{ boxShadow: colors.shadowModal }}
        >
            <Flex justify="space-between" align="center" mb={2}>
                <HStack spacing={2}>
                    <Text fontWeight="bold" fontSize="sm" color={colors.textHeading}>
                        {order.invoice_number}
                    </Text>
                    <Badge colorScheme={priorityBadgeColor} variant="subtle" fontSize="xs">
                        {t(order.priority)}
                    </Badge>
                    <Badge colorScheme="gray" variant="subtle" fontSize="xs">
                        {orderTypeLabel}
                    </Badge>
                </HStack>
                {isDelayed ? (
                    <Badge colorScheme="red" variant="solid" fontSize="xs" leftIcon={<Icon as={AlertTriangle} boxSize={3} />}>
                        {t('Delayed')}
                    </Badge>
                ) : (
                    <HStack spacing={1} color={colors.textMuted}>
                        <Icon as={Clock} boxSize={3.5} />
                        <Text fontSize="xs" fontWeight="600">
                            {formatElapsed(order.elapsed_minutes)}
                        </Text>
                    </HStack>
                )}
            </Flex>

            <HStack spacing={3} mb={2} color={colors.textSecondary} fontSize="sm">
                {order.table && (
                    <HStack spacing={1}>
                        <Icon as={Utensils} boxSize={3.5} />
                        <Text>{order.table.name}</Text>
                    </HStack>
                )}
                {order.customer && (
                    <HStack spacing={1}>
                        <Icon as={Users} boxSize={3.5} />
                        <Text>{order.customer.name}</Text>
                    </HStack>
                )}
                {order.user && (
                    <Text fontSize="xs" color={colors.textMuted}>
                        {t('by')} {order.user.name}
                    </Text>
                )}
            </HStack>

            <Divider borderColor={colors.borderSubtle} mb={3} />

            <VStack align="stretch" spacing={1} mb={3}>
                {order.items.map((item) => (
                    <Flex key={item.id} justify="space-between" align="flex-start" gap={2}>
                        <HStack spacing={2} align="flex-start" flex="1">
                            <Badge colorScheme="brand" variant="subtle" flexShrink={0}>
                                {item.quantity} x
                            </Badge>
                            <Box>
                                <Text fontSize="sm" color={colors.textPrimary}>
                                    {item.item_name}
                                </Text>
                                {item.notes && (
                                    <Text fontSize="xs" color={colors.statusWarningText}>
                                        {item.notes}
                                    </Text>
                                )}
                                {Array.isArray(item.modifiers) && item.modifiers.length > 0 && (
                                    <Text fontSize="xs" color={colors.textMuted}>
                                        {item.modifiers.map((m) => m?.name || m?.label || m).join(', ')}
                                    </Text>
                                )}
                            </Box>
                        </HStack>
                    </Flex>
                ))}
            </VStack>

            {order.kitchen_notes && (
                <Box
                    bg={colors.bgSubtle}
                    borderRadius="md"
                    px={3}
                    py={2}
                    mb={3}
                    borderLeft="3px solid"
                    borderLeftColor={colors.brandSolid}
                >
                    <Text fontSize="xs" color={colors.textMuted}>
                        {t('Kitchen Notes')}:
                    </Text>
                    <Text fontSize="sm" color={colors.textPrimary}>
                        {order.kitchen_notes}
                    </Text>
                </Box>
            )}

            <Flex justify="space-between" align="center" gap={2} flexWrap="wrap">
                {canAssign ? (
                    <Select
                        size="xs"
                        width="auto"
                        maxW="130px"
                        placeholder={t('Chef')}
                        value={order.chef_user_id || ''}
                        onChange={(e) => onAssignChef(order.id, e.target.value || null)}
                        borderColor={colors.borderInput}
                        bg={colors.bgInput}
                    >
                        {chefs.map((chef) => (
                            <option key={chef.id} value={chef.id}>
                                {chef.name}
                            </option>
                        ))}
                    </Select>
                ) : (
                    order.chef_user_id && (
                        <HStack spacing={1} color={colors.textSecondary} fontSize="xs">
                            <Icon as={ChefHat} boxSize={3.5} />
                            <Text>{t('by')} {order.chef_user_id}</Text>
                        </HStack>
                    )
                )}

                <HStack spacing={1} flexWrap="wrap" justify="flex-end">
                    {canManage && order.priority !== 'urgent' && (
                        <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => onPriority(order.id, 'urgent')}
                        >
                            {t('Urgent')}
                        </Button>
                    )}
                    {canManage && order.priority !== 'high' && order.priority !== 'urgent' && (
                        <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="orange"
                            onClick={() => onPriority(order.id, 'high')}
                        >
                            {t('High')}
                        </Button>
                    )}
                    {showAccept && (
                        <Button size="xs" colorScheme="green" onClick={() => onAction(order.id, 'confirmed')}>
                            {t('Accept')}
                        </Button>
                    )}
                    {showCook && (
                        <Button size="xs" colorScheme="orange" onClick={() => onAction(order.id, 'preparing')}>
                            {t('Start Cooking')}
                        </Button>
                    )}
                    {showReady && (
                        <Button size="xs" colorScheme="green" onClick={() => onAction(order.id, 'ready')}>
                            {t('Mark Ready')}
                        </Button>
                    )}
                    {showServe && (
                        <Button size="xs" colorScheme="blue" onClick={() => onAction(order.id, 'served')}>
                            {t('Serve')}
                        </Button>
                    )}
                    {showCancel && (
                        <Button size="xs" variant="ghost" colorScheme="red" onClick={() => onAction(order.id, 'cancelled')}>
                            {t('Cancel')}
                        </Button>
                    )}
                </HStack>
            </Flex>
        </Box>
    );
};

const StatTile = ({ label, value, icon, bg, color }) => {
    const colors = useThemeColors();
    return (
        <Box
            bg={colors.bgCard}
            border="1px solid"
            borderColor={colors.borderSubtle}
            borderRadius="xl"
            p={{ base: 3, md: 4 }}
            boxShadow={colors.shadowCard}
        >
            <Stat>
                <HStack justify="space-between" align="center">
                    <Box>
                        <StatLabel fontSize="xs" color={colors.textSecondary}>
                            {label}
                        </StatLabel>
                        <StatNumber fontSize={{ base: 'xl', md: '2xl' }} color={colors.textHeading}>
                            {value}
                        </StatNumber>
                    </Box>
                    <Flex bg={bg} p={2} borderRadius="lg">
                        <Icon as={icon} boxSize={5} color={color} />
                    </Flex>
                </HStack>
            </Stat>
        </Box>
    );
};

export default function KitchenDisplay() {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const toast = useToast();
    const { can } = usePermission();

    const [board, setBoard] = useState({ columns: { new: [], preparing: [], ready: [] }, stats: { new: 0, preparing: 0, ready: 0, delayed: 0 } });
    const [chefs, setChefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [soundOn, setSoundOn] = useState(true);

    const knownIdsRef = useRef(new Set());
    const readyIdsRef = useRef(new Set());
    const toastShownRef = useRef(new Set());

    const notify = useCallback(
        (title, description, status) => {
            const key = `${title}-${description}`;
            if (toastShownRef.current.has(key)) return;
            toastShownRef.current.add(key);
            window.setTimeout(() => toastShownRef.current.delete(key), 3000);
            toast({ title, description, status, duration: 4000, isClosable: true });
        },
        [toast]
    );

    const fetchBoard = useCallback(
        async (silent = false) => {
            if (!silent) setRefreshing(true);
            try {
                const res = await api.get(KDS_BOARD);
                const data = res.data?.data || {};
                const prevKnown = knownIdsRef.current;
                const currentIds = new Set();

                const columns = { new: [], preparing: [], ready: [] };
                Object.entries(data.columns || {}).forEach(([key, list]) => {
                    columns[key] = Array.isArray(list)
                        ? [...list].sort((a, b) => {
                            const pa = PRIORITY_ORDER[a.priority] ?? 2;
                            const pb = PRIORITY_ORDER[b.priority] ?? 2;
                            if (pa !== pb) return pa - pb;
                            return (a.elapsed_minutes || 0) - (b.elapsed_minutes || 0);
                        })
                        : [];
                    columns[key].forEach((order) => currentIds.add(order.id));
                });

                const stats = data.stats || { new: 0, preparing: 0, ready: 0, delayed: 0 };

                if (knownIdsRef.current.size > 0 && soundOn) {
                    const newOrders = [...currentIds].filter((id) => !prevKnown.has(id));
                    const newlyReady = columns.ready
                        .filter((o) => !readyIdsRef.current.has(o.id))
                        .map((o) => o.id);

                    if (newOrders.length > 0) {
                        playBeep();
                        notify(t('New Order'), t('{count} new order(s) arrived', { count: newOrders.length }), 'info');
                    }
                    if (newlyReady.length > 0) {
                        playBeep();
                        notify(t('Order Ready'), t('{count} order(s) are ready to serve', { count: newlyReady.length }), 'success');
                    }
                }

                setBoard({ columns, stats });
                knownIdsRef.current = currentIds;
                readyIdsRef.current = new Set(columns.ready.map((o) => o.id));
            } catch {
                if (!silent) {
                    toast({ title: t('Failed to load kitchen display'), status: 'error', duration: 3000, isClosable: true });
                }
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [toast, t, soundOn, notify]
    );

    const fetchChefs = useCallback(async () => {
        try {
            const res = await api.get(KDS_CHEFS);
            setChefs(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch {
            setChefs([]);
        }
    }, []);

    useEffect(() => {
        fetchBoard();
        fetchChefs();
    }, [fetchBoard, fetchChefs]);

    useEffect(() => {
        if (!autoRefresh) return undefined;
        const interval = window.setInterval(() => {
            fetchBoard(true);
        }, POLL_INTERVAL_MS);
        return () => window.clearInterval(interval);
    }, [autoRefresh, fetchBoard]);

    const runAction = useCallback(
        async (saleId, status) => {
            try {
                const res = await api.post(KDS_UPDATE_STATUS(saleId), { status });
                toast({ title: res.data?.message || t('Order status updated'), status: 'success', duration: 2000, isClosable: true });
                fetchBoard(true);
            } catch {
                toast({ title: t('Failed to update order status'), status: 'error', duration: 3000, isClosable: true });
            }
        },
        [toast, t, fetchBoard]
    );

    const runPriority = useCallback(
        async (saleId, priority) => {
            try {
                const res = await api.post(KDS_SET_PRIORITY(saleId), { priority });
                toast({ title: res.data?.message || t('Priority updated'), status: 'success', duration: 2000, isClosable: true });
                fetchBoard(true);
            } catch {
                toast({ title: t('Failed to update priority'), status: 'error', duration: 3000, isClosable: true });
            }
        },
        [toast, t, fetchBoard]
    );

    const runAssignChef = useCallback(
        async (saleId, chefUserId) => {
            try {
                const res = await api.post(KDS_ASSIGN_CHEF(saleId), { chef_user_id: chefUserId });
                toast({ title: res.data?.message || t('Chef assigned'), status: 'success', duration: 2000, isClosable: true });
                fetchBoard(true);
            } catch {
                toast({ title: t('Failed to assign chef'), status: 'error', duration: 3000, isClosable: true });
            }
        },
        [toast, t, fetchBoard]
    );

    const canManage = can('manage_kitchen_orders');
    const canAccept = can('accept_kitchen_orders');
    const canAssign = can('assign_chef');

    const stats = board.stats;

    return (
        <Box px={{ base: 3, md: 6 }} py={{ base: 4, md: 6 }}>
            <PageHeader
                title="Kitchen Display"
                subtitle="Live orders and preparation tracking"
                breadcrumbs={[{ label: 'Kitchen', path: '/kitchen/display' }, { label: 'Kitchen Display', isCurrent: true }]}
            >
                <Tooltip label={soundOn ? t('Mute notifications') : t('Enable notifications')}>
                    <IconButton
                        aria-label={t('Toggle sound')}
                        icon={<Icon as={soundOn ? Volume2 : VolumeX} boxSize={4} />}
                        variant="ghost"
                        onClick={() => setSoundOn((v) => !v)}
                    />
                </Tooltip>
                <Tooltip label={autoRefresh ? t('Pause auto-refresh') : t('Resume auto-refresh')}>
                    <IconButton
                        aria-label={t('Toggle auto refresh')}
                        icon={<Icon as={autoRefresh ? BellOff : Bell} boxSize={4} />}
                        variant="ghost"
                        onClick={() => setAutoRefresh((v) => !v)}
                    />
                </Tooltip>
                <Button
                    variant="primary"
                    leftIcon={<Icon as={RefreshCw} boxSize={4} />}
                    onClick={() => fetchBoard()}
                    isLoading={refreshing}
                    loadingText={t('Refreshing...')}
                >
                    {t('Refresh')}
                </Button>
            </PageHeader>

            {loading ? (
                <Flex justify="center" align="center" minH="300px">
                    <Spinner size="xl" color={colors.brandSolid} />
                </Flex>
            ) : (
                <>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
                        <StatTile label={t('New Orders')} value={stats.new} icon={Bell} bg={colors.statusInfoBg} color={colors.statusInfoText} />
                        <StatTile label={t('Preparing')} value={stats.preparing} icon={Timer} bg={colors.statusWarningBg} color={colors.statusWarningText} />
                        <StatTile label={t('Ready')} value={stats.ready} icon={Utensils} bg={colors.statusSuccessBg} color={colors.statusSuccessText} />
                        <StatTile label={t('Delayed')} value={stats.delayed} icon={AlertTriangle} bg={colors.statusErrorBg} color={colors.statusErrorText} />
                    </SimpleGrid>

                    {stats.new + stats.preparing + stats.ready === 0 ? (
                        <Flex
                            direction="column"
                            align="center"
                            justify="center"
                            minH="240px"
                            bg={colors.bgCard}
                            border="1px dashed"
                            borderColor={colors.borderStrong}
                            borderRadius="xl"
                            p={10}
                            textAlign="center"
                        >
                            <Icon as={PackageX} boxSize={12} color={colors.textMuted} mb={3} />
                            <Heading size="md" color={colors.textHeading} mb={1}>
                                {t('No active kitchen orders')}
                            </Heading>
                            <Text color={colors.textMuted} fontSize="sm">
                                {t('New orders from the POS terminal will appear here in real time.')}
                            </Text>
                        </Flex>
                    ) : (
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} alignItems="flex-start">
                            {COLUMN_CONFIG.map((col) => {
                                const orders = board.columns[col.key] || [];
                                return (
                                    <Box key={col.key}>
                                        <Flex align="center" mb={3} px={1}>
                                            <Box
                                                w="10px"
                                                h="10px"
                                                borderRadius="full"
                                                bg={colors[col.color]}
                                                mr={2}
                                            />
                                            <Heading size="sm" color={colors.textHeading} textTransform="uppercase" letterSpacing="wider">
                                                {t(col.label)}
                                            </Heading>
                                            <Badge ml={2} colorScheme="gray" variant="subtle">
                                                {orders.length}
                                            </Badge>
                                        </Flex>
                                        <VStack spacing={4} align="stretch">
                                            {orders.map((order) => (
                                                <OrderCard
                                                    key={order.id}
                                                    order={order}
                                                    chefs={chefs}
                                                    canManage={canManage}
                                                    canAccept={canAccept}
                                                    canAssign={canAssign}
                                                    columnBg={col.cardBg}
                                                    columnBorder={col.cardBorder}
                                                    onAction={runAction}
                                                    onPriority={runPriority}
                                                    onAssignChef={runAssignChef}
                                                />
                                            ))}
                                            {orders.length === 0 && (
                                                <Box
                                                    bg={colors.bgCard}
                                                    border="1px dashed"
                                                    borderColor={colors.borderSubtle}
                                                    borderRadius="lg"
                                                    p={6}
                                                    textAlign="center"
                                                >
                                                    <Text fontSize="sm" color={colors.textMuted}>
                                                        {t('No orders')}
                                                    </Text>
                                                </Box>
                                            )}
                                        </VStack>
                                    </Box>
                                );
                            })}
                        </SimpleGrid>
                    )}
                </>
            )}
        </Box>
    );
}
