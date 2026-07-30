import React from "react";
import {
    Skeleton,
    SkeletonText,
    Stack,
    Box,
    HStack,
    VStack,
} from "@chakra-ui/react";
import useThemeColors from "../hooks/useThemeColors";

const GlobalSkeleton = ({
    lines = 5,
    height = "20px",
    spacing = "3",
    isLoaded = false,
    children,
    variant = "default",
    p = 0,
}) => {
    if (isLoaded) return children;

    const colors = useThemeColors();
    const bg = colors.bgCard;

    if (variant === "card") {
        return (
            <Box bg={bg} p={6} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                <VStack spacing={4} align="stretch">
                    <Skeleton height="24px" w="40%" borderRadius="md" />
                    <SkeletonText mt={2} noOfLines={3} spacing={3} skeletonHeight="14px" />
                    <SkeletonText noOfLines={2} spacing={3} skeletonHeight="14px" />
                </VStack>
            </Box>
        );
    }

    if (variant === "stats") {
        return (
            <HStack spacing={6} align="stretch">
                {[1, 2, 3, 4].map((i) => (
                    <Box key={i} flex={1} bg={bg} p={6} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                        <Skeleton height="14px" w="60%" mb={3} borderRadius="md" />
                        <Skeleton height="28px" w="40%" borderRadius="md" />
                    </Box>
                ))}
            </HStack>
        );
    }

    if (variant === "table") {
        return (
            <Box bg={bg} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} p={6}>
                <HStack justify="space-between" mb={6}>
                    <Skeleton height="24px" w="150px" borderRadius="md" />
                    <Skeleton height="36px" w="100px" borderRadius="md" />
                </HStack>
                <Stack spacing={3}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} height="48px" borderRadius="md" />
                    ))}
                </Stack>
            </Box>
        );
    }

    return (
        <Stack spacing={spacing} w="100%" p={p}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} height={height} borderRadius="md" />
            ))}
        </Stack>
    );
};

export default GlobalSkeleton;
