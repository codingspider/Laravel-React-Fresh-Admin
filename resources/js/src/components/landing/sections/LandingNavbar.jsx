import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Flex,
    Text,
    Button,
    HStack,
    IconButton,
    useColorMode,
    useDisclosure,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerBody,
    DrawerCloseButton,
    Stack,
    Link as ChakraLink,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { Moon, Sun, Menu, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
];

export default function LandingNavbar({ settings }) {
    const { colorMode, toggleColorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <MotionBox
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            position="sticky"
            top={0}
            zIndex={50}
            bg={scrolled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.6)'}
            _dark={{
                bg: scrolled ? 'rgba(17,24,39,0.85)' : 'rgba(17,24,39,0.6)',
                borderColor: scrolled ? 'gray.700' : 'transparent',
            }}
            backdropFilter="blur(16px)"
            borderBottom="1px solid"
            borderColor={scrolled ? 'gray.200' : 'transparent'}
            style={{ transition: 'background 0.3s, border-color 0.3s' }}
        >
            <Container maxW="1200px" px={{ base: 4, md: 8 }}>
                <Flex justify="space-between" align="center" h="72px">
                    <HStack spacing={3}>
                        <Box
                            bg="teal.500"
                            p={2}
                            borderRadius="lg"
                            color="white"
                        >
                            <UtensilsCrossed size={22} />
                        </Box>
                        <Text fontWeight="800" fontSize="lg" letterSpacing="tight">
                            {settings.site_name}
                        </Text>
                    </HStack>

                    <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
                        {navLinks.map((link) => (
                            <ChakraLink
                                key={link.href}
                                href={link.href}
                                fontSize="sm"
                                fontWeight="500"
                                color="gray.600"
                                _dark={{ color: 'gray.300' }}
                                _hover={{ color: 'teal.500' }}
                            >
                                {link.label}
                            </ChakraLink>
                        ))}
                    </HStack>

                    <HStack spacing={3}>
                        <IconButton
                            aria-label="Toggle theme"
                            onClick={toggleColorMode}
                            variant="ghost"
                            icon={colorMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        />
                        <Button
                            as={RouterLink}
                            to="/login"
                            variant="ghost"
                            size="md"
                            display={{ base: 'none', sm: 'inline-flex' }}
                        >
                            Login
                        </Button>
                        <Button
                            as={RouterLink}
                            to="/register"
                            colorScheme="teal"
                            size="md"
                            display={{ base: 'none', sm: 'inline-flex' }}
                        >
                            Get Started
                        </Button>
                        <IconButton
                            aria-label="Open menu"
                            onClick={onOpen}
                            variant="ghost"
                            icon={<Menu size={20} />}
                            display={{ base: 'inline-flex', md: 'none' }}
                        />
                    </HStack>
                </Flex>
            </Container>

            <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerBody pt={16}>
                        <Stack spacing={5}>
                            {navLinks.map((link) => (
                                <ChakraLink
                                    key={link.href}
                                    href={link.href}
                                    onClick={onClose}
                                    fontSize="md"
                                    fontWeight="600"
                                    color="gray.700"
                                    _dark={{ color: 'gray.200' }}
                                >
                                    {link.label}
                                </ChakraLink>
                            ))}
                            <Button
                                as={RouterLink}
                                to="/login"
                                variant="outline"
                                size="lg"
                                mt={4}
                            >
                                Login
                            </Button>
                            <Button
                                as={RouterLink}
                                to="/register"
                                colorScheme="teal"
                                size="lg"
                            >
                                Get Started
                            </Button>
                        </Stack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </MotionBox>
    );
}
