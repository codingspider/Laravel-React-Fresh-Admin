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
    Stack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import { Link as ChakraLink } from "@chakra-ui/react";
import { LOGIN } from "../../routes/commonRoutes";
import { ArrowForwardIcon, ArrowBackIcon, CheckIcon } from "@chakra-ui/icons";
import { UtensilsCrossed, Eye, EyeOff, ClipboardList, DollarSign, Shield, Check } from "lucide-react";
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

    const features = [
        {
            icon: ClipboardList,
            title: 'Streamlined order management',
            desc: 'Take orders, track status, and manage your entire kitchen workflow in real time.',
        },
        {
            icon: DollarSign,
            title: 'Revenue that adds up — automatically',
            desc: 'Sales tracking, payment processing, and clear daily & monthly revenue statements.',
        },
        {
            icon: Shield,
            title: 'Reliable and secure operations',
            desc: 'Role-based access, encrypted data, and a complete audit trail for every transaction.',
        },
    ];

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <VStack spacing={5} align="stretch">
                        <FormControl isInvalid={errors.restaurant_name} isRequired>
                            <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel}>Restaurant Name</FormLabel>
                            <Input bg={inputBg} placeholder="e.g. My Restaurant" borderRadius="lg" {...register("restaurant_name", { required: "Restaurant name is required" })} />
                            <FormErrorMessage>{errors.restaurant_name?.message}</FormErrorMessage>
                        </FormControl>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl isInvalid={errors.phone}>
                                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel}>Phone</FormLabel>
                                <Input bg={inputBg} placeholder="+1 (555) 123-4567" borderRadius="lg" {...register("phone")} />
                                <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
                            </FormControl>
                            <FormControl isInvalid={errors.email}>
                                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel}>Restaurant Email</FormLabel>
                                <Input bg={inputBg} type="email" placeholder="info@restaurant.com" borderRadius="lg" {...register("email")} />
                                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                            </FormControl>
                        </SimpleGrid>

                        <FormControl isInvalid={errors.address}>
                            <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel}>Address</FormLabel>
                            <Input bg={inputBg} placeholder="Street address" borderRadius="lg" {...register("address")} />
                            <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
                        </FormControl>

                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                            <FormControl isInvalid={errors.city}>
                                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel}>City</FormLabel>
                                <Input bg={inputBg} placeholder="City" borderRadius="lg" {...register("city")} />
                                <FormErrorMessage>{errors.city?.message}</FormErrorMessage>
                            </FormControl>
                            <FormControl isInvalid={errors.state}>
                                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel}>State</FormLabel>
                                <Input bg={inputBg} placeholder="State" borderRadius="lg" {...register("state")} />
                                <FormErrorMessage>{errors.state?.message}</FormErrorMessage>
                            </FormControl>
                            <FormControl isInvalid={errors.zip_code}>
                                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel}>Zip Code</FormLabel>
                                <Input bg={inputBg} placeholder="Zip" borderRadius="lg" {...register("zip_code")} />
                                <FormErrorMessage>{errors.zip_code?.message}</FormErrorMessage>
                            </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl isInvalid={errors.country}>
                                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel}>Country</FormLabel>
                                <Input bg={inputBg} placeholder="Country" borderRadius="lg" {...register("country")} />
                                <FormErrorMessage>{errors.country?.message}</FormErrorMessage>
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel}>Currency</FormLabel>
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
                        <Text color={colors.textSecondary} fontSize="sm">
                            Create your admin account to manage the restaurant.
                        </Text>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl isInvalid={errors.first_name} isRequired>
                                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel}>First Name</FormLabel>
                                <Input bg={inputBg} placeholder="John" borderRadius="lg" {...register("first_name", { required: "First name is required" })} />
                                <FormErrorMessage>{errors.first_name?.message}</FormErrorMessage>
                            </FormControl>
                            <FormControl isInvalid={errors.last_name}>
                                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel}>Last Name</FormLabel>
                                <Input bg={inputBg} placeholder="Doe" borderRadius="lg" {...register("last_name")} />
                                <FormErrorMessage>{errors.last_name?.message}</FormErrorMessage>
                            </FormControl>
                        </SimpleGrid>

                        <FormControl isInvalid={errors.username} isRequired>
                            <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel}>Username</FormLabel>
                            <Input bg={inputBg} placeholder="johndoe123" borderRadius="lg" {...register("username", { required: "Username is required", minLength: { value: 4, message: "Minimum 4 characters" } })} />
                            <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.email_owner} isRequired>
                            <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel}>Email Address</FormLabel>
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
                            <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel}>Password</FormLabel>
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
                                        <Icon as={show ? EyeOff : Eye} boxSize={4} color={colors.textMuted} />
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
        <Flex minH="100vh" bg={colors.bgPage}>
            {/* ── Left Sidebar (hidden on mobile) ── */}
            <Box
                display={{ base: "none", lg: "flex" }}
                flex="1.1"
                bgGradient="linear(135deg, brand.700 0%, brand.600 50%, brand.500 100%)"
                position="relative"
                overflow="hidden"
                flexDirection="column"
                justify="space-between"
                p={{ lg: 12, xl: 16 }}
            >
                {/* Decorative blur circles */}
                <Box
                    pointerEvents="none"
                    position="absolute"
                    top="-24"
                    right="-24"
                    w="72"
                    h="72"
                    borderRadius="full"
                    bg="whiteAlpha.100"
                    filter="blur(3xl)"
                />
                <Box
                    pointerEvents="none"
                    position="absolute"
                    bottom="-32"
                    left="-16"
                    w="80"
                    h="80"
                    borderRadius="full"
                    bg="whiteAlpha.100"
                    filter="blur(3xl)"
                />

                {/* Logo */}
                <Flex as="a" href="/" align="center" gap={2.5} position="relative" textDecoration="none">
                    <Flex
                        align="center"
                        justify="center"
                        w={10}
                        h={10}
                        borderRadius="xl"
                        bg="whiteAlpha.150"
                        border="1px solid"
                        borderColor="whiteAlpha.250"
                        backdropFilter="blur(8px)"
                    >
                        <Icon as={UtensilsCrossed} color="white" boxSize={5} />
                    </Flex>
                    <Text color="white" fontSize="xl" fontWeight="extrabold" letterSpacing="tight">
                        RestaurantOS
                    </Text>
                </Flex>

                {/* Marketing copy */}
                <Box position="relative" maxW="md">
                    <Heading
                        as="h2"
                        fontSize={{ lg: "3xl", xl: "4xl" }}
                        fontWeight="extrabold"
                        lineHeight="1.15"
                        letterSpacing="tight"
                        color="white"
                    >
                        Manage smarter.
                        <br />
                        Run your whole restaurant.
                    </Heading>
                    <Text mt={4} fontSize="sm" lineHeight="relaxed" color="whiteAlpha.800">
                        One cloud workspace for restaurant owners — order management, revenue tracking, and complete business analytics.
                    </Text>

                    <VStack align="flex-start" mt={8} spacing={4}>
                        {features.map((f) => (
                            <HStack key={f.title} spacing={3} align="flex-start">
                                <Flex
                                    mt={0.5}
                                    shrink={0}
                                    align="center"
                                    justify="center"
                                    w={9}
                                    h={9}
                                    borderRadius="lg"
                                    bg="whiteAlpha.150"
                                    color="white"
                                    border="1px solid"
                                    borderColor="whiteAlpha.200"
                                >
                                    <Icon as={f.icon} boxSize={[4.5]} />
                                </Flex>
                                <Box>
                                    <Text fontSize="sm" fontWeight="semibold" color="white">
                                        {f.title}
                                    </Text>
                                    <Text fontSize="13px" lineHeight="snug" color="whiteAlpha.700">
                                        {f.desc}
                                    </Text>
                                </Box>
                            </HStack>
                        ))}
                    </VStack>
                </Box>

                <Text position="relative" fontSize="xs" color="whiteAlpha.600">
                    Multi-branch · Real-time analytics · Built for restaurant owners
                </Text>
            </Box>

            {/* ── Right Side: Form ── */}
            <Flex
                flex={{ base: 1, lg: 1 }}
                minH="100vh"
                direction="column"
                align="center"
                justify="center"
                px={{ base: 4, sm: 6 }}
                py={10}
            >
                {/* Mobile logo */}
                <Flex
                    as="a"
                    href="/"
                    display={{ base: "flex", lg: "none" }}
                    align="center"
                    gap={2}
                    mb={6}
                    textDecoration="none"
                >
                    <Flex
                        align="center"
                        justify="center"
                        w={9}
                        h={9}
                        borderRadius="xl"
                        bgGradient="linear(135deg, brand.600, brand.500)"
                        color="white"
                        shadow="soft"
                    >
                        <Icon as={UtensilsCrossed} boxSize={[4.5]} />
                    </Flex>
                    <Text fontSize="xl" fontWeight="extrabold" letterSpacing="tight" color={colors.textHeading}>
                        RestaurantOS
                    </Text>
                </Flex>

                {/* Form Card */}
                <Box
                    w="100%"
                    maxW="md"
                    bg={colors.bgCard}
                    borderRadius="2xl"
                    boxShadow="lg"
                    border="1px solid"
                    borderColor={colors.borderSubtle}
                    p={{ base: 6, sm: 8 }}
                >
                    <Stack spacing={6}>
                        {/* Header section */}
                        <Box>
                            <Flex
                                display="inline-flex"
                                align="center"
                                gap={1.5}
                                borderRadius="full"
                                border="1px solid"
                                borderColor="brand.200"
                                bg="brand.50"
                                px={2.5}
                                py={1}
                                mb={3}
                            >
                                <Text fontSize="11px" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="brand.700">
                                    Account
                                </Text>
                            </Flex>
                            <Heading
                                as="h1"
                                fontSize="2xl"
                                fontWeight="extrabold"
                                letterSpacing="tight"
                                color={colors.textHeading}
                            >
                                <Box
                                    as="span"
                                    bgGradient="linear(135deg, brand.600, brand.400)"
                                    bgClip="text"
                                >
                                    Create your account
                                </Box>
                            </Heading>
                            <Text mt={1} fontSize="sm" color={colors.textSecondary}>
                                Set up your restaurant and start taking orders
                            </Text>

                            {/* Feature checkmarks */}
                            <HStack
                                as="ul"
                                flexWrap="wrap"
                                spacing={0}
                                gapX={4}
                                gapY={1.5}
                                mt={3}
                                listStyleType="none"
                                p={0}
                            >
                                {["Real-time order tracking", "Revenue analytics", "Multi-branch support"].map((item) => (
                                    <HStack as="li" key={item} spacing={1.5} display="inline-flex" alignItems="center">
                                        <Icon as={Check} boxSize={3.5} color="brand.600" flexShrink={0} />
                                        <Text as="span" fontSize="xs" fontWeight="medium" color={colors.textSecondary}>
                                            {item}
                                        </Text>
                                    </HStack>
                                ))}
                            </HStack>
                        </Box>

                        {/* Step indicator & sign in link */}
                        <Flex justify="space-between" align="center">
                            <Text fontSize="sm" color={colors.textSecondary}>
                                Step {activeStep + 1} of {steps.length}
                            </Text>
                            <ChakraLink
                                as={ReactRouterLink}
                                to={LOGIN}
                                fontSize="xs"
                                fontWeight="medium"
                                color="brand.600"
                                _hover={{ color: "brand.700", textDecoration: "underline" }}
                            >
                                Already have an account? Sign in
                            </ChakraLink>
                        </Flex>

                        {/* Stepper */}
                        <Stepper size="sm" index={activeStep} colorScheme="teal">
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

                        {/* Step content */}
                        <Box minH="280px">
                            <Box
                                p={{ base: 4, md: 5 }}
                                bg={colors.bgSubtle}
                                borderRadius="xl"
                                border="1px solid"
                                borderColor={colors.borderSubtle}
                            >
                                {renderStepContent()}
                            </Box>
                        </Box>

                        {/* Navigation buttons */}
                        <Flex justify="space-between">
                            <Button
                                onClick={handlePrev}
                                isDisabled={activeStep === 0}
                                variant="ghost"
                                leftIcon={<ArrowBackIcon />}
                                borderRadius="lg"
                                h={12}
                                fontSize="md"
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
                                    borderRadius="xl"
                                    h={12}
                                    fontSize="md"
                                    fontWeight="semibold"
                                    bgGradient="linear(135deg, brand.600, brand.500)"
                                    _hover={{
                                        bgGradient: "linear(135deg, brand.700, brand.600)",
                                        filter: "brightness(1.06)",
                                    }}
                                >
                                    Create Account
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={handleNext}
                                    rightIcon={<ArrowForwardIcon />}
                                    borderRadius="xl"
                                    h={12}
                                    fontSize="md"
                                    fontWeight="semibold"
                                    bgGradient="linear(135deg, brand.600, brand.500)"
                                    _hover={{
                                        bgGradient: "linear(135deg, brand.700, brand.600)",
                                        filter: "brightness(1.06)",
                                    }}
                                >
                                    Next Step
                                </Button>
                            )}
                        </Flex>
                    </Stack>
                </Box>

                {/* Footer */}
                <Text mt={6} textAlign="center" fontSize="xs" color={colors.textSecondary}>
                    © RestaurantOS · <ChakraLink _hover={{ color: colors.textPrimary }}>Privacy</ChakraLink> · <ChakraLink _hover={{ color: colors.textPrimary }}>Terms</ChakraLink>
                </Text>
            </Flex>
        </Flex>
    );
};

export default Register;
