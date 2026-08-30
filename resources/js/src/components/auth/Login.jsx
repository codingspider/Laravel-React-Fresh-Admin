import React, { useState, useEffect } from 'react';
import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    Checkbox,
    Stack,
    Button,
    Heading,
    Text,
    InputRightElement,
    InputGroup,
    useToast,
    HStack,
    Icon,
    VStack,
    Link,
    Spinner,
} from '@chakra-ui/react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Link as ChakraLink } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FORGOT, REGISTER } from '../../routes/commonRoutes';
import { usePermission } from '../../context/PermissionContext';
import api from '../../axios';
import { DASHBOARD_PATH } from './../../routes/superAdminRoutes';
import { Eye, EyeOff, UtensilsCrossed, ClipboardList, DollarSign, Shield, Check } from 'lucide-react';
import useThemeColors from '../../hooks/useThemeColors';

export default function Login() {
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { setUserPermission } = usePermission();
    const [checkedAuth, setCheckedAuth] = useState(false);
    const colors = useThemeColors();

    const bgLight = colors.bgPage;
    const cardBg = colors.bgCard;
    const cardShadow = colors.shadowModal;
    const cardBorder = colors.borderSubtle;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/user');
                if (res.data) {
                    navigate(DASHBOARD_PATH, { replace: true });
                }
            } catch (err) {
                console.log('not logged in');
            } finally {
                setCheckedAuth(true);
            }
        };
        fetchUser();
    }, []);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = await api.post('/login', {
                login: data.login,
                password: data.password,
            });

            toast({
                title: 'Welcome back!',
                description: 'You have been logged in successfully.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            localStorage.setItem('app_name', res.data.app_name);

            // Fetch user permissions before navigating
            try {
                const userRes = await api.get('/user');
                setUserPermission(userRes.data);
            } catch (e) {
                // Permission fetch failed, navigate anyway
            }

            navigate(DASHBOARD_PATH);
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err.message || 'Something went wrong';
            toast({
                title: 'Login failed',
                description: errorMessage,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!checkedAuth) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg={bgLight}>
                <Spinner size="xl" color="brand.500" />
            </Flex>
        );
    }

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

    return (
        <Flex minH="100vh" bg={bgLight}>
            {/* ── Left Sidebar (hidden on mobile) ── */}
            <Box
                display={{ base: 'none', lg: 'flex' }}
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
                        {import.meta.env.VITE_APP_NAME}
                    </Text>
                </Flex>

                {/* Marketing copy */}
                <Box position="relative" maxW="md">
                    <Heading
                        as="h2"
                        fontSize={{ lg: '3xl', xl: '4xl' }}
                        fontWeight="extrabold"
                        lineHeight="1.15"
                        letterSpacing="tight"
                        color="white"
                    >
                        Manage smarter. Run your whole restaurant.
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
                    display={{ base: 'flex', lg: 'none' }}
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
                        {import.meta.env.VITE_APP_NAME}
                    </Text>
                </Flex>

                {/* Form Card */}
                <Box
                    w="100%"
                    maxW="md"
                    bg={cardBg}
                    borderRadius="2xl"
                    boxShadow={cardShadow}
                    border="1px solid"
                    borderColor={cardBorder}
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
                                    Log in
                                </Box>
                            </Heading>
                            <Text mt={1} fontSize="sm" color={colors.textSecondary}>
                                Sign in to your restaurant dashboard
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
                                {['Real-time order tracking', 'Revenue analytics', 'Multi-branch support'].map((item) => (
                                    <HStack as="li" key={item} spacing={1.5} display="inline-flex" alignItems="center">
                                        <Icon as={Check} boxSize={3.5} color="brand.600" flexShrink={0} />
                                        <Text as="span" fontSize="xs" fontWeight="medium" color={colors.textSecondary}>
                                            {item}
                                        </Text>
                                    </HStack>
                                ))}
                            </HStack>
                        </Box>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Stack spacing={4}>
                                <FormControl id="login" isInvalid={errors.login}>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel}>
                                        Email or Username
                                    </FormLabel>
                                    <Input
                                        type="text"
                                        {...register('login', { required: 'Email or username is required' })}
                                        size="lg"
                                        placeholder="Enter your email or username"
                                        borderRadius="lg"
                                    />
                                </FormControl>

                                <FormControl id="password" isInvalid={errors.password}>
                                    <Flex justify="space-between" align="center" mb={1.5}>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textLabel} mb={0}>
                                            Password
                                        </FormLabel>
                                        <ChakraLink
                                            as={ReactRouterLink}
                                            to={FORGOT}
                                            fontSize="xs"
                                            fontWeight="medium"
                                            color="brand.600"
                                            _hover={{ color: 'brand.700', textDecoration: 'underline' }}
                                        >
                                            Forgot password?
                                        </ChakraLink>
                                    </Flex>
                                    <InputGroup size="lg">
                                        <Input
                                            {...register('password', { required: 'Password is required' })}
                                            type={show ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            borderRadius="lg"
                                        />
                                        <InputRightElement>
                                            <Button
                                                variant="ghost"
                                                onClick={handleClick}
                                                size="sm"
                                                p={2}
                                                borderRadius="lg"
                                            >
                                                <Icon as={show ? EyeOff : Eye} boxSize={4} color={colors.textMuted} />
                                            </Button>
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>

                                <Button
                                    isLoading={isSubmitting}
                                    loadingText="Signing in..."
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    w="full"
                                    h={12}
                                    fontSize="md"
                                    fontWeight="semibold"
                                    borderRadius="xl"
                                    mt={2}
                                    bgGradient="linear(135deg, brand.600, brand.500)"
                                    _hover={{
                                        bgGradient: "linear(135deg, brand.700, brand.600)",
                                        filter: 'brightness(1.06)',
                                    }}
                                >
                                    Log in
                                </Button>

                                <Text textAlign="center" fontSize="sm" color={colors.textSecondary}>
                                    New to {import.meta.env.VITE_APP_NAME}?{' '}
                                    <ChakraLink
                                        as={ReactRouterLink}
                                        to={REGISTER}
                                        fontWeight="medium"
                                        color="brand.600"
                                        _hover={{ color: 'brand.700', textDecoration: 'underline' }}
                                    >
                                        Create an account
                                    </ChakraLink>
                                </Text>
                            </Stack>
                        </form>
                    </Stack>
                </Box>

                {/* Footer */}
                <Text mt={6} textAlign="center" fontSize="xs" color={colors.textSecondary}>
                    © {import.meta.env.VITE_APP_NAME} · <ChakraLink _hover={{ color: colors.textPrimary }}>Privacy</ChakraLink> · <ChakraLink _hover={{ color: colors.textPrimary }}>Terms</ChakraLink>
                </Text>
            </Flex>
        </Flex>
    );
}
