import {
  Box,
  Button,
  Card,
  CardHeader,
  CardBody,
  Heading,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useToast,
  Flex,
  Text,
  InputGroup,
  Select,
  InputRightElement,
  Stack,
  Checkbox,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../axios";

import {
  GET_ALL_LOCATIONS,
  GET_ALL_ROLES,
  UPDATE_USER,
  GET_EDIT_USER,
} from "../../routes/apiRoutes";

import {
  DASHBOARD_PATH,
  USER_LIST_PATH,
} from "../../routes/superAdminRoutes";

const UserEdit = () => {
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
  } = useForm();

  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  const [locations, setLocations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [allowLogin, setAllowLogin] = useState(1);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        allow_login: allowLogin,
      };

      const res = await api.put(UPDATE_USER(id), payload);

      toast({
        position: "bottom-right",
        title: res.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate(USER_LIST_PATH);
    } catch (err) {
      const errorResponse = err?.response?.data;

      if (errorResponse?.errors) {
        const errorMessage = Object.values(errorResponse.errors)
          .flat()
          .join(" ");

        toast({
          position: "bottom-right",
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else if (errorResponse?.message) {
        toast({
          position: "bottom-right",
          title: "Error",
          description: errorResponse.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const app_name = localStorage.getItem("app_name");
    document.title = `${app_name} | User Edit`;
  }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        const [locationRes, roleRes, userRes] = await Promise.all([
          api.get(GET_ALL_LOCATIONS),
          api.get(GET_ALL_ROLES),
          api.get(GET_EDIT_USER(id)),
        ]);

        setLocations(locationRes.data.data);
        setRoles(roleRes.data.data);

        const user = userRes.data.data;

        reset({
          surname: user.surname,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          email: user.email,
          status: user.status,
          role: user.roles?.[0]?.id || "",
          locations:
            user.permissions
              ?.filter((permission) =>
                permission.name.startsWith("location.")
              )
              .map((permission) =>
                Number(permission.name.split(".")[1])
              ) || [],
        });

        setAllowLogin(user.allow_login);
      } catch (error) {
        console.log(error);
      }
    };

    getData();
  }, [id, reset]);

  return (
    <Box className="form-dark-surface" bg="gray.50" minH="100vh" py={3}>
      <Box mx="auto">
        <Card mb={4} bg="white" shadow="sm" borderRadius="lg" border="none">
          <CardBody py={3}>
            <Breadcrumb fontSize="sm" color="gray.500">
              <BreadcrumbItem>
                <BreadcrumbLink
                  as={ReactRouterLink}
                  to={DASHBOARD_PATH}
                  fontWeight="medium"
                  _hover={{ color: "teal.500" }}
                >
                  {t("dashboard")}
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem>
                <BreadcrumbLink
                  as={ReactRouterLink}
                  to={USER_LIST_PATH}
                  fontWeight="medium"
                  _hover={{ color: "teal.500" }}
                >
                  {t("list")}
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink color="gray.800" fontWeight="bold">
                  {t("edit")}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </CardBody>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card shadow="xl" borderRadius="xl" overflow="hidden" bg="white">
            <CardHeader
              bg="white"
              borderBottom="1px solid"
              borderColor="gray.100"
              pb={6}
            >
              <Flex justify="space-between" align="center">
                <Box>
                  <Heading size="sm" color="gray.800" fontWeight="bold">
                    {t("edit")}
                  </Heading>

                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Update user information
                  </Text>
                </Box>

                <Button
                  colorScheme="teal"
                  as={ReactRouterLink}
                  to={USER_LIST_PATH}
                  variant="outline"
                  display={{ base: "none", md: "inline-flex" }}
                  size="sm"
                  fontWeight="600"
                >
                  {t("list")}
                </Button>
              </Flex>
            </CardHeader>

            <CardBody p={8}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <FormControl isRequired>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.700"
                    mb={2}
                  >
                    {t("surname")}
                  </FormLabel>

                  <Input
                    {...register("surname", { required: true })}
                    type="text"
                    placeholder={t("surname")}
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    focusBorderColor="teal.500"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.700"
                    mb={2}
                  >
                    {t("first_name")}
                  </FormLabel>

                  <Input
                    {...register("first_name", { required: true })}
                    type="text"
                    placeholder={t("first_name")}
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    focusBorderColor="teal.500"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.700"
                    mb={2}
                  >
                    {t("last_name")}
                  </FormLabel>

                  <Input
                    {...register("last_name", { required: true })}
                    type="text"
                    placeholder={t("last_name")}
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    focusBorderColor="teal.500"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.700"
                    mb={2}
                  >
                    {t("status")}
                  </FormLabel>

                  <Select
                    {...register("status", { required: true })}
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    focusBorderColor="teal.500"
                  >
                    <option value="active">{t("active")}</option>
                    <option value="inactive">{t("inactive")}</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </CardBody>
          </Card>

          <Card
            shadow="xl"
            borderRadius="xl"
            mt={5}
            overflow="hidden"
            bg="white"
          >
            <CardBody p={8}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <FormControl isRequired>
                  <FormLabel>{t("username")}</FormLabel>

                  <Input
                    {...register("username", { required: true })}
                    type="text"
                    placeholder={t("username")}
                    bg="gray.50"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>{t("email")}</FormLabel>

                  <Input
                    {...register("email", { required: true })}
                    type="email"
                    placeholder={t("email")}
                    bg="gray.50"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Password</FormLabel>

                  <InputGroup size="md">
                    <Input
                      {...register("password")}
                      pr="4.5rem"
                      type={show ? "text" : "password"}
                      placeholder="Leave blank to keep current password"
                    />

                    <InputRightElement width="4.5rem">
                      <Button h="1.75rem" size="sm" onClick={handleClick}>
                        {show ? "Hide" : "Show"}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <Stack spacing={5} mt={10} direction="row">
                    <Checkbox
                      isChecked={allowLogin === 1}
                      onChange={(e) =>
                        setAllowLogin(e.target.checked ? 1 : 0)
                      }
                    >
                      Allow Login
                    </Checkbox>

                    <input
                      type="hidden"
                      {...register("allow_login")}
                      value={allowLogin}
                    />
                  </Stack>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>{t("role")}</FormLabel>

                  <Select
                    {...register("role", { required: true })}
                    bg="gray.50"
                  >
                    {roles.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <Controller
                  name="locations"
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <Stack spacing={3} mt={4}>
                      {locations?.map((item) => (
                        <Checkbox
                          key={item.id}
                          value={item.id}
                          isChecked={field.value.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([
                                ...field.value,
                                item.id,
                              ]);
                            } else {
                              field.onChange(
                                field.value.filter(
                                  (locationId) =>
                                    locationId !== item.id
                                )
                              );
                            }
                          }}
                          colorScheme="teal"
                        >
                          {item.name}
                        </Checkbox>
                      ))}
                    </Stack>
                  )}
                />
              </SimpleGrid>

              <Flex
                mt={10}
                justify={{ base: "stretch", md: "flex-end" }}
                gap={4}
              >
                <Button
                  type="button"
                  as={ReactRouterLink}
                  to={USER_LIST_PATH}
                  colorScheme="gray"
                  variant="outline"
                  fontWeight="semibold"
                  px={6}
                  h={12}
                  borderRadius="md"
                  w={{ base: "full", md: "auto" }}
                >
                  {t("cancel")}
                </Button>

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  loadingText="Updating..."
                  colorScheme="teal"
                  bg="teal.500"
                  color="white"
                  fontWeight="semibold"
                  px={8}
                  h={12}
                  borderRadius="md"
                  w={{ base: "full", md: "auto" }}
                >
                  {t("update")}
                </Button>
              </Flex>
            </CardBody>
          </Card>
        </form>
      </Box>
    </Box>
  );
};

export default UserEdit;
