import React from 'react';
import { Box, SimpleGrid, Text, Heading, VStack, Icon, HStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import LandingSection from './LandingSection';
import {
    Utensils,
    CupSoda,
    Martini,
    Factory,
    Truck,
    Store,
    ArrowRight,
} from 'lucide-react';

const MotionBox = motion.create(Box);

const types = [
    {
        icon: Utensils,
        title: 'Restaurants',
        description: 'Full-service and casual dining with table management and dine-in ordering.',
        color: 'teal',
    },
    {
        icon: CupSoda,
        title: 'Cafés & Bakeries',
        description: 'Quick-service counter ordering with fast checkout and takeaway support.',
        color: 'orange',
    },
    {
        icon: Martini,
        title: 'Bars & Lounges',
        description: 'Tab management, drink modifiers and multi-payment splitting.',
        color: 'purple',
    },
    {
        icon: Factory,
        title: 'Cloud Kitchens',
        description: 'Delivery-first operations with multi-brand menu management.',
        color: 'blue',
    },
    {
        icon: Truck,
        title: 'Food Trucks',
        description: 'Mobile-friendly POS that runs on your phone — no bulky hardware needed.',
        color: 'pink',
    },
    {
        icon: Store,
        title: 'QSR & Fast Food',
        description: 'High-volume ordering with quick service lanes and accurate KOT routing.',
        color: 'green',
    },
];

export default function LandingBusinessTypes() {
    return (
        <LandingSection
            id="solutions"
            badge="Built for every food business"
            title="Designed for every kind of food business"
            subtitle="Whether you run a single café or a multi-location chain, our platform adapts to the way you work."
        >
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
                {types.map((type, index) => (
                    <MotionBox
                        key={type.title}
                        initial={{ opacity: 0, scale: 0.96 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
                    >
                        <Box
                            h="100%"
                            p={6}
                            borderRadius="xl"
                            bg={`${type.color}.50`}
                            _dark={{ bg: `${type.color}.900` }}
                            transition="all 0.25s ease"
                            _hover={{
                                transform: 'translateY(-4px)',
                                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.15)',
                            }}
                        >
                            <VStack align="flex-start" spacing={4}>
                                <HStack justify="space-between" w="100%">
                                    <Box
                                        bg="white"
                                        _dark={{ bg: 'gray.800' }}
                                        p={3}
                                        borderRadius="lg"
                                    >
                                        <Icon as={type.icon} boxSize={6} color={`${type.color}.500`} />
                                    </Box>
                                    <ArrowRight size={16} color="gray.400" />
                                </HStack>
                                <Heading as="h3" size="md" fontWeight="700">
                                    {type.title}
                                </Heading>
                                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }} lineHeight="1.7">
                                    {type.description}
                                </Text>
                            </VStack>
                        </Box>
                    </MotionBox>
                ))}
            </SimpleGrid>
        </LandingSection>
    );
}
