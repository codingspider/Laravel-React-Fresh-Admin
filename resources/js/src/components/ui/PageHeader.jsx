import React from 'react';
import {
    Box,
    Flex,
    Text,
    Heading,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    HStack,
    Icon,
    useColorModeValue,
} from '@chakra-ui/react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PageHeader({
    title,
    subtitle,
    breadcrumbs = [],
    action,
    actionLabel,
    actionIcon,
    actionColor = 'primary',
    children,
}) {
    const { t } = useTranslation();

    return (
        <Box mb={{ base: 4, md: 6 }}>
            {breadcrumbs.length > 0 && (
                <Breadcrumb
                    separator={<Icon as={ChevronRight} color="gray.400" boxSize={3} />}
                    fontSize="sm"
                    color="gray.500"
                    mb={3}
                >
                    {breadcrumbs.map((crumb, index) => (
                        <BreadcrumbItem key={index} isCurrentPage={crumb.isCurrent}>
                            {crumb.path ? (
                                <BreadcrumbLink
                                    as={ReactRouterLink}
                                    to={crumb.path}
                                    _hover={{ color: 'brand.600' }}
                                >
                                    {crumb.label}
                                </BreadcrumbLink>
                            ) : (
                                <BreadcrumbLink _hover={{ color: 'brand.600' }}>
                                    {crumb.label}
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    ))}
                </Breadcrumb>
            )}

            <Flex
                justify="space-between"
                align={{ base: 'flex-start', md: 'center' }}
                direction={{ base: 'column', md: 'row' }}
                gap={{ base: 3, md: 0 }}
            >
                <Box>
                    <Heading
                        size="lg"
                        fontWeight="bold"
                        color="gray.800"
                        _dark={{ color: 'white' }}
                    >
                        {t(title)}
                    </Heading>
                    {subtitle && (
                        <Text color="gray.500" fontSize="sm" mt={1}>
                            {t(subtitle)}
                        </Text>
                    )}
                </Box>

                <HStack spacing={3}>
                    {children}
                    {action && (
                        <Button
                            variant={actionColor}
                            leftIcon={actionIcon ? <Icon as={actionIcon} boxSize={4} /> : undefined}
                            as={ReactRouterLink}
                            to={action}
                            size="md"
                        >
                            {t(actionLabel)}
                        </Button>
                    )}
                </HStack>
            </Flex>
        </Box>
    );
}
