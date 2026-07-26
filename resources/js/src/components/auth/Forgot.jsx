import React, { useState } from "react";
import {
    Button,
    FormControl,
    Flex,
    Heading,
    Input,
    Text,
    useColorModeValue,
    useToast,
    VStack,
    Icon,
    Box,
    FormErrorMessage,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { Link as ReactRouterLink } from "react-router-dom";
import { Link as ChakraLink } from "@chakra-ui/react";
import { forgotPassword } from "../../services/authService";
import { LOGIN } from "../../routes/commonRoutes";
import { UtensilsCrossed, Mail, ArrowLeft } from "lucide-react";

export default function Forgot() {
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        const { email } = data;
        try {
            await forgotPassword(email);
            reset();
            toast({
                position: "top-right",
                title: "Email sent!",
                description: "Check your inbox for the reset link.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err.message || "Something went wrong";
            reset();
            toast({
                position: "top-right",
                title: "Failed to send email",
                description: errorMessage,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            bg={useColorModeValue("gray.50", "gray.900")}
            p={{ base: 4, md: 8 }}
        >
            <VStack spacing={8} mx="auto" maxW="lg" w="100%">
                <VStack spacing={6} align="center">
                    <Flex
                        bg="brand.600"
                        color="white"
                        w={14}
                        h={14}
                        borderRadius="2xl"
                        align="center"
                        justify="center"
                    >
                        <Icon as={UtensilsCrossed} boxSize={7} />
                    </Flex>
                    <Box textAlign="center">
                        <Heading
                            size="xl"
                            fontWeight="bold"
                            color="gray.800"
                            _dark={{ color: "white" }}
                        >
                            Forgot your password?
                        </Heading>
                        <Text color="gray.500" mt={2}>
                            Enter your email and we'll send you a reset link
                        </Text>
                    </Box>
                </VStack>

                <Box
                    bg={useColorModeValue("white", "gray.800")}
                    borderRadius="2xl"
                    boxShadow={useColorModeValue("lg", "2xl")}
                    border="1px solid"
                    borderColor={useColorModeValue("gray.100", "gray.700")}
                    p={{ base: 6, md: 8 }}
                    w="100%"
                >
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <VStack spacing={5}>
                            <FormControl isInvalid={errors.email}>
                                <FormControl isInvalid={errors.email} isRequired>
                                    <Flex align="center" gap={2} mb={2}>
                                        <Icon as={Mail} boxSize={4} color="gray.400" />
                                        <Text fontSize="sm" fontWeight="600" color="gray.700" _dark={{ color: "gray.300" }}>
                                            Email Address
                                        </Text>
                                    </Flex>
                                    <Input
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address",
                                            },
                                        })}
                                        type="email"
                                        placeholder="your-email@example.com"
                                        size="lg"
                                        borderRadius="lg"
                                    />
                                    <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                                </FormControl>
                            </FormControl>

                            <Button
                                isLoading={isSubmitting}
                                loadingText="Sending reset link..."
                                type="submit"
                                variant="primary"
                                size="lg"
                                w="full"
                                h={12}
                            >
                                Send Reset Link
                            </Button>
                        </VStack>
                    </form>

                    <Flex justify="center" mt={6}>
                        <ChakraLink
                            as={ReactRouterLink}
                            to={LOGIN}
                            fontSize="sm"
                            color="brand.600"
                            fontWeight="500"
                            display="flex"
                            align="center"
                            gap={1.5}
                            _hover={{ color: "brand.700" }}
                        >
                            <Icon as={ArrowLeft} boxSize={3.5} />
                            Back to sign in
                        </ChakraLink>
                    </Flex>
                </Box>
            </VStack>
        </Flex>
    );
}
