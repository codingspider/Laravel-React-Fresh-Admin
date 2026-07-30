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
    FormHelperText,
    SimpleGrid,
    Icon,
    Spinner,
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
        { title: "Business", description: "Basic Info" },
        { title: "Settings", description: "Preferences" },
        { title: "Admin", description: "Create Account" },
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
                position: "top-right",
                title: "Account created!",
                description: "Your account has been created successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(LOGIN);
        } catch (error) {
            if (error.response?.status === 422) {
                const validationErrors = error.response.data.errors;
                Object.keys(validationErrors).forEach((field) => {
                    toast({
                        position: "top-right",
                        title: `${field} error`,
                        description: validationErrors[field][0],
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                });
            } else {
                toast({
                    position: "top-right",
                    title: "Error",
                    description: "Something went wrong!",
                    status: "error",
                    duration: 3000,
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
                return ["name", "start_date", "currency", "country", "state", "city", "zip_code", "address"];
            case 1:
                return ["fy_start_month", "accounting_method"];
            case 2:
                return ["first_name", "last_name", "username", "email", "password"];
            default:
                return [];
        }
    };

    const renderStepContent = () => {
        const inputBg = colors.bgInput;

        switch (activeStep) {
            case 0:
                return (
                    <VStack spacing={5} align="stretch">
                        <FormControl isInvalid={errors.name} isRequired>
                            <FormLabel fontSize="sm" fontWeight="600">Business Name</FormLabel>
                            <Input bg={inputBg} placeholder="e.g. My Restaurant" {...register("name", { required: "Business name is required" })} borderRadius="lg" />
                            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                        </FormControl>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl isInvalid={errors.start_date} isRequired>
                                <FormLabel fontSize="sm" fontWeight="600">Start Date</FormLabel>
                                <Input type="date" bg={inputBg} borderRadius="lg" {...register("start_date", { required: "Start date is required" })} />
                                <FormErrorMessage>{errors.start_date?.message}</FormErrorMessage>
                            </FormControl>

                            <FormControl isInvalid={errors.currency} isRequired>
                                <FormLabel fontSize="sm" fontWeight="600">Currency</FormLabel>
                                <Select bg={inputBg} placeholder="Select currency" borderRadius="lg" {...register("currency", { required: "Currency is required" })}>
                                    <option value="1">USD ($)</option>
                                    <option value="2">EUR (€)</option>
                                    <option value="3">GBP (£)</option>
                                    <option value="4">INR (₹)</option>
                                </Select>
                                <FormErrorMessage>{errors.currency?.message}</FormErrorMessage>
                            </FormControl>
                        </SimpleGrid>

                        <FormControl isInvalid={errors.country} isRequired>
                            <FormLabel fontSize="sm" fontWeight="600">Country</FormLabel>
                            <Input bg={inputBg} placeholder="Country" borderRadius="lg" {...register("country", { required: "Country is required" })} />
                            <FormErrorMessage>{errors.country?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.address} isRequired>
                            <FormLabel fontSize="sm" fontWeight="600">Address</FormLabel>
                            <Input bg={inputBg} placeholder="Street Address" borderRadius="lg" {...register("address", { required: "Address is required" })} />
                            <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
                        </FormControl>

                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                            <FormControl isInvalid={errors.city} isRequired>
                                <FormLabel fontSize="sm" fontWeight="600">City</FormLabel>
                                <Input bg={inputBg} placeholder="City" borderRadius="lg" {...register("city", { required: "City is required" })} />
                                <FormErrorMessage>{errors.city?.message}</FormErrorMessage>
                            </FormControl>
                            <FormControl isInvalid={errors.state} isRequired>
                                <FormLabel fontSize="sm" fontWeight="600">State</FormLabel>
                                <Input bg={inputBg} placeholder="State" borderRadius="lg" {...register("state", { required: "State is required" })} />
                                <FormErrorMessage>{errors.state?.message}</FormErrorMessage>
                            </FormControl>
                            <FormControl isInvalid={errors.zip_code} isRequired>
                                <FormLabel fontSize="sm" fontWeight="600">Zip Code</FormLabel>
                                <Input bg={inputBg} placeholder="Zip" borderRadius="lg" {...register("zip_code", { required: "Zip code is required" })} />
                                <FormErrorMessage>{errors.zip_code?.message}</FormErrorMessage>
                            </FormControl>
                        </SimpleGrid>
                    </VStack>
                );

            case 1:
                return (
                    <VStack spacing={5} align="stretch">
                        <Text color="gray.500" fontSize="sm">
                            Configure your financial settings. You can change these later in settings.
                        </Text>

                        <FormControl isInvalid={errors.fy_start_month} isRequired>
                            <FormLabel fontSize="sm" fontWeight="600">Financial Start Month</FormLabel>
                            <Select bg={colors.bgInput} placeholder="Select month" borderRadius="lg" {...register("fy_start_month", { required: "Required" })}>
                                <option value="1">January</option>
                                <option value="2">February</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7">July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </Select>
                            <FormErrorMessage>{errors.fy_start_month?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.accounting_method} isRequired>
                            <FormLabel fontSize="sm" fontWeight="600">Stock Accounting Method</FormLabel>
                            <Select bg={colors.bgInput} placeholder="Select method" borderRadius="lg" {...register("accounting_method", { required: "Required" })}>
                                <option value="fifo">FIFO (First In, First Out)</option>
                                <option value="lifo">LIFO (Last In, First Out)</option>
                                <option value="weighted">Weighted Average</option>
                            </Select>
                            <FormHelperText>Choose how your inventory cost is calculated.</FormHelperText>
                            <FormErrorMessage>{errors.accounting_method?.message}</FormErrorMessage>
                        </FormControl>
                    </VStack>
                );

            case 2:
                return (
                    <VStack spacing={5} align="stretch">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl isInvalid={errors.first_name} isRequired>
                                <FormLabel fontSize="sm" fontWeight="600">First Name</FormLabel>
                                <Input bg={colors.bgInput} placeholder="John" borderRadius="lg" {...register("first_name", { required: "Required" })} />
                                <FormErrorMessage>{errors.first_name?.message}</FormErrorMessage>
                            </FormControl>
                            <FormControl isInvalid={errors.last_name} isRequired>
                                <FormLabel fontSize="sm" fontWeight="600">Last Name</FormLabel>
                                <Input bg={colors.bgInput} placeholder="Doe" borderRadius="lg" {...register("last_name", { required: "Required" })} />
                                <FormErrorMessage>{errors.last_name?.message}</FormErrorMessage>
                            </FormControl>
                        </SimpleGrid>

                        <FormControl isInvalid={errors.username} isRequired>
                            <FormLabel fontSize="sm" fontWeight="600">Username</FormLabel>
                            <Input bg={colors.bgInput} placeholder="johndoe123" borderRadius="lg" {...register("username", { required: "Required" })} />
                            <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.email} isRequired>
                            <FormLabel fontSize="sm" fontWeight="600">Email Address</FormLabel>
                            <Input
                                bg={colors.bgInput}
                                type="email"
                                placeholder="john@example.com"
                                borderRadius="lg"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address",
                                    },
                                })}
                            />
                            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.password} isRequired>
                            <FormLabel fontSize="sm" fontWeight="600">Password</FormLabel>
                            <InputGroup size="md">
                                <Input
                                    bg={colors.bgInput}
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
            <Box w="full" maxW="800px" mx="auto">
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
                            Complete the steps to launch your restaurant dashboard
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
                                loadingText="Submitting..."
                                rightIcon={<CheckIcon />}
                                borderRadius="lg"
                            >
                                Complete Registration
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
