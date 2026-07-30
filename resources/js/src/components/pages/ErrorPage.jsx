import React from "react";
import {
    Flex,
    VStack,
    Heading,
    Text,
    Button,
    Icon,
} from "@chakra-ui/react";
import { Link as ReactRouterLink } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { DASHBOARD_PATH } from "../../routes/superAdminRoutes";
import useThemeColors from "../../hooks/useThemeColors";

const ErrorPage = () => {
    const colors = useThemeColors();
    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            bg={colors.bgPage}
            p={{ base: 4, md: 8 }}
        >
            <VStack spacing={6} textAlign="center" maxW="md">
                <Flex
                    bg="orange.50"
                    color="orange.500"
                    w={20}
                    h={20}
                    borderRadius="2xl"
                    align="center"
                    justify="center"
                    _dark={{ bg: "orange.900", color: "orange.300" }}
                >
                    <Icon as={AlertTriangle} boxSize={10} />
                </Flex>

                <VStack spacing={2}>
                    <Heading
                        size="xl"
                        fontWeight="bold"
                        color={colors.textHeading}
                    >
                        Something went wrong
                    </Heading>
                    <Text color="gray.500">
                        An unexpected error occurred. Please try again or contact support if the problem persists.
                    </Text>
                </VStack>

                <Button
                    as={ReactRouterLink}
                    to={DASHBOARD_PATH}
                    variant="primary"
                    leftIcon={<Icon as={ArrowLeft} boxSize={4} />}
                    size="lg"
                    borderRadius="lg"
                >
                    Go to Dashboard
                </Button>
            </VStack>
        </Flex>
    );
};

export default ErrorPage;
