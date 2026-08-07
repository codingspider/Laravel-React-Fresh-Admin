import React from 'react';
import { Box, Container, SimpleGrid, VStack, Text, Heading, HStack, IconButton, Stack, Input, Button, Divider } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Heart } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

const socials = [
    { key: 'facebook', icon: FaFacebook },
    { key: 'twitter', icon: FaTwitter },
    { key: 'instagram', icon: FaInstagram },
    { key: 'linkedin', icon: FaLinkedin },
    { key: 'youtube', icon: FaYoutube },
];

export default function LandingFooter({ settings }) {
    const socialLinks = socials
        .map((s) => ({ ...s, url: settings?.[`social_${s.key}`] }))
        .filter((s) => s.url);

    return (
        <Box bg="gray.900" _dark={{ bg: 'gray.900' }} color="white" pt={{ base: 12, md: 16 }} pb={8}>
            <Container maxW="1200px" px={{ base: 4, md: 8 }}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 8, md: 10 }}>
                    <VStack align="flex-start" spacing={4}>
                        <Heading as="h3" size="md" fontWeight="800">
                            {settings?.site_name || 'Restaurant POS'}
                        </Heading>
                        <Text fontSize="sm" color="whiteAlpha.700" lineHeight="1.7">
                            {settings?.footer_about || 'The all-in-one POS platform that helps restaurants run faster, smarter and better — from order to checkout.'}
                        </Text>
                        <HStack spacing={2} pt={1}>
                            {socialLinks.map((s) => (
                                <IconButton
                                    key={s.key}
                                    as="a"
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.key}
                                    icon={<s.icon size={16} />}
                                    size="sm"
                                    bg="whiteAlpha.100"
                                    color="whiteAlpha.800"
                                    _hover={{ bg: 'teal.500', color: 'white' }}
                                    borderRadius="full"
                                />
                            ))}
                        </HStack>
                    </VStack>

                    <VStack align="flex-start" spacing={3}>
                        <Heading as="h4" size="sm" fontWeight="700" color="teal.300">
                            Product
                        </Heading>
                        {[
                            ['POS', '/'],
                            ['Features', '/#features'],
                            ['Solutions', '/#solutions'],
                            ['Pricing', '/#pricing'],
                            ['FAQ', '/#faq'],
                        ].map(([label, href]) => (
                            <Text
                                key={label}
                                as={RouterLink}
                                to={href}
                                fontSize="sm"
                                color="whiteAlpha.700"
                                _hover={{ color: 'teal.300' }}
                            >
                                {label}
                            </Text>
                        ))}
                    </VStack>

                    <VStack align="flex-start" spacing={3}>
                        <Heading as="h4" size="sm" fontWeight="700" color="teal.300">
                            Company
                        </Heading>
                        {['About', 'Contact', 'Careers', 'Blog', 'Support'].map((label) => (
                            <Text key={label} fontSize="sm" color="whiteAlpha.700" _hover={{ color: 'teal.300' }} cursor="pointer">
                                {label}
                            </Text>
                        ))}
                    </VStack>

                    <VStack align="flex-start" spacing={4}>
                        <Heading as="h4" size="sm" fontWeight="700" color="teal.300">
                            Contact
                        </Heading>
                        <VStack align="flex-start" spacing={2.5} fontSize="sm" color="whiteAlpha.700">
                            <HStack spacing={2}>
                                <Mail size={14} color="teal.300" />
                                <Text>{settings?.contact_email || 'support@example.com'}</Text>
                            </HStack>
                            <HStack spacing={2}>
                                <Phone size={14} color="teal.300" />
                                <Text>{settings?.contact_phone || '+1 (555) 123-4567'}</Text>
                            </HStack>
                            <HStack spacing={2} align="flex-start">
                                <Box mt={0.5}><MapPin size={14} color="teal.300" /></Box>
                                <Text>{settings?.contact_address || '123 Market Street, San Francisco, CA'}</Text>
                            </HStack>
                        </VStack>
                        <HStack spacing={2} mt={2} w="100%">
                            <Input
                                placeholder="Enter your email"
                                bg="whiteAlpha.100"
                                border="1px solid"
                                borderColor="whiteAlpha.300"
                                size="md"
                                _placeholder={{ color: 'whiteAlpha.500' }}
                                _hover={{ borderColor: 'teal.300' }}
                                _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal.400' }}
                            />
                            <IconButton
                                aria-label="Subscribe"
                                icon={<Send size={16} />}
                                colorScheme="teal"
                                _hover={{ transform: 'translateY(-2px)' }}
                            />
                        </HStack>
                    </VStack>
                </SimpleGrid>

                <Divider my={8} borderColor="whiteAlpha.200" />

                <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" spacing={3}>
                    <Text fontSize="xs" color="whiteAlpha.500">
                        © {new Date().getFullYear()} {settings?.copyright_text || settings?.site_name || 'Restaurant POS'}. All rights reserved.
                    </Text>
                    <HStack spacing={1}>
                        <Text fontSize="xs" color="whiteAlpha.500">
                            Made with
                        </Text>
                        <Heart size={12} color="red.400" fill="red.400" />
                        <Text fontSize="xs" color="whiteAlpha.500">
                            for restaurants
                        </Text>
                    </HStack>
                </Stack>
            </Container>
        </Box>
    );
}
