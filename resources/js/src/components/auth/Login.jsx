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
    useColorModeValue,
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

export default function Login() {
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { setUserPermission } = usePermission();
    const [checkedAuth, setCheckedAuth] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                await api.get('/sanctum/csrf-cookie');
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
                position: 'top-right',
                title: 'Welcome back!',
                description: 'You have been logged in successfully.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            localStorage.setItem('app_name', res.data.app_name);
            navigate(DASHBOARD_PATH);
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err.message || 'Something went wrong';
            toast({
                position: 'top-right',
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
            <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.900')}>
                <Spinner size="xl" color="brand.500" />
            </Flex>
        );
    }

    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            bg={useColorModeValue('gray.50', 'gray.900')}
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
                            color="gray.800"
                            _dark={{ color: 'white' }}
                        >
                            Welcome back
                        </Heading>
                        <Text color="gray.500" mt={2}>
                            Sign in to your restaurant dashboard
                        </Text>
                    </Box>
                </VStack>

                <Box
                    bg={useColorModeValue('white', 'gray.800')}
                    borderRadius="2xl"
                    boxShadow={useColorModeValue('lg', '2xl')}
                    border="1px solid"
                    borderColor={useColorModeValue('gray.100', 'gray.700')}
                    p={{ base: 6, md: 8 }}
                >
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={5}>
                            <FormControl id="login" isInvalid={errors.login}>
                                <FormLabel fontSize="sm" fontWeight="600" color="gray.700" _dark={{ color: 'gray.300' }}>
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
                                <FormLabel fontSize="sm" fontWeight="600" color="gray.700" _dark={{ color: 'gray.300' }}>
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
                                            <Icon as={show ? EyeOff : Eye} boxSize={4} color="gray.500" />
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
                                    <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
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
                        <Text fontSize="sm" color="gray.500">
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
