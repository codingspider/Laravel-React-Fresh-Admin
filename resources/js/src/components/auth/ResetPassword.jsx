import React, { useState } from "react";
import {
    Button,
    FormControl,
    Flex,
    Heading,
    Input,
    Text,
    useToast,
    VStack,
    Icon,
    Box,
    FormLabel,
    FormErrorMessage,
    InputGroup,
    InputRightElement,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { resettPassword } from "../../services/authService";
import { useParams, useNavigate } from "react-router-dom";
import { LOGIN } from "../../routes/commonRoutes";
import { UtensilsCrossed, Eye, EyeOff, Lock, Mail } from "lucide-react";
import useThemeColors from "../../hooks/useThemeColors";

export default function ResetPassword() {
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const colors = useThemeColors();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();
    const { reset_token } = useParams();
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        const { email, password, token } = data;
        try {
            const res = await resettPassword(email, password, token);
            reset();
            toast({
                position: "top-right",
                title: "Password Reset Successful",
                description: res.message || "You can now sign in with your new password.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(LOGIN);
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err.message || "Something went wrong";
            reset();
            toast({
                position: "top-right",
                title: "Password Reset Failed",
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
            bg={colors.bgPage}
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
                            color={colors.textHeading}
                        >
                            Set new password
                        </Heading>
                        <Text color="gray.500" mt={2}>
                            Enter your email and new password below
                        </Text>
                    </Box>
                </VStack>

                <Box
                    bg={colors.bgCard}
                    borderRadius="2xl"
                    boxShadow={colors.shadowModal}
                    border="1px solid"
                    borderColor={colors.borderSubtle}
                    p={{ base: 6, md: 8 }}
                    w="100%"
                >
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <VStack spacing={5}>
                            <FormControl isInvalid={errors.email} isRequired>
                                <Flex align="center" gap={2} mb={2}>
                                    <Icon as={Mail} boxSize={4} color="gray.400" />
                                    <Text fontSize="sm" fontWeight="600" color={colors.textLabel}>
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

                            <FormControl isInvalid={errors.token} display="none">
                                <Input {...register("token", { required: true })} value={reset_token} type="hidden" />
                            </FormControl>

                            <FormControl isInvalid={errors.password} isRequired>
                                <Flex align="center" gap={2} mb={2}>
                                    <Icon as={Lock} boxSize={4} color="gray.400" />
                                    <Text fontSize="sm" fontWeight="600" color={colors.textLabel}>
                                        New Password
                                    </Text>
                                </Flex>
                                <InputGroup size="lg">
                                    <Input
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: { value: 6, message: "Minimum 6 characters" },
                                        })}
                                        type={show ? "text" : "password"}
                                        placeholder="Enter new password"
                                        borderRadius="lg"
                                    />
                                    <InputRightElement>
                                        <Button variant="ghost" onClick={handleClick} size="sm" p={2} borderRadius="lg">
                                            <Icon as={show ? EyeOff : Eye} boxSize={4} color="gray.500" />
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
                            </FormControl>

                            <Button
                                isLoading={isSubmitting}
                                loadingText="Resetting password..."
                                type="submit"
                                variant="primary"
                                size="lg"
                                w="full"
                                h={12}
                            >
                                Reset Password
                            </Button>
                        </VStack>
                    </form>
                </Box>
            </VStack>
        </Flex>
    );
}
