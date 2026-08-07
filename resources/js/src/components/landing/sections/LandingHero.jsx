import React from 'react';
import {
    Box,
    Container,
    Flex,
    Text,
    Heading,
    Button,
    HStack,
    VStack,
    Badge,
    SimpleGrid,
    Stack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import HeroMockup from './LandingHeroMockup';

const MotionBox = motion.create(Box);
const MotionText = motion.create(Text);

const fadeUp = {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
};

export default function LandingHero({ settings }) {
    const stats = [
        { value: settings.stat_1_value, label: settings.stat_1_label },
        { value: settings.stat_2_value, label: settings.stat_2_label },
        { value: settings.stat_3_value, label: settings.stat_3_label },
        { value: settings.stat_4_value, label: settings.stat_4_label },
    ];

    return (
        <Box position="relative" overflow="hidden" pt={{ base: 12, md: 20 }} pb={{ base: 16, md: 24 }}>
            {/* Background glows */}
            <Box
                position="absolute"
                top="-180px"
                left="-120px"
                w="520px"
                h="520px"
                bg="teal.200"
                filter="blur(140px)"
                opacity={0.5}
                _dark={{ bg: 'teal.900', opacity: 0.5 }}
                borderRadius="full"
            />
            <Box
                position="absolute"
                bottom="-160px"
                right="-120px"
                w="520px"
                h="520px"
                bg="blue.200"
                filter="blur(140px)"
                opacity={0.4}
                _dark={{ bg: 'blue.900', opacity: 0.5 }}
                borderRadius="full"
            />
            <Box
                position="absolute"
                top="40%"
                left="60%"
                w="320px"
                h="320px"
                bg="purple.200"
                filter="blur(120px)"
                opacity={0.3}
                _dark={{ bg: 'purple.900', opacity: 0.4 }}
                borderRadius="full"
            />

            <Container maxW="1200px" px={{ base: 4, md: 8 }} position="relative">
                <VStack spacing={8} textAlign="center" maxW="820px" mx="auto">
                    <MotionBox {...fadeUp} transition={{ duration: 0.6 }}>
                        <Badge
                            colorScheme="teal"
                            variant="subtle"
                            px={4}
                            py={2}
                            borderRadius="full"
                            fontSize="sm"
                            fontWeight="600"
                        >
                            <HStack spacing={2}>
                                <Sparkles size={15} />
                                <Text>{settings.hero_badge}</Text>
                            </HStack>
                        </Badge>
                    </MotionBox>

                    <MotionBox {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }}>
                        <Heading
                            as="h1"
                            fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
                            fontWeight="800"
                            letterSpacing="tight"
                            lineHeight="1.08"
                        >
                            {settings.hero_title}
                        </Heading>
                    </MotionBox>

                    <MotionBox {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
                        <Text
                            fontSize={{ base: 'md', md: 'lg' }}
                            color="gray.500"
                            _dark={{ color: 'gray.400' }}
                            maxW="680px"
                            lineHeight="1.7"
                        >
                            {settings.hero_subtitle}
                        </Text>
                    </MotionBox>

                    <MotionBox {...fadeUp} transition={{ duration: 0.6, delay: 0.3 }}>
                        <Stack
                            direction={{ base: 'column', sm: 'row' }}
                            spacing={4}
                        >
                            <Button
                                as={RouterLink}
                                to={settings.hero_primary_cta_url}
                                colorScheme="teal"
                                size="lg"
                                px={8}
                                py={6}
                                rightIcon={<ArrowRight size={18} />}
                                boxShadow="0 10px 30px -8px rgba(13,148,136,0.5)"
                                _hover={{ transform: 'translateY(-2px)' }}
                            >
                                {settings.hero_primary_cta_text}
                            </Button>
                            <Button
                                as="a"
                                href={settings.hero_secondary_cta_url}
                                variant="outline"
                                size="lg"
                                px={8}
                                py={6}
                                _hover={{ transform: 'translateY(-2px)' }}
                            >
                                {settings.hero_secondary_cta_text}
                            </Button>
                        </Stack>
                    </MotionBox>

                    <MotionBox {...fadeUp} transition={{ duration: 0.6, delay: 0.4 }}>
                        <SimpleGrid
                            columns={{ base: 2, md: 4 }}
                            spacing={{ base: 6, md: 12 }}
                            pt={6}
                        >
                            {stats.map((stat) => (
                                <VStack key={stat.label} spacing={1}>
                                    <Text
                                        fontSize={{ base: '2xl', md: '3xl' }}
                                        fontWeight="800"
                                        color="teal.500"
                                        _dark={{ color: 'teal.400' }}
                                    >
                                        {stat.value}
                                    </Text>
                                    <MotionText fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }}>
                                        {stat.label}
                                    </MotionText>
                                </VStack>
                            ))}
                        </SimpleGrid>
                    </MotionBox>
                </VStack>

                {/* Product mockup */}
                <MotionBox
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.5, ease: 'easeOut' }}
                    mt={{ base: 14, md: 20 }}
                >
                    <HeroMockup />
                </MotionBox>
            </Container>
        </Box>
    );
}
