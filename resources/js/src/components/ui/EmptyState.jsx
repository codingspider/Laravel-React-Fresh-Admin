import React from 'react';
import { Box, Flex, Text, Icon, VStack, Button } from '@chakra-ui/react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useThemeColors from '../../hooks/useThemeColors';

export default function EmptyState({
    title,
    message,
    icon,
    action,
    actionLabel,
    compact = false,
}) {
    const { t } = useTranslation();
    const colors = useThemeColors();

    return (
        <Flex
            direction="column"
            align="center"
            justify="center"
            py={compact ? 6 : 12}
            px={4}
            textAlign="center"
        >
            <VStack spacing={compact ? 2 : 3}>
                <Box
                    w={compact ? 9 : 12}
                    h={compact ? 9 : 12}
                    bg="gray.100"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    _dark={{ bg: 'gray.800' }}
                >
                    <Icon
                        as={icon || Inbox}
                        boxSize={compact ? 4 : 6}
                        color="gray.400"
                    />
                </Box>
                <VStack spacing={1}>
                    <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={colors.textSecondary}
                    >
                        {title || t('no_data_found')}
                    </Text>
                    {message && (
                        <Text
                            fontSize="xs"
                            color="gray.400"
                            maxW="220px"
                        >
                            {message}
                        </Text>
                    )}
                </VStack>
                {action && actionLabel && (
                    <Button
                        variant="primary"
                        size="sm"
                        as={ReactRouterLink}
                        to={action}
                        mt={1}
                    >
                        {actionLabel}
                    </Button>
                )}
            </VStack>
        </Flex>
    );
}
