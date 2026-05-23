import React, { useContext } from 'react';
import { Flex, HStack, Icon, Avatar, Button, Input, InputGroup, InputLeftElement, Menu, MenuButton, MenuList, MenuItem, MenuDivider, Text, Tooltip, useColorMode, useColorModeValue, Box, Select } from '@chakra-ui/react';
import { Search, Bell, Sun, Moon, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from './../../LanguageProvider';
import { useNavigate } from 'react-router-dom';
import api from '../../axios';
import { LOGIN } from '../../routes/commonRoutes';

const ThemeToggle = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const { lang, changeLanguage } = useContext(LanguageContext);
    const { t } = useTranslation();

    return (
        <>
        {/* LANGUAGE */}
                <Select
                    value={lang}
                    onChange={(e) => changeLanguage(e.target.value)}
                    w="120px"
                    display={{ base: "none", md: "block" }}
                >
                    <option value="en">English</option>
                    <option value="bn">বাংলা</option>
                </Select>

                <Tooltip label="Toggle Theme" hasArrow placement="bottom">
            <Button variant="ghost" onClick={toggleColorMode} p="2" borderRadius="lg">
                <Icon as={colorMode === 'light' ? Moon : Sun} boxSize={5} />
            </Button>
        </Tooltip>
        </>
        
    );
};

function ProfileMenu() {

    const navigate = useNavigate();

    // logout function
    const handleLogout = async () => {
        try {
            await api.post("/logout");
        } catch (err) {
            console.log("Logout failed, clearing frontend anyway");
        } finally {
            navigate(LOGIN, { replace: true });
        }
    };

    return (
        <Menu>
            <MenuButton as={Button} variant="ghost" p="1" borderRadius="lg">
                <Avatar
                    size="sm"
                    name="Kent Dodds"
                    src="https://bit.ly/kent-c-dodds"
                    border="2px solid transparent"
                    _hover={{ borderColor: 'brand.400' }}
                    transition="0.2s"
                />
            </MenuButton>

            <MenuList
                align="center"
                w="56"
                boxShadow="lg"
                borderRadius="lg"
                border="1px solid"
                borderColor={useColorModeValue('gray.100', 'gray.700')}
                zIndex="dropdown"
            >
                <div style={{ padding: '8px 16px 4px' }}>
                    <Text fontWeight="600" fontSize="sm">Kent Dodds</Text>
                    <Text fontSize="xs" color="gray.500">kent@example.com</Text>
                </div>

                <MenuDivider />

                <MenuItem icon={<Icon as={Settings} boxSize={4} />}>
                    Settings
                </MenuItem>

                <MenuItem
                    icon={<Icon as={LogOut} boxSize={4} />}
                    onClick={handleLogout}
                    color="red.500"
                >
                    Logout
                </MenuItem>
            </MenuList>
        </Menu>
    );
}

export default function TopNav({ onMobileMenuOpen }) {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Flex as="header" align="center" justify="space-between" px={{ base: 4, md: 8 }} py="4" borderBottom="1px" borderColor={borderColor} bg={bg} position="sticky" top="0" zIndex="sticky" boxShadow="sm">
            <HStack spacing="4">
                <Button variant="ghost" p="2" borderRadius="lg" display={{ base: 'flex', lg: 'none' }} onClick={onMobileMenuOpen}>
                    <Icon as={LayoutDashboard} boxSize={6} />
                </Button>
                <InputGroup maxW="md" display={{ base: 'none', sm: 'flex' }}>
                    <InputLeftElement pointerEvents="none"><Icon as={Search} color="gray.400" boxSize={4} /></InputLeftElement>
                    <Input variant="filled" placeholder="Search Menu" borderRadius="xl" bg={useColorModeValue('gray.100', 'gray.700')} _focus={{ bg: useColorModeValue('white', 'gray.600'), borderColor: 'brand.400' }} border="1px" borderColor="transparent" />
                </InputGroup>
            </HStack>
            <HStack spacing="2">
                <ThemeToggle />
                <Button variant="ghost" p="2" borderRadius="lg" position="relative">
                    <Icon as={Bell} boxSize={5} />
                    <Box w="2" h="2" bg="red.500" borderRadius="full" position="absolute" top="2" right="2" />
                </Button>
                <ProfileMenu />
            </HStack>
        </Flex>
    );
}
