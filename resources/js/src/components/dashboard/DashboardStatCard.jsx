import React from 'react';
import {
    Box,
    Flex,
    Text,
    Heading,
    Icon,
    useColorModeValue,
} from '@chakra-ui/react';
import useThemeColors from '../../hooks/useThemeColors';

const GRADIENTS = [
    'linear-gradient(135deg, #0d9488 0%, #6366f1 100%)',
    'linear-gradient(135deg, #14b8a6 0%, #f59e0b 100%)',
    'linear-gradient(135deg, #0f766e 0%, #ec4899 100%)',
    'linear-gradient(135deg, #115e59 0%, #8b5cf6 100%)',
    'linear-gradient(135deg, #0d9488 0%, #f43f5e 100%)',
    'linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #0f766e 0%, #eab308 100%)',
    'linear-gradient(135deg, #134e4a 0%, #a855f7 100%)',
];

export default function DashboardStatCard({
    title,
    value,
    icon,
    iconColor = 'brand.600',
    iconBg = 'brand.50',
    index = 0,
}) {
    const colors = useThemeColors();
    const gradient = GRADIENTS[index % GRADIENTS.length];
    const darkGradient = useColorModeValue(
        'linear-gradient(135deg, #134e4a 0%, #115e59 100%)',
        'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)'
    );

    return (
        <Box
            bg={gradient}
            p={{ base: 4, md: 5 }}
            borderRadius="xl"
            border="none"
            boxShadow="0 4px 14px rgba(13, 148, 136, 0.25)"
            transition="all 0.2s ease"
            _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(13, 148, 136, 0.35)',
            }}
        >
            <Flex justify="space-between" align="flex-start">
                <Box flex="1">
                    <Text
                        fontSize="xs"
                        color="white"
                        fontWeight="600"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        mb={2}
                        noOfLines={1}
                        opacity={0.9}
                    >
                        {title}
                    </Text>
                    <Heading
                        size="md"
                        fontWeight="bold"
                        color="white"
                        noOfLines={1}
                    >
                        {value}
                    </Heading>
                </Box>
                {icon && (
                    <Flex
                        bg="rgba(255,255,255,0.2)"
                        p={2.5}
                        borderRadius="lg"
                        flexShrink={0}
                    >
                        <Icon as={icon} boxSize={5} color="white" />
                    </Flex>
                )}
            </Flex>
        </Box>
    );
}
