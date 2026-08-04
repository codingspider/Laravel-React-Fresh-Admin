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
import { Eye, EyeOff, UtensilsCrossed } from 'lucide-react';
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

    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            bg={bgLight}
            p={{ base: 4, md: 8 }}
        >
            <Stack spacing={8} mx="auto" maxW="lg" w="100%">
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
                            Welcome back
                        </Heading>
                        <Text color={colors.textSecondary} mt={2}>
                            Sign in to your restaurant dashboard
                        </Text>
                    </Box>
                </VStack>

                <Box
                    bg={cardBg}
                    borderRadius="2xl"
                    boxShadow={cardShadow}
                    border="1px solid"
                    borderColor={cardBorder}
                    p={{ base: 6, md: 8 }}
                >
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={5}>
                            <FormControl id="login" isInvalid={errors.login}>
                                <FormLabel fontSize="sm" fontWeight="600" color={colors.textLabel}>
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
                                <FormLabel fontSize="sm" fontWeight="600" color={colors.textLabel}>
                                    Password
                                </FormLabel>
                                <InputGroup size="lg">
                                    <Input
                                        {...register('password', { required: 'Password is required' })}
                                        type={show ? 'text' : 'password'}
                                        placeholder="Enter your password"
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

                            <Flex justify="space-between" align="center">
                                <Checkbox
                                    {...register('remember')}
                                    size="sm"
                                    colorScheme="brand"
                                >
                                    <Text fontSize="sm" color={colors.textSecondary}>
                                        Remember me
                                    </Text>
                                </Checkbox>
                                <ChakraLink
                                    as={ReactRouterLink}
                                    to={FORGOT}
                                    fontSize="sm"
                                    color="brand.600"
                                    fontWeight="500"
                                    _hover={{ color: 'brand.700' }}
                                >
                                    Forgot password?
                                </ChakraLink>
                            </Flex>

                            <Button
                                isLoading={isSubmitting}
                                loadingText="Signing in..."
                                type="submit"
                                variant="primary"
                                size="lg"
                                w="full"
                                h={12}
                                fontSize="md"
                            >
                                Sign in
                            </Button>
                        </Stack>
                    </form>

                    <Flex justify="center" mt={6}>
                        <Text fontSize="sm" color={colors.textSecondary}>
                            Don't have an account?{' '}
                            <ChakraLink
                                as={ReactRouterLink}
                                to={REGISTER}
                                color="brand.600"
                                fontWeight="600"
                                _hover={{ color: 'brand.700' }}
                            >
                                Sign up
                            </ChakraLink>
                        </Text>
                    </Flex>
                </Box>
            </Stack>
        </Flex>
    );
}
