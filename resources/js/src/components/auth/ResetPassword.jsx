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

export default function ResetPassword() {
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
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
                            Set new password
                        </Heading>
                        <Text color="gray.500" mt={2}>
                            Enter your email and new password below
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

                            <FormControl isInvalid={errors.token} display="none">
                                <Input {...register("token", { required: true })} value={reset_token} type="hidden" />
                            </FormControl>

                            <FormControl isInvalid={errors.password} isRequired>
                                <Flex align="center" gap={2} mb={2}>
                                    <Icon as={Lock} boxSize={4} color="gray.400" />
                                    <Text fontSize="sm" fontWeight="600" color="gray.700" _dark={{ color: "gray.300" }}>
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
