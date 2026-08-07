import React from 'react';
import { Box, Container, HStack, VStack, Text, Heading, IconButton, Stack, SimpleGrid } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const socialIcons = {
    facebook: FaFacebook,
    twitter: FaTwitter,
    instagram: FaInstagram,
    linkedin: FaLinkedin,
    youtube: FaYoutube,
};

const socialKeys = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'];

export default function LandingFooter({ settings }) {
    const { t } = useTranslation();

    const contactItems = [
        { icon: Mail, value: settings?.contact_email, href: settings?.contact_email ? `mailto:${settings.contact_email}` : null },
        { icon: Phone, value: settings?.contact_phone, href: settings?.contact_phone ? `tel:${settings.contact_phone}` : null },
        { icon: MapPin, value: settings?.contact_address },
    ].filter((item) => item.value);

    return (
        <Box bg="gray.900" _dark={{ bg: 'gray.950' }} color="white">
            <Container maxW="1200px" px={{ base: 4, md: 8 }} pt={{ base: 12, md: 16 }} pb={8}>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 8, md: 10 }}>
                    <VStack align="flex-start" spacing={4}>
                        <Heading as="h3" size="md" fontWeight="700">
                            {settings?.site_name || t('Restaurant POS')}
                        </Heading>
                        <Text fontSize="sm" color="whiteAlpha.600" lineHeight="1.7" maxW="280px">
                            {settings?.footer_about || t('The all-in-one platform for modern restaurants.')}
                        </Text>
                        <HStack spacing={2} pt={1}>
                            {socialKeys
                                .filter((key) => settings?.[`social_${key}`])
                                .map((key) => (
                                    <IconButton
                                        key={key}
                                        as="a"
                                        href={settings[`social_${key}`]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={key}
                                        icon={React.createElement(socialIcons[key], { size: 14 })}
                                        size="sm"
                                        bg="whiteAlpha.100"
                                        color="whiteAlpha.700"
                                        _hover={{ bg: 'teal.500', color: 'white' }}
                                        borderRadius="full"
                                    />
                                ))}
                        </HStack>
                    </VStack>

                    <VStack align="flex-start" spacing={4}>
                        <Heading as="h4" size="sm" fontWeight="600" color="teal.300">
                            {t('Quick Links')}
                        </Heading>
                        <VStack align="flex-start" spacing={2} fontSize="sm" color="whiteAlpha.600">
                            {[
                                { label: t('Login'), to: '/login' },
                                { label: t('Register'), to: '/register' },
                            ].map((link) => (
                                <Text
                                    key={link.to}
                                    as={RouterLink}
                                    to={link.to}
                                    _hover={{ color: 'teal.300' }}
                                >
                                    {link.label}
                                </Text>
                            ))}
                        </VStack>
                    </VStack>

                    <VStack align="flex-start" spacing={4}>
                        <Heading as="h4" size="sm" fontWeight="600" color="teal.300">
                            {t('Contact')}
                        </Heading>
                        <VStack align="flex-start" spacing={2.5} fontSize="sm" color="whiteAlpha.600">
                            {contactItems.map((item, i) => (
                                <HStack key={i} spacing={2} align={item.icon === MapPin ? 'flex-start' : 'left'}>
                                    <Box mt={item.icon === MapPin ? 0.5 : 0}>
                                        <item.icon size={14} color="teal.300" />
                                    </Box>
                                    {item.href ? (
                                        <Text as="a" href={item.href} _hover={{ color: 'teal.300' }}>
                                            {item.value}
                                        </Text>
                                    ) : (
                                        <Text>{item.value}</Text>
                                    )}
                                </HStack>
                            ))}
                        </VStack>
                    </VStack>


                </SimpleGrid>

                <Box borderTop="1px solid" borderColor="whiteAlpha.200" mt={10} pt={6}>
                    <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" spacing={3}>
                        <Text fontSize="xs" color="whiteAlpha.500">
                            © {new Date().getFullYear()} {settings?.copyright_text || settings?.site_name || t('Restaurant POS')}. {t('All rights reserved.')}
                        </Text>
                        <HStack spacing={1}>
                            <Text fontSize="xs" color="whiteAlpha.500">{t('Made with')}</Text>
                            <Heart size={12} color="red.400" fill="red.400" />
                            <Text fontSize="xs" color="whiteAlpha.500">{t('for restaurants')}</Text>
                        </HStack>
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
}
