import React from 'react';
import {
    Box,
    Button,
    Text,
    HStack,
    IconButton,
    SlideFade,
    Icon,
} from '@chakra-ui/react';
import { Download, X, Smartphone } from 'lucide-react';
import usePwaInstall from '../../hooks/usePwaInstall';
import useThemeColors from '../../hooks/useThemeColors';

export default function PwaInstallButton() {
    const { isInstallable, install, dismiss } = usePwaInstall();
    const colors = useThemeColors();

    const handleInstall = async () => {
        await install();
    };

    if (!isInstallable) return null;

    return (
        <SlideFade in={isInstallable} offsetY="20px">
            <Box
                position="fixed"
                bottom={{ base: 4, md: 6 }}
                right={{ base: 4, md: 6 }}
                zIndex="tooltip"
            >
                <Box
                    bg={colors.bgCard}
                    border="1px solid"
                    borderColor={colors.borderSubtle}
                    borderRadius="2xl"
                    boxShadow={colors.shadowModal}
                    p={4}
                    maxW="320px"
                >
                    <HStack justify="space-between" mb={2}>
                        <HStack spacing={2}>
                            <Box
                                bg="brand.500"
                                borderRadius="lg"
                                p={1.5}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Icon as={Smartphone} boxSize={4} color="white" />
                            </Box>
                            <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color={colors.textHeading}
                            >
                                Install App
                            </Text>
                        </HStack>
                        <IconButton
                            aria-label="Dismiss"
                            icon={<X size={14} />}
                            size="xs"
                            variant="ghost"
                            color={colors.textMuted}
                            onClick={dismiss}
                            _hover={{ bg: colors.bgHover }}
                        />
                    </HStack>

                    <Text fontSize="xs" color={colors.textSecondary} mb={3} lineHeight="short">
                        Install this app on your device for a better experience — faster access, offline support, and more.
                    </Text>

                    <HStack spacing={2}>
                        <Button
                            size="sm"
                            leftIcon={<Download size={14} />}
                            bgGradient="linear(135deg, brand.600, brand.500)"
                            color="white"
                            fontWeight="semibold"
                            borderRadius="lg"
                            flex={1}
                            _hover={{
                                bgGradient: 'linear(135deg, brand.700, brand.600)',
                            }}
                            onClick={handleInstall}
                        >
                            Install
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            color={colors.textMuted}
                            fontWeight="medium"
                            borderRadius="lg"
                            _hover={{ bg: colors.bgHover }}
                            onClick={dismiss}
                        >
                            Later
                        </Button>
                    </HStack>
                </Box>
            </Box>
        </SlideFade>
    );
}
