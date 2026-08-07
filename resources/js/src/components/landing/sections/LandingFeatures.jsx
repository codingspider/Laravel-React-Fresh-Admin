import React from 'react';
import { Box, SimpleGrid, Text, Heading, HStack, VStack, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import LandingSection from './LandingSection';
import {
    LayoutGrid,
    CreditCard,
    Zap,
    Building2,
    Bike,
    BedDouble,
    ClipboardList,
    BarChart3,
    Users,
    ChefHat,
    Boxes,
    Settings,
} from 'lucide-react';

const MotionBox = motion(Box);

const features = [
    {
        icon: LayoutGrid,
        title: 'Order Management',
        description: 'Interactive menu browsing with category filters, quick search and short code lookup. Build orders with a cart, manage quantities and add notes in one screen.',
        color: 'teal',
    },
    {
        icon: CreditCard,
        title: 'Multi-Payment Support',
        description: 'Accept cash, cards, digital wallets and more. Select the method at checkout, generate receipts instantly and keep clean records for accounting.',
        color: 'blue',
    },
    {
        icon: Zap,
        title: 'Real-Time Sync',
        description: 'Orders appear on kitchen screens the moment they are placed. Status changes propagate instantly across all devices — no manual refresh needed.',
        color: 'orange',
    },
    {
        icon: Building2,
        title: 'Multi-Location',
        description: 'Switch between restaurant branches from the POS. Each location keeps its own menu, staff, tables and settings, with consolidated reporting.',
        color: 'purple',
    },
    {
        icon: Bike,
        title: 'Delivery & Takeaway',
        description: 'Dedicated order flows for takeout and delivery. Manage addresses, packaging notes and rider assignments in one unified queue.',
        color: 'pink',
    },
    {
        icon: BedDouble,
        title: 'Dine-In & Room Service',
        description: 'Visual table selection for dine-in and room service mode for hotels. Park and recall orders with a saved-orders queue.',
        color: 'green',
    },
    {
        icon: ClipboardList,
        title: 'Kitchen Display',
        description: 'Digital KOT screens keep your kitchen organised. Prioritise, assign and track orders with live status for every station.',
        color: 'red',
    },
    {
        icon: BarChart3,
        title: 'Analytics & Reports',
        description: 'Sales, payments, inventory and staff insights in real time. Understand what sells, when and how to grow your revenue.',
        color: 'cyan',
    },
    {
        icon: Users,
        title: 'Team & Roles',
        description: 'Create staff accounts with role-based permissions — cashier, waiter, chef, manager and more. Keep control of who does what.',
        color: 'teal',
    },
    {
        icon: ChefHat,
        title: 'Recipe & Inventory',
        description: 'Track recipes, ingredients and stock levels. Auto-deduct usage, set reorder alerts and reduce food waste.',
        color: 'blue',
    },
    {
        icon: Boxes,
        title: 'Inventory & Purchasing',
        description: 'Manage suppliers, purchases and stock movements. Know exactly what you have, what you need and when to reorder.',
        color: 'purple',
    },
    {
        icon: Settings,
        title: 'Easy Setup',
        description: 'Get running in minutes. No hardware lock-in — works on any device from your counter, tablet or phone.',
        color: 'green',
    },
];

export default function LandingFeatures() {
    return (
        <LandingSection
            id="features"
            badge="Everything you need"
            title="One platform, every tool for your restaurant"
            subtitle="From the counter to the kitchen and back office, everything you need to run a successful restaurant — built to work together seamlessly."
        >
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
                {features.map((feature, index) => (
                    <MotionBox
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                    >
                        <Box
                            h="100%"
                            p={6}
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="gray.200"
                            _dark={{ borderColor: 'gray.700', bg: 'gray.800' }}
                            bg="white"
                            transition="all 0.25s ease"
                            _hover={{
                                transform: 'translateY(-4px)',
                                boxShadow: '0 20px 40px -15px rgba(13,148,136,0.2)',
                                borderColor: 'teal.300',
                            }}
                        >
                            <VStack align="flex-start" spacing={4}>
                                <Box
                                    bg={`${feature.color}.50`}
                                    _dark={{ bg: `${feature.color}.900` }}
                                    p={3}
                                    borderRadius="lg"
                                >
                                    <Icon as={feature.icon} boxSize={6} color={`${feature.color}.500`} />
                                </Box>
                                <Heading as="h3" size="md" fontWeight="700">
                                    {feature.title}
                                </Heading>
                                <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }} lineHeight="1.7">
                                    {feature.description}
                                </Text>
                            </VStack>
                        </Box>
                    </MotionBox>
                ))}
            </SimpleGrid>
        </LandingSection>
    );
}
