import React from 'react';
import {
    Box,
    Flex,
    Text,
    Heading,
    Icon,
} from '@chakra-ui/react';
import useThemeColors from '../../hooks/useThemeColors';

export default function DashboardStatCard({
    title,
    value,
    icon,
    iconColor = 'brand.600',
    iconBg = 'brand.50',
}) {
    const colors = useThemeColors();

    return (
        <Box
            bg={colors.bgCard}
            p={{ base: 4, md: 5 }}
            borderRadius="xl"
            border="1px solid"
            borderColor={colors.borderDefault}
            transition="all 0.2s ease"
            _hover={{
                transform: 'translateY(-2px)',
                boxShadow: colors.shadowModal,
            }}
        >
            <Flex justify="space-between" align="flex-start">
                <Box flex="1">
                    <Text
                        fontSize="xs"
                        color={colors.textSecondary}
                        fontWeight="600"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        mb={2}
                        noOfLines={1}
                    >
                        {title}
                    </Text>
                    <Heading
                        size="md"
                        fontWeight="bold"
                        color={colors.textHeading}
                        noOfLines={1}
                    >
                        {value}
                    </Heading>
                </Box>
                {icon && (
                    <Flex
                        bg={iconBg}
                        p={2.5}
                        borderRadius="lg"
                        flexShrink={0}
                    >
                        <Icon as={icon} boxSize={5} color={iconColor} />
                    </Flex>
                )}
            </Flex>
        </Box>
    );
}
