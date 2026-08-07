import React from 'react';
import { Box, SimpleGrid, Text, Heading, VStack, HStack, Button, Badge, List, ListItem, ListIcon } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import LandingSection from './LandingSection';

const MotionBox = motion(Box);

const plans = [
    {
        name: 'Starter',
        price: '$20',
        period: '/month',
        description: 'Everything a single-location restaurant needs to get started.',
        features: [
            'Full POS with all order types',
            'Multi-payment support',
            'Receipt printing',
            'Tax calculations',
            'Demo mode',
        ],
        highlight: false,
    },
    {
        name: 'Pro',
        price: '$99',
        period: '/month',
        description: 'For growing restaurants and multi-location businesses.',
        features: [
            'Everything in Starter',
            'Multi-location management',
            'Real-time kitchen sync',
            'Saved orders queue',
            'Priority support',
        ],
        highlight: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'For chains and complex operations with custom needs.',
        features: [
            'Everything in Pro',
            'Custom integrations',
            'Dedicated account manager',
            'Advanced analytics',
            '24/7 support',
        ],
        highlight: false,
    },
];

export default function LandingPricing() {
    return (
        <LandingSection
            id="pricing"
            badge="Simple, transparent pricing"
            title="Plans that grow with your business"
            subtitle="No hidden fees, no transaction charges, cancel anytime. Start free and upgrade when you're ready."
        >
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 6, md: 8 }} alignItems="stretch">
                {plans.map((plan, index) => (
                    <MotionBox
                        key={plan.name}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.5, delay: index * 0.12 }}
                        h="100%"
                    >
                        <Box
                            h="100%"
                            p={8}
                            borderRadius="2xl"
                            position="relative"
                            bg={plan.highlight ? 'teal.500' : 'white'}
                            _dark={{ bg: plan.highlight ? 'teal.500' : 'gray.800', borderColor: plan.highlight ? 'teal.500' : 'gray.700' }}
                            border="1px solid"
                            borderColor={plan.highlight ? 'teal.500' : 'gray.200'}
                            boxShadow={plan.highlight ? '0 30px 60px -15px rgba(13,148,136,0.4)' : 'lg'}
                            transform={plan.highlight ? { md: 'scale(1.03)' } : undefined}
                        >
                            {plan.highlight && (
                                <Badge
                                    position="absolute"
                                    top={-4}
                                    left="50%"
                                    transform="translateX(-50%)"
                                    colorScheme="whiteAlpha"
                                    color="white"
                                    bg="teal.700"
                                    px={4}
                                    py={1}
                                    borderRadius="full"
                                    fontSize="xs"
                                    fontWeight="700"
                                >
                                    <HStack spacing={1}>
                                        <Sparkles size={12} />
                                        <Text>Most popular</Text>
                                    </HStack>
                                </Badge>
                            )}

                            <VStack align="flex-start" spacing={5}>
                                <Box>
                                    <Text
                                        fontSize="lg"
                                        fontWeight="700"
                                        color={plan.highlight ? 'white' : undefined}
                                    >
                                        {plan.name}
                                    </Text>
                                    <HStack spacing={1} mt={1}>
                                        <Text
                                            fontSize="4xl"
                                            fontWeight="800"
                                            color={plan.highlight ? 'white' : 'gray.800'}
                                            _dark={{ color: plan.highlight ? 'white' : 'white' }}
                                        >
                                            {plan.price}
                                        </Text>
                                        {plan.period && (
                                            <Text
                                                fontSize="sm"
                                                color={plan.highlight ? 'whiteAlpha.800' : 'gray.500'}
                                                _dark={{ color: plan.highlight ? 'whiteAlpha.800' : 'gray.400' }}
                                            >
                                                {plan.period}
                                            </Text>
                                        )}
                                    </HStack>
                                </Box>

                                <Text
                                    fontSize="sm"
                                    color={plan.highlight ? 'whiteAlpha.900' : 'gray.500'}
                                    _dark={{ color: plan.highlight ? 'whiteAlpha.900' : 'gray.400' }}
                                    lineHeight="1.6"
                                >
                                    {plan.description}
                                </Text>

                                <List spacing={2.5}>
                                    {plan.features.map((feature) => (
                                        <ListItem key={feature} display="flex" alignItems="flex-start">
                                            <ListIcon
                                                as={Check}
                                                color={plan.highlight ? 'white' : 'teal.500'}
                                                mt={0.5}
                                            />
                                            <Text
                                                fontSize="sm"
                                                color={plan.highlight ? 'whiteAlpha.900' : 'gray.600'}
                                                _dark={{ color: plan.highlight ? 'whiteAlpha.900' : 'gray.300' }}
                                            >
                                                {feature}
                                            </Text>
                                        </ListItem>
                                    ))}
                                </List>

                                <Button
                                    as={RouterLink}
                                    to="/register"
                                    w="100%"
                                    size="lg"
                                    mt="auto"
                                    colorScheme={plan.highlight ? 'whiteAlpha' : 'teal'}
                                    variant={plan.highlight ? 'solid' : 'outline'}
                                    color={plan.highlight ? 'teal.600' : undefined}
                                    _hover={{ transform: 'translateY(-2px)' }}
                                >
                                    Get Started
                                </Button>
                            </VStack>
                        </Box>
                    </MotionBox>
                ))}
            </SimpleGrid>
        </LandingSection>
    );
}
