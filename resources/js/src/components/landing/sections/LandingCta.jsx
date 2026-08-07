import React from 'react';
import { Box, Container, VStack, Text, Heading, Button, Stack, HStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function LandingCta({ settings }) {
    return (
        <Box py={{ base: 16, md: 24 }}>
            <Container maxW="1200px" px={{ base: 4, md: 8 }}>
                <MotionBox
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    position="relative"
                    overflow="hidden"
                    borderRadius="3xl"
                    bg="gray.900"
                    _dark={{ bg: 'teal.900' }}
                    px={{ base: 6, md: 16 }}
                    py={{ base: 12, md: 20 }}
                    textAlign="center"
                >
                    <Box
                        position="absolute"
                        top="-120px"
                        left="50%"
                        transform="translateX(-50%)"
                        w="600px"
                        h="300px"
                        bg="teal.500"
                        filter="blur(120px)"
                        opacity={0.35}
                        borderRadius="full"
                    />

                    <VStack spacing={6} position="relative">
                        <HStack spacing={2} color="teal.300">
                            <CheckCircle2 size={18} />
                            <Text fontSize="sm" fontWeight="600" letterSpacing="wide">
                                Start free. No credit card required.
                            </Text>
                        </HStack>
                        <Heading
                            as="h2"
                            size={{ base: 'xl', md: '3xl' }}
                            fontWeight="800"
                            color="white"
                            letterSpacing="tight"
                            lineHeight="1.15"
                        >
                            Ready to upgrade your restaurant?
                        </Heading>
                        <Text color="whiteAlpha.800" fontSize={{ base: 'md', md: 'lg' }} maxW="560px">
                            Set up your menu and start taking orders in minutes. {settings.site_name} has everything you need to run your restaurant beautifully.
                        </Text>
                        <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} pt={2}>
                            <Button
                                as={RouterLink}
                                to="/register"
                                colorScheme="teal"
                                size="lg"
                                px={8}
                                py={6}
                                rightIcon={<ArrowRight size={18} />}
                                bg="white"
                                color="teal.700"
                                _hover={{ bg: 'whiteAlpha.90' }}
                            >
                                Start Free Trial
                            </Button>
                            <Button
                                as={RouterLink}
                                to="/login"
                                size="lg"
                                px={8}
                                py={6}
                                color="black"
                                border="1px solid"
                                borderColor="whiteAlpha.400"
                                _hover={{ bg: 'whiteAlpha.100' }}
                            >
                                Login to your account
                            </Button>
                        </Stack>
                    </VStack>
                </MotionBox>
            </Container>
        </Box>
    );
}
