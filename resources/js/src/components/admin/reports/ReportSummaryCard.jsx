import React from "react";
import { Box, Grid, GridItem, Text } from "@chakra-ui/react";
import useThemeColors from "../../../hooks/useThemeColors";

/**
 * Reusable summary stat card for report pages.
 *
 * @param {Object} props
 * @param {Array}  props.stats Array of { label, value, color }
 */
export default function ReportSummaryCard({ stats = [] }) {
    const colors = useThemeColors();

    return (
        <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(auto-fit, minmax(160px, 1fr))" }} gap={4}>
            {stats.map((stat, index) => (
                <GridItem
                    key={index}
                    bg={colors.bgCard}
                    p={4}
                    borderRadius="lg"
                    boxShadow="card"
                    border="1px solid"
                    borderColor={colors.borderDefault}
                >
                    <Text fontSize="xs" fontWeight="500" color={colors.textSecondary} textTransform="uppercase" letterSpacing="0.4px" mb={1}>
                        {stat.label}
                    </Text>
                    <Text fontSize="lg" fontWeight="700" color={stat.color || colors.textPrimary}>
                        {stat.value}
                    </Text>
                </GridItem>
            ))}
        </Grid>
    );
}
