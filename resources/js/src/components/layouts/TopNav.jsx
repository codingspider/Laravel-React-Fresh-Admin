import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
    Flex,
    HStack,
    Icon,
    Avatar,
    Button,
    Input,
    InputGroup,
    InputLeftElement,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    Text,
    Tooltip,
    useColorMode,
    Box,
    Select,
    IconButton,
    VStack,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverHeader,
    PopoverFooter,
    Spinner,
    Center,
} from '@chakra-ui/react';
import {
    Search,
    Bell,
    Sun,
    Moon,
    Settings,
    LogOut,
    Menu as MenuIcon,
    User,
    ChevronDown,
    ShoppingBag,
    RotateCcw,
    TriangleAlert,
    CheckCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from './../../LanguageProvider';
import { useNavigate } from 'react-router-dom';
import api from '../../axios';
import { LOGIN } from '../../routes/commonRoutes';
import {
    NOTIFICATIONS_LIST,
    NOTIFICATIONS_UNREAD_COUNT,
    NOTIFICATIONS_READ_ALL,
    NOTIFICATIONS_MARK_READ,
} from '../../routes/apiRoutes';
import { NOTIFICATIONS_PATH } from '../../routes/superAdminRoutes';
import { usePermission } from '../../context/PermissionContext';
import useThemeColors from '../../hooks/useThemeColors';
import { useCurrencyFormatter } from '../../useCurrencyFormatter';

const ThemeToggle = () => {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Tooltip label={colorMode === 'light' ? 'Dark Mode' : 'Light Mode'} hasArrow placement="bottom">
            <IconButton
                variant="ghost"
                onClick={toggleColorMode}
                icon={<Icon as={colorMode === 'light' ? Moon : Sun} boxSize={5} />}
                aria-label="Toggle theme"
                borderRadius="lg"
                size="sm"
            />
        </Tooltip>
    );
};

const LanguageSelector = () => {
    const { lang, changeLanguage } = useContext(LanguageContext);

    return (
        <Select
            value={lang}
            onChange={(e) => changeLanguage(e.target.value)}
            w="100px"
            size="sm"
            borderRadius="lg"
            display={{ base: 'none', md: 'block' }}
            focusBorderColor="brand.500"
            variant="outline"
        >
            <option value="en">EN</option>
            <option value="bn">BN</option>
        </Select>
    );
};

const NOTIFICATION_META = {
    new_order: { icon: ShoppingBag, color: 'green.500' },
    order_refunded: { icon: RotateCcw, color: 'orange.500' },
    low_stock: { icon: TriangleAlert, color: 'red.500' },
};

