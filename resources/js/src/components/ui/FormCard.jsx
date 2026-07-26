import React from 'react';
import {
    Box,
    Flex,
    Text,
    Heading,
    Button,
    HStack,
    Icon,
    useColorModeValue,
    Divider,
} from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function FormCard({
    title,
    subtitle,
    backUrl,
    children,
    footer,
    isLoading,
    onSubmit,
    maxWidth = '4xl',
}) {
    const { t } = useTranslation();
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Box maxW={maxWidth} mx="auto">
            <Box
                bg={bg}
                borderRadius="xl"
                boxShadow="card"
                border="1px solid"
                borderColor={borderColor}
                overflow="hidden"
            >
                {title && (
                    <Box px={{ base: 4, md: 6 }} py={4} borderBottom="1px solid" borderColor={borderColor}>
                        <Flex align="center" gap={3}>
                            {backUrl && (
                                <Button
                                    as={ReactRouterLink}
                                    to={backUrl}
                                    variant="ghost"
                                    size="sm"
                                    p={1.5}
                                    borderRadius="lg"
                                >
                                    <Icon as={ArrowLeft} boxSize={4} />
                                </Button>
                            )}
                            <Box>
                                <Heading size="md" fontWeight="bold" color="gray.800" _dark={{ color: 'white' }}>
                                    {t(title)}
                                </Heading>
                                {subtitle && (
                                    <Text fontSize="sm" color="gray.500" mt={0.5}>
                                        {t(subtitle)}
                                    </Text>
                                )}
                            </Box>
                        </Flex>
                    </Box>
                )}

                <Box as="form" onSubmit={onSubmit} p={{ base: 4, md: 6 }}>
                    {children}
                </Box>

                {footer && (
                    <>
                        <Divider borderColor={borderColor} />
                        <Box px={{ base: 4, md: 6 }} py={4} bg={useColorModeValue('gray.50', 'gray.750')}>
                            <Flex justify="flex-end" gap={3}>
                                {footer}
                            </Flex>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}
