import React, { useState } from "react";
import {
    Box,
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    Stepper,
    StepSeparator,
    StepStatus,
    StepTitle,
    useSteps,
    Button,
    Flex,
    Input,
    Heading,
    Text,
    VStack,
    useToast,
    Select,
    FormLabel,
    FormControl,
    InputGroup,
    InputRightElement,
    HStack,
    FormErrorMessage,
    SimpleGrid,
    Icon,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import { Link as ChakraLink } from "@chakra-ui/react";
import { LOGIN } from "../../routes/commonRoutes";
import { ArrowForwardIcon, ArrowBackIcon, CheckIcon } from "@chakra-ui/icons";
import { UtensilsCrossed, Eye, EyeOff } from "lucide-react";
import api from "../../axios";
import { STORE_BUSINESS_INFO } from "../../routes/apiRoutes";
import useThemeColors from "../../hooks/useThemeColors";

const Register = () => {
    const {
        register,
        handleSubmit,
        trigger,
        formState: { errors },
    } = useForm({ mode: "onBlur" });

    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);
    const navigate = useNavigate();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const colors = useThemeColors();

    const steps = [
        { title: "Restaurant", description: "Basic Info" },
        { title: "Account", description: "Create Login" },
    ];

    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: steps.length,
    });

    const handleNext = async () => {
        const fieldsToValidate = getFieldsForStep(activeStep);
        const isValid = await trigger(fieldsToValidate);
        if (isValid && activeStep < steps.length - 1) {
            setActiveStep(activeStep + 1);
        }
    };

    const handlePrev = () => {
        if (activeStep > 0) {
            setActiveStep(activeStep - 1);
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await api.post(STORE_BUSINESS_INFO, data);
            toast({
                title: "Account created!",
                description: "Your account has been created successfully. You can now log in.",
                status: "success",
                duration: 4000,
                isClosable: true,
            });
            navigate(LOGIN);
        } catch (error) {
            if (error.response?.status === 422) {
                const validationErrors = error.response.data.errors;
                Object.keys(validationErrors).forEach((field) => {
                    toast({
                        title: `${field} error`,
                        description: validationErrors[field][0],
                        status: "error",
                        duration: 4000,
                        isClosable: true,
                    });
                });
            } else {
                toast({
                    title: "Error",
                    description: error.response?.data?.message || "Something went wrong!",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFieldsForStep = (stepIndex) => {
        switch (stepIndex) {
            case 0:
                return ["restaurant_name"];
            case 1:
                return ["first_name", "username", "email_owner", "password"];
            default:
                return [];
        }
    };

    const inputBg = colors.bgInput;

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <VStack spacing={5} align="stretch">
                        <FormControl isInvalid={errors.restaurant_name} isRequired>
                            <FormLabel fontSize="sm" fontWeight="600">Restaurant Name</FormLabel>
                            <Input bg={inputBg} placeholder="e.g. My Restaurant" borderRadius="lg" {...register("restaurant_name", { required: "Restaurant name is required" })} />
                            <FormErrorMessage>{errors.restaurant_name?.message}</FormErrorMessage>
                        </FormControl>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl isInvalid={errors.phone}>
                                <FormLabel fontSize="sm" fontWeight="600">Phone</FormLabel>
                                <Input bg={inputBg} placeholder="+1 (555) 123-4567" borderRadius="lg" {...register("phone")} />
                                <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
                            </FormControl>
                            <FormControl isInvalid={errors.email}>
                                <FormLabel fontSize="sm" fontWeight="600">Restaurant Email</FormLabel>
                                <Input bg={inputBg} type="email" placeholder="info@restaurant.com" borderRadius="lg" {...register("email")} />
                                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                            </FormControl>
                        </SimpleGrid>

                        <FormControl isInvalid={errors.address}>
                            <FormLabel fontSize="sm" fontWeight="600">Address</FormLabel>
                            <Input bg={inputBg} placeholder="Street address" borderRadius="lg" {...register("address")} />
                            <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
                        </FormControl>

                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                            <FormControl isInvalid={errors.city}>
                                <FormLabel fontSize="sm" fontWeight="600">City</FormLabel>
                                <Input bg={inputBg} placeholder="City" borderRadius="lg" {...register("city")} />
                                <FormErrorMessage>{errors.city?.message}</FormErrorMessage>
                            </FormControl>
                            <FormControl isInvalid={errors.state}>
                                <FormLabel fontSize="sm" fontWeight="600">State</FormLabel>
                                <Input bg={inputBg} placeholder="State" borderRadius="lg" {...register("state")} />
                                <FormErrorMessage>{errors.state?.message}</FormErrorMessage>
                            </FormControl>
                            <FormControl isInvalid={errors.zip_code}>
                                <FormLabel fontSize="sm" fontWeight="600">Zip Code</FormLabel>
                                <Input bg={inputBg} placeholder="Zip" borderRadius="lg" {...register("zip_code")} />
                                <FormErrorMessage>{errors.zip_code?.message}</FormErrorMessage>
                            </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl isInvalid={errors.country}>
                                <FormLabel fontSize="sm" fontWeight="600">Country</FormLabel>
                                <Input bg={inputBg} placeholder="Country" borderRadius="lg" {...register("country")} />
                                <FormErrorMessage>{errors.country?.message}</FormErrorMessage>
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="600">Currency</FormLabel>
                                <Select bg={inputBg} borderRadius="lg" {...register("currency")}>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="INR">INR (₹)</option>
                                    <option value="BRL">BRL (R$)</option>
                                    <option value="CAD">CAD (C$)</option>
                                    <option value="AUD">AUD (A$)</option>
                                </Select>
                            </FormControl>
                        </SimpleGrid>
                    </VStack>
                );

            case 1:
                return (
                    <VStack spacing={5} align="stretch">
                        <Text color="gray.500" fontSize="sm">
                            Create your admin account to manage the restaurant.
                        </Text>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl isInvalid={errors.first_name} isRequired>
                                <FormLabel fontSize="sm" fontWeight="600">First Name</FormLabel>
                                <Input bg={inputBg} placeholder="John" borderRadius="lg" {...register("first_name", { required: "First name is required" })} />
                                <FormErrorMessage>{errors.first_name?.message}</FormErrorMessage>
                            </FormControl>
                            <FormControl isInvalid={errors.last_name}>
                                <FormLabel fontSize="sm" fontWeight="600">Last Name</FormLabel>
                                <Input bg={inputBg} placeholder="Doe" borderRadius="lg" {...register("last_name")} />
                                <FormErrorMessage>{errors.last_name?.message}</FormErrorMessage>
                            </FormControl>
                        </SimpleGrid>

                        <FormControl isInvalid={errors.username} isRequired>
                            <FormLabel fontSize="sm" fontWeight="600">Username</FormLabel>
                            <Input bg={inputBg} placeholder="johndoe123" borderRadius="lg" {...register("username", { required: "Username is required", minLength: { value: 4, message: "Minimum 4 characters" } })} />
                            <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.email_owner} isRequired>
                            <FormLabel fontSize="sm" fontWeight="600">Email Address</FormLabel>
                            <Input
                                bg={inputBg}
                                type="email"
                                placeholder="john@example.com"
                                borderRadius="lg"
                                {...register("email_owner", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address",
                                    },
                                })}
                            />
                            <FormErrorMessage>{errors.email_owner?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.password} isRequired>
                            <FormLabel fontSize="sm" fontWeight="600">Password</FormLabel>
                            <InputGroup size="md">
                                <Input
                                    bg={inputBg}
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 6, message: "Minimum 6 characters" },
                                    })}
                                    type={show ? "text" : "password"}
                                    placeholder="Enter password"
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
                    </VStack>
                );

            default:
                return null;
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
            <Box w="full" maxW="700px" mx="auto">
                <VStack spacing={6} mb={8}>
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
                        <Heading size="xl" fontWeight="bold" color={colors.textHeading}>
                            Create your account
                        </Heading>
                        <Text color="gray.500" mt={2}>
                            Set up your restaurant and start taking orders
                        </Text>
                    </Box>
                </VStack>

                <Box
                    bg={colors.bgCard}
                    borderRadius="2xl"
                    boxShadow="lg"
                    border="1px solid"
                    borderColor={colors.borderSubtle}
                    p={{ base: 6, md: 8 }}
                >
                    <Flex justify="space-between" align="center" mb={6}>
                        <Text fontSize="sm" color="gray.500">
                            Step {activeStep + 1} of {steps.length}
                        </Text>
                        <ChakraLink
                            as={ReactRouterLink}
                            to={LOGIN}
                            fontSize="sm"
                            fontWeight="500"
                            color="brand.600"
                            _hover={{ color: "brand.700" }}
                        >
                            Already have an account? Sign in
                        </ChakraLink>
                    </Flex>

                    <Stepper size="sm" index={activeStep} mb={8} colorScheme="teal">
                        {steps.map((step, index) => (
                            <Step key={index}>
                                <StepIndicator>
                                    <StepStatus
                                        complete={<StepIcon />}
                                        incomplete={<StepNumber />}
                                        active={<StepNumber />}
                                    />
                                </StepIndicator>
                                <Box flexShrink="0">
                                    <StepTitle>{step.title}</StepTitle>
                                    <StepDescription>{step.description}</StepDescription>
                                </Box>
                                {index !== steps.length - 1 && <StepSeparator />}
                            </Step>
                        ))}
                    </Stepper>

                    <Box minH="300px">
                        <Heading size="sm" mb={4} color={colors.textLabel}>
                            {steps[activeStep].title}
                        </Heading>
                        <Box
                            p={{ base: 4, md: 6 }}
                            bg={colors.bgSubtle}
                            borderRadius="xl"
                            border="1px solid"
                            borderColor={colors.borderSubtle}
                        >
                            {renderStepContent()}
                        </Box>
                    </Box>

                    <Flex mt={8} justify="space-between">
                        <Button
                            onClick={handlePrev}
                            isDisabled={activeStep === 0}
                            variant="ghost"
                            leftIcon={<ArrowBackIcon />}
                            borderRadius="lg"
                        >
                            Back
                        </Button>

                        {activeStep === steps.length - 1 ? (
                            <Button
                                variant="primary"
                                onClick={handleSubmit(onSubmit)}
                                isLoading={isSubmitting}
                                loadingText="Creating..."
                                rightIcon={<CheckIcon />}
                                borderRadius="lg"
                            >
                                Create Account
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={handleNext}
                                rightIcon={<ArrowForwardIcon />}
                                borderRadius="lg"
                            >
                                Next Step
                            </Button>
                        )}
                    </Flex>
                </Box>
            </Box>
        </Flex>
    );
};

export default Register;
