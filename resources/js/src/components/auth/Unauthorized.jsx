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
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { LOGIN } from "../../routes/commonRoutes";
import useThemeColors from "../../hooks/useThemeColors";

const Unauthorized = () => {
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
                    bg="red.50"
                    color="red.500"
                    w={20}
                    h={20}
                    borderRadius="2xl"
                    align="center"
                    justify="center"
                    _dark={{ bg: "red.900", color: "red.300" }}
                >
                    <Icon as={ShieldAlert} boxSize={10} />
                </Flex>

                <VStack spacing={2}>
                    <Heading
                        size="xl"
                        fontWeight="bold"
                        color={colors.textHeading}
                    >
                        Access Denied
                    </Heading>
                    <Text color="gray.500">
                        You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
                    </Text>
                </VStack>
            </VStack>
        </Flex>
    );
};

export default Unauthorized;
