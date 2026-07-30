import React, { useContext } from 'react';
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
    Badge,
    IconButton,
    VStack,
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
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from './../../LanguageProvider';
import { useNavigate } from 'react-router-dom';
import api from '../../axios';
import { LOGIN } from '../../routes/commonRoutes';
import { usePermission } from '../../context/PermissionContext';
import useThemeColors from '../../hooks/useThemeColors';

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

const NotificationBell = () => {
    const notifColors = useThemeColors();
    return (
        <Tooltip label="Notifications" hasArrow placement="bottom">
            <Box position="relative">
                <IconButton
                    variant="ghost"
                    icon={<Icon as={Bell} boxSize={5} />}
                    aria-label="Notifications"
                    borderRadius="lg"
                    size="sm"
                />
                <Box
                    w={2}
                    h={2}
                    bg="red.500"
                    borderRadius="full"
                    position="absolute"
                    top={1.5}
                    right={1.5}
                    border="2px solid"
                    borderColor={notifColors.borderNav}
                />
            </Box>
        </Tooltip>
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
                <MenuItem
                    icon={<Icon as={Settings} boxSize={4} />}
                    borderRadius="md"
                    fontSize="sm"
                    onClick={() => navigate('/settings')}
                >
                    Settings
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
