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
import { useTranslation } from 'react-i18next';
import LandingSection from './LandingSection';

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
            {value === 'Varies' ? <Minus size={15} color="gray.400" /> : <X size={15} color="red.500" />}
            <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }}>
                {value}
            </Text>
        </HStack>
    );
};

export default function LandingComparison({ rows = [], platformLabel, othersLabel }) {
    const { t } = useTranslation();

    const displayRows = Array.isArray(rows) && rows.length > 0 ? rows : [];

    if (displayRows.length === 0) {
        return null;
    }

    return (
        <Box bg="white" _dark={{ bg: 'gray.800' }} py={{ base: 16, md: 24 }}>
            <LandingSection
                id="comparison"
                badge={t('Why choose us')}
                title={t('See how we stack up against the rest')}
                subtitle={t('Transparent pricing, no hidden fees and every feature included. Compare for yourself.')}
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
                                <Th bg="gray.50" _dark={{ bg: 'gray.900' }}>{t('Feature')}</Th>
                                <Th textAlign="center" bg="gray.50" _dark={{ bg: 'gray.900' }}>
                                    <Badge colorScheme="teal" variant="subtle" px={3} py={1.5} mb={1}>
                                        {platformLabel || t('Our platform')}
                                    </Badge>
                                </Th>
                                <Th textAlign="center" bg="gray.50" _dark={{ bg: 'gray.900' }}>
                                    {othersLabel || t('Others')}
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {displayRows.map((row, index) => (
                                <Tr key={row.id ?? index} bg={index % 2 ? 'white' : 'transparent'} _dark={{ bg: index % 2 ? 'gray.800' : 'transparent' }}>
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
