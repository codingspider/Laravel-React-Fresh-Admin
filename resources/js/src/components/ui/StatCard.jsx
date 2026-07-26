import React from 'react';
import {
    Box,
    Flex,
    Text,
    Heading,
    Icon,
    useColorModeValue,
} from '@chakra-ui/react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
    title,
    value,
    change,
    trend = 'up',
    icon,
    iconColor = 'brand.600',
    iconBg = 'brand.50',
}) {
    const bg = useColorModeValue('white', 'gray.800');
    const shadow = useColorModeValue('card', 'cardDark');

    return (
        <Box
            bg={bg}
            p={{ base: 4, md: 6 }}
            borderRadius="xl"
            boxShadow={shadow}
            transition="all 0.2s ease"
            _hover={{
                transform: 'translateY(-2px)',
                boxShadow: useColorModeValue('lg', '2xl'),
            }}
            border="1px solid"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
        >
            <Flex justify="space-between" align="flex-start">
                <Box flex="1">
                    <Text
                        fontSize="sm"
                        color="gray.500"
                        fontWeight="500"
                        mb={1}
                        noOfLines={1}
                    >
                        {title}
                    </Text>
                    <Heading
                        size="lg"
                        fontWeight="bold"
                        color="gray.800"
                        _dark={{ color: 'white' }}
                        noOfLines={1}
                    >
                        {value}
                    </Heading>
                </Box>
                {icon && (
                    <Flex
                        bg={useColorModeValue(iconBg, 'gray.700')}
                        p={2.5}
                        borderRadius="lg"
                        flexShrink={0}
                    >
                        <Icon as={icon} boxSize={5} color={iconColor} />
                    </Flex>
                )}
            </Flex>

            {change && (
                <Flex align="center" mt={3} gap={1}>
                    <Icon
                        as={trend === 'up' ? ArrowUpRight : ArrowDownRight}
                        boxSize={4}
                        color={trend === 'up' ? 'green.500' : 'red.500'}
                    />
                    <Text
                        fontSize="sm"
                        fontWeight="600"
                        color={trend === 'up' ? 'green.500' : 'red.500'}
                    >
                        {change}
                    </Text>
                    <Text fontSize="xs" color="gray.400" ml={1}>
                        vs last month
                    </Text>
                </Flex>
            )}
        </Box>
    );
}
