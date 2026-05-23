import React, { useState, useEffect } from 'react';
'use client';
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
  useColorModeValue,
  InputRightElement,
  InputGroup,
  useToast,
  HStack,
} from '@chakra-ui/react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Link as ChakraLink } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FORGOT, REGISTER } from '../../routes/commonRoutes';
import { usePermission } from '../../context/PermissionContext';
import api from '../../axios';
import { DASHBOARD_PATH } from './../../routes/superAdminRoutes';

export default function Login() {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUserPermission } = usePermission();
  const [checkedAuth, setCheckedAuth] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const fetchUser = async () => {
      try {
        await api.get("/sanctum/csrf-cookie");
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
        position: 'bottom-right',
        title: 'Login successful!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      localStorage.setItem("app_name", res.data.app_name);

      // Redirect all users to dashboard
      navigate(DASHBOARD_PATH);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err.message || 'Something went wrong';
      toast({
        position: 'bottom-right',
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

  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue('teal.50', 'teal.800')}>
      <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
        <Stack align="center">
          <Heading fontSize="4xl">Sign in to your account</Heading>
        </Stack>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box rounded="lg" bg={useColorModeValue('white', 'gray.700')} boxShadow="lg" p={8}>
            <Stack spacing={4}>
              <FormControl id="login">
                <FormLabel>Email or Username</FormLabel>
                <Input type="text" {...register('login', { required: true })} />
              </FormControl>

              <FormControl id="password">
                <FormLabel>Password</FormLabel>
                <InputGroup size="md">
                  <Input
                    {...register('password', { required: true })}
                    pr="4.5rem"
                    type={show ? 'text' : 'password'}
                    placeholder="Enter password"
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleClick}>
                      {show ? 'Hide' : 'Show'}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Stack spacing={10}>
                <Stack direction={{ base: 'column', sm: 'row' }} align="start" justify="space-between">
                  <Checkbox {...register('remember')}>Remember me</Checkbox>
                  <ChakraLink color="teal.500" as={ReactRouterLink} to={FORGOT}>
                    Forgot password?
                  </ChakraLink>
                </Stack>

                <Button
                  isLoading={isSubmitting}
                  loadingText="Signing in"
                  type="submit"
                  colorScheme="blue"
                  variant="solid"
                >
                  Sign in
                </Button>
              </Stack>
            </Stack>

            <HStack align="center" mt={2}>
              <Heading fontSize="sm">Don't have an account?</Heading>
              <ChakraLink color="teal.500" as={ReactRouterLink} to={REGISTER}>
                Sign up
              </ChakraLink>
            </HStack>
          </Box>
        </form>
      </Stack>
    </Flex>
  );
}