const timeAgo = (iso) => {
    if (!iso) return '';
    const diff = Math.max(0, Date.now() - new Date(iso).getTime());
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const NotificationBell = () => {
    const navigate = useNavigate();
    const colors = useThemeColors();
    const { t } = useTranslation();
    const { formatAmount } = useCurrencyFormatter();
    const [unread, setUnread] = useState(0);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const fetchUnread = useCallback(async () => {
        try {
            const res = await api.get(NOTIFICATIONS_UNREAD_COUNT);
            setUnread(res.data?.data?.unread_count || 0);
        } catch {
            setUnread(0);
        }
    }, []);

    useEffect(() => {
        fetchUnread();
        const id = setInterval(fetchUnread, 30000);
        window.addEventListener('focus', fetchUnread);
        return () => {
            clearInterval(id);
            window.removeEventListener('focus', fetchUnread);
        };
    }, [fetchUnread]);

    const loadItems = async () => {
        setLoading(true);
        try {
            const res = await api.get(NOTIFICATIONS_LIST, { params: { per_page: 8 } });
            setItems(res.data?.data?.data || res.data?.data || []);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = async () => {
        setIsOpen(true);
        if (items.length === 0) await loadItems();
    };

    const handleMarkRead = async (notif) => {
        if (notif.read) return;
        try {
            await api.put(NOTIFICATIONS_MARK_READ(notif.id));
            setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
            setUnread((u) => Math.max(0, u - 1));
        } catch {
            /* ignore */
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put(NOTIFICATIONS_READ_ALL);
            setItems((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnread(0);
        } catch {
            /* ignore */
        }
    };

    const notificationText = (n) => {
        if (n.type === 'new_order') {
            return `${t('New order')} ${n.invoice_number || `#${n.sale_id}`} — ${formatAmount(n.total)}`;
        }
        if (n.type === 'order_refunded') {
            return `${t('Order')} ${n.invoice_number || `#${n.sale_id}`} ${t('refunded')} — ${formatAmount(n.refund_amount)}`;
        }
        if (n.type === 'low_stock') {
            return `${n.item_name} ${t('is running low')} (${n.current_stock}/${n.minimum_stock})`;
        }
        return t('You have a new notification');
    };

    const meta = (n) => NOTIFICATION_META[n.type] || { icon: Bell, color: 'gray.500' };

    return (
        <Popover
            isOpen={isOpen}
            onOpen={handleOpen}
            onClose={() => setIsOpen(false)}
            placement="bottom-end"
            closeOnBlur
        >
            <PopoverTrigger>
                <Box position="relative" display="inline-flex">
                    <Tooltip label={t('Notifications')} hasArrow placement="bottom">
                        <IconButton
                            variant="ghost"
                            icon={<Icon as={Bell} boxSize={5} />}
                            aria-label={t('Notifications')}
                            borderRadius="lg"
                            size="sm"
                        />
                    </Tooltip>
                    {unread > 0 && (
                        <Box
                            position="absolute"
                            top={-1}
                            right={-1}
                            bg="red.500"
                            color="white"
                            borderRadius="full"
                            minW="18px"
                            h="18px"
                            px={1}
                            fontSize="10px"
                            fontWeight="700"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            border="2px solid"
                            borderColor={colors.navBg}
                            zIndex={1}
                        >
                            {unread > 99 ? '99+' : unread}
                        </Box>
                    )}
                </Box>
            </PopoverTrigger>

            <PopoverContent
                minW={{ base: '320px', md: '380px' }}
                borderRadius="xl"
                border="1px solid"
                borderColor={colors.borderDefault}
                boxShadow="lg"
            >
                <PopoverHeader borderBottom="1px solid" borderColor={colors.borderDefault} py={3}>
                    <Flex align="center" justify="space-between">
                        <Text fontWeight="700" fontSize="sm">{t('Notifications')}</Text>
                        {unread > 0 && (
                            <Button
                                size="xs"
                                variant="ghost"
                                leftIcon={<Icon as={CheckCheck} boxSize={3.5} />}
                                onClick={handleMarkAllRead}
                            >
                                {t('Mark all read')}
                            </Button>
                        )}
                    </Flex>
                </PopoverHeader>

                <PopoverBody maxH="360px" overflowY="auto" p={1}>
                    {loading ? (
                        <Center py={8}>
                            <Spinner size="md" color="brand.500" />
                        </Center>
                    ) : items.length === 0 ? (
                        <Center py={8} flexDir="column">
                            <Icon as={Bell} boxSize={8} color="gray.300" mb={2} />
                            <Text fontSize="sm" color="gray.500">{t('No notifications yet')}</Text>
                        </Center>
                    ) : (
                        <VStack spacing={0.5} align="stretch">
                            {items.map((n) => {
                                const m = meta(n);
                                return (
                                    <Flex
                                        key={n.id}
                                        align="flex-start"
                                        gap={3}
                                        p={3}
                                        borderRadius="lg"
                                        cursor="pointer"
                                        bg={n.read ? 'transparent' : colors.bgSubtle}
                                        onClick={() => handleMarkRead(n)}
                                        _hover={{ bg: colors.bgHover }}
                                        transition="background 0.15s ease"
                                    >
                                        <Box
                                            bg={n.read ? colors.bgSubtle : `${m.color}15`}
                                            color={n.read ? 'gray.400' : m.color}
                                            p={2}
                                            borderRadius="lg"
                                            flexShrink={0}
                                        >
                                            <Icon as={m.icon} boxSize={4} />
                                        </Box>
                                        <Box flex="1" minW={0}>
                                            <Text
                                                fontSize="sm"
                                                noOfLines={2}
                                                color={n.read ? colors.textSecondary : colors.textPrimary}
                                                fontWeight={n.read ? '400' : '600'}
                                            >
                                                {notificationText(n)}
                                            </Text>
                                            <Text fontSize="xs" color="gray.400" mt={0.5}>
                                                {timeAgo(n.created_at)}
                                            </Text>
                                        </Box>
                                        {!n.read && <Box w={2} h={2} borderRadius="full" bg={m.color} mt={1} flexShrink={0} />}
                                    </Flex>
                                );
                            })}
                        </VStack>
                    )}
                </PopoverBody>

                <PopoverFooter borderTop="1px solid" borderColor={colors.borderDefault} p={2}>
                    <Button
                        size="sm"
                        variant="ghost"
                        w="100%"
                        onClick={() => {
                            setIsOpen(false);
                            navigate(NOTIFICATIONS_PATH);
                        }}
                    >
                        {t('View all notifications')}
                    </Button>
                </PopoverFooter>
            </PopoverContent>
        </Popover>
    );
};

function ProfileMenu() {
    const navigate = useNavigate();
    const { user } = usePermission();
    const colors = useThemeColors();
    const bg = colors.bgCard;
    const borderColor = colors.borderSubtle;

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (err) {
            console.log('Logout failed, clearing frontend anyway');
        } finally {
            navigate(LOGIN, { replace: true });
        }
    };

    return (
        <Menu>
            <MenuButton
                as={Button}
                variant="ghost"
                p={1}
                borderRadius="lg"
                _hover={{ bg: colors.borderSubtle }}
            >
                <HStack spacing={2}>
                    <Avatar
                        size="sm"
                        name={user?.name || 'User'}
                        bg="brand.500"
                        color="white"
                        fontSize="xs"
                    />
                    <Box display={{ base: 'none', md: 'block' }} textAlign="left">
                        <Text fontSize="sm" fontWeight="600" noOfLines={1} maxW="100px">
                            {user?.name || 'User'}
                        </Text>
                    </Box>
                    <Icon as={ChevronDown} boxSize={4} color="gray.400" display={{ base: 'none', md: 'block' }} />
                </HStack>
            </MenuButton>

            <MenuList minW="200px" p={1.5}>
                <Box px={3} py={2} mb={1}>
                    <Text fontWeight="600" fontSize="sm">
                        {user?.name || 'User'}
                    </Text>
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                        {user?.email || 'user@example.com'}
                    </Text>
                </Box>

                <MenuDivider />

                <MenuItem
                    icon={<Icon as={User} boxSize={4} />}
                    borderRadius="md"
                    fontSize="sm"
                    onClick={() => navigate('/profile')}
                >
                    Profile
                </MenuItem>

                <MenuDivider />

                <MenuItem
                    icon={<Icon as={LogOut} boxSize={4} />}
                    onClick={handleLogout}
                    color="red.500"
                    borderRadius="md"
                    fontSize="sm"
                    _hover={{ bg: 'red.50', _dark: { bg: 'red.900' } }}
                >
                    Logout
                </MenuItem>
            </MenuList>
        </Menu>
    );
}

export default function TopNav({ onMobileMenuOpen }) {
    const colors = useThemeColors();

    return (
        <Flex
            as="header"
            align="center"
            justify="space-between"
            px={{ base: 4, md: 5, lg: 6 }}
            py={0}
            h="64px"
            borderBottom="1px solid"
            borderColor={colors.borderSubtle}
            bg={colors.navBg}
            position="sticky"
            top={0}
            zIndex="sticky"
            backdropFilter="blur(8px)"
        >
            <HStack spacing={3}>
                <IconButton
                    variant="ghost"
                    icon={<Icon as={MenuIcon} boxSize={5} />}
                    display={{ base: 'flex', lg: 'none' }}
                    onClick={onMobileMenuOpen}
                    aria-label="Open menu"
                    borderRadius="lg"
                    size="sm"
                />
                <Box display={{ base: 'none', sm: 'flex' }}>
                    <InputGroup maxW="320px" size="md">
                        <InputLeftElement pointerEvents="none">
                            <Icon as={Search} color="gray.400" boxSize={4} />
                        </InputLeftElement>
                        <Input
                            placeholder="Search..."
                            borderRadius="lg"
                            bg={colors.navSearchBg}
                            border="1px solid"
                            borderColor={colors.borderDefault}
                            _focus={{
                                bg: 'white',
                                borderColor: 'brand.500',
                                boxShadow: 'outline',
                                _dark: { bg: 'gray.700' },
                            }}
                            _placeholder={{ color: 'gray.400' }}
                        />
                    </InputGroup>
                </Box>
            </HStack>

            <HStack spacing={1}>
                <LanguageSelector />
                <ThemeToggle />
                <NotificationBell />
                <Box mx={1}>
                    <Flex
                        h="24px"
                        w="1px"
                        bg={colors.borderDefault}
                    />
                </Box>
                <ProfileMenu />
            </HStack>
        </Flex>
    );
}
