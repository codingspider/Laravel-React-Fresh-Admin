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
import useThemeColors from '../../hooks/useThemeColors';

export default function StatCard({
    title,
    value,
    change,
    trend = 'up',
    icon,
    iconColor = 'brand.600',
    iconBg = 'brand.50',
}) {
    const colors = useThemeColors();
    const bg = colors.bgCard;
    const shadow = colors.shadowCard;

    return (
        <Box
            bg={bg}
            p={{ base: 4, md: 6 }}
            borderRadius="xl"
            boxShadow={shadow}
            transition="all 0.2s ease"
            _hover={{
                transform: 'translateY(-2px)',
                boxShadow: colors.shadowModal,
            }}
            border="1px solid"
            borderColor={colors.borderSubtle}
        >
            <Flex justify="space-between" align="flex-start">
                <Box flex="1">
                    <Text
                        fontSize="sm"
                        color={colors.textSecondary}
                        fontWeight="500"
                        mb={1}
                        noOfLines={1}
                    >
                        {title}
                    </Text>
                    <Heading
                        size="lg"
                        fontWeight="bold"
                        color={colors.textHeading}
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
                    <Text fontSize="xs" color={colors.textMuted} ml={1}>
                        vs last month
                    </Text>
                </Flex>
            )}
        </Box>
    );
}
