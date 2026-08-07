import React from 'react';
import { Box, SimpleGrid, Text, Heading, VStack, HStack, Badge } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import LandingSection from './LandingSection';
import { UtensilsCrossed, ListOrdered, Wallet, Printer } from 'lucide-react';

const MotionBox = motion.create(Box);

const steps = [
    {
        icon: UtensilsCrossed,
        title: 'Browse menu',
        description: 'Search items by name, category or short code. Add to cart with one tap.',
    },
    {
        icon: ListOrdered,
        title: 'Choose order type',
        description: 'Select dine-in and pick a table, or takeaway, delivery and room service.',
    },
    {
        icon: Wallet,
        title: 'Confirm & pay',
        description: 'Review the order, apply taxes automatically and take payment how you want.',
    },
    {
        icon: Printer,
        title: 'Print & track',
        description: 'Print the receipt, send the KOT to the kitchen and track progress live.',
    },
];

export default function LandingHowItWorks() {
    return (
        <Box bg="white" _dark={{ bg: 'gray.800' }} py={{ base: 16, md: 24 }}>
            <LandingSection
                id="how-it-works"
                badge="How it works"
                title="Up and running in four simple steps"
                subtitle="A familiar flow that your team can learn in minutes — no complicated training required."
            >
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 6, md: 8 }}>
                    {steps.map((step, index) => (
                        <MotionBox
                            key={step.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <VStack align="flex-start" spacing={4} position="relative">
                                <HStack spacing={3} align="center">
                                    <Box
                                        bg="teal.500"
                                        color="white"
                                        p={3}
                                        borderRadius="lg"
                                        boxShadow="0 8px 20px -6px rgba(13,148,136,0.5)"
                                    >
                                        <step.icon size={22} />
                                    </Box>
                                    <Badge
                                        colorScheme="gray"
                                        variant="subtle"
                                        borderRadius="full"
                                        px={3}
                                        py={1}
                                        fontSize="lg"
                                        fontWeight="800"
                                    >
                                        0{index + 1}
                                    </Badge>
                                </HStack>
                                <Heading as="h3" size="md" fontWeight="700">
                                    {step.title}
                                </Heading>
                                <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }} lineHeight="1.7">
                                    {step.description}
                                </Text>
                            </VStack>
                        </MotionBox>
                    ))}
                </SimpleGrid>
            </LandingSection>
        </Box>
    );
}
