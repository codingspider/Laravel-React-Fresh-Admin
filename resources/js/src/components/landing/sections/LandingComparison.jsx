import React from 'react';
import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
    Badge,
    HStack,
} from '@chakra-ui/react';
import { Check, X, Minus } from 'lucide-react';
import LandingSection from './LandingSection';

const rows = [
    { feature: 'Cloud-based', us: 'Yes', competitors: 'Varies' },
    { feature: 'Transaction fees', us: '0%', competitors: 'Up to 2.9% + fee' },
    { feature: 'Multi-location support', us: 'Included', competitors: 'Add-on' },
    { feature: 'Hardware required', us: 'None', competitors: 'Proprietary terminal' },
    { feature: 'Real-time kitchen sync', us: 'Included', competitors: 'Add-on' },
    { feature: 'All order types', us: 'Included', competitors: 'Varies' },
    { feature: 'Receipt printing', us: 'Included', competitors: 'Included' },
    { feature: 'Free trial', us: 'Yes', competitors: 'Varies' },
];

const Value = ({ value }) => {
    const isYes = value === 'Yes' || value === 'Included' || value === '0%' || value === 'None';
    if (isYes) {
        return (
            <HStack spacing={1.5} justify="center">
                <Check size={15} color="green.500" />
                <Text fontSize="sm" fontWeight="600" color="green.500">
                    {value}
                </Text>
            </HStack>
        );
    }
    return (
        <HStack spacing={1.5} justify="center">
            {value === 'Varies' ? <Minus size={15} color="gray.400" /> : <X size={15} color="red.400" />}
            <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }}>
                {value}
            </Text>
        </HStack>
    );
};

export default function LandingComparison() {
    return (
        <Box bg="white" _dark={{ bg: 'gray.800' }} py={{ base: 16, md: 24 }}>
            <LandingSection
                id="comparison"
                badge="Why choose us"
                title="See how we stack up against the rest"
                subtitle="Transparent pricing, no hidden fees and every feature included. Compare for yourself."
            >
                <Box
                    overflowX="auto"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.200"
                    _dark={{ borderColor: 'gray.700', bg: 'gray.900' }}
                    bg="gray.50"
                >
                    <Table variant="simple" size="lg">
                        <Thead>
                            <Tr>
                                <Th bg="gray.50" _dark={{ bg: 'gray.900' }}>Feature</Th>
                                <Th textAlign="center" bg="gray.50" _dark={{ bg: 'gray.900' }}>
                                    <Badge colorScheme="teal" variant="subtle" px={3} py={1.5} mb={1}>
                                        Our platform
                                    </Badge>
                                </Th>
                                <Th textAlign="center" bg="gray.50" _dark={{ bg: 'gray.900' }}>
                                    Others
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {rows.map((row, index) => (
                                <Tr key={row.feature} bg={index % 2 ? 'white' : 'transparent'} _dark={{ bg: index % 2 ? 'gray.800' : 'transparent' }}>
                                    <Td fontWeight="500">{row.feature}</Td>
                                    <Td>
                                        <Value value={row.us} />
                                    </Td>
                                    <Td>
                                        <Value value={row.competitors} />
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </LandingSection>
        </Box>
    );
}
