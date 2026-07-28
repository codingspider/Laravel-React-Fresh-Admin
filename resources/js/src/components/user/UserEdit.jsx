import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link as ReactRouterLink } from "react-router-dom";
import {
    Box,
    useToast,
    SimpleGrid,
    FormControl,
    FormLabel,
    Input,
    Select,
    Spinner,
    Card,
    CardHeader,
    CardBody,
    Flex,
    Heading,
    Text,
    Button,
    InputGroup,
    InputRightElement,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import api from "../../axios";
import { GET_ALL_ROLES, UPDATE_USER, GET_EDIT_USER } from "../../routes/apiRoutes";
import { DASHBOARD_PATH, USER_LIST_PATH } from "../../routes/superAdminRoutes";

const UserEdit = () => {
    const { id } = useParams();
    const { register, handleSubmit, reset } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roles, setRoles] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const toast = useToast();
    const navigate = useNavigate();
    const [show, setShow] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingData(true);
                const [roleRes, userRes] = await Promise.all([
                    api.get(GET_ALL_ROLES),
                    api.get(GET_EDIT_USER(id)),
                ]);
                setRoles(roleRes.data?.data || roleRes.data || []);
                const user = userRes.data?.data || userRes.data;
                reset({
                    name: user.name,
                    email: user.email,
                    role: user.roles?.[0]?.id || "",
                });
            } catch (err) {
                console.error("fetchData error:", err);
                toast({ position: "bottom-right", title: t("error_loading_data"), status: "error", duration: 3000, isClosable: true });
            } finally {
                setIsLoadingData(false);
            }
        };
        if (id) fetchData();
    }, [id, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = await api.put(UPDATE_USER(id), data);
            toast({ position: "bottom-right", title: res.data.message || t("success"), status: "success", duration: 3000, isClosable: true });
            navigate(USER_LIST_PATH);
        } catch (err) {
            const errorResponse = err?.response?.data;
            if (errorResponse?.errors) {
                const errorMessage = Object.values(errorResponse.errors).flat().join(" ");
                toast({ position: "bottom-right", title: t("error"), description: errorMessage, status: "error", duration: 3000, isClosable: true });
            } else if (errorResponse?.message) {
                toast({ position: "bottom-right", title: t("error"), description: errorResponse.message, status: "error", duration: 3000, isClosable: true });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Edit User`;
    }, []);

    if (isLoadingData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
                <Spinner size="xl" color="teal.500" />
            </Box>
        );
    }

    return (
        <Box bg="gray.50" minH="100vh" py={3}>
            <Box mx="auto">
                <Card mb={4} bg="white" shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Breadcrumb fontSize="sm" color="gray.500">
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to="/dashboard" fontWeight="medium" _hover={{ color: "teal.500" }}>{t("dashboard")}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to={USER_LIST_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>{t("users")}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color="gray.800" fontWeight="bold">{t("edit")}</BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg="white">
                    <CardHeader bg="white" borderBottom="1px solid" borderColor="gray.100" pb={6}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="sm" color="gray.800" fontWeight="bold">{t("edit_user")}</Heading>
                                <Text fontSize="sm" color="gray.500" mt={1}>{t("update_user_details")}</Text>
                            </Box>
                            <Button colorScheme="teal" as={ReactRouterLink} to={USER_LIST_PATH} variant="outline" display={{ base: "none", md: "inline-flex" }} size="sm" fontWeight="600">{t("users")}</Button>
                        </Flex>
                    </CardHeader>

                    <CardBody p={8}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>{t("name")}</FormLabel>
                                    <Input
                                        {...register("name", { required: true })}
                                        placeholder={t("enter_name")}
                                        bg="gray.50"
                                        border="1px solid"
                                        borderColor="gray.200"
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>{t("email")}</FormLabel>
                                    <Input
                                        {...register("email", { required: true })}
                                        type="email"
                                        placeholder={t("enter_email")}
                                        bg="gray.50"
                                        border="1px solid"
                                        borderColor="gray.200"
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>{t("password")}</FormLabel>
                                    <InputGroup size="md">
                                        <Input
                                            {...register("password", { minLength: 6 })}
                                            type={show ? "text" : "password"}
                                            placeholder={t("leave_blank_to_keep_current")}
                                            bg="gray.50"
                                            border="1px solid"
                                            borderColor="gray.200"
                                            borderRadius="md"
                                            focusBorderColor="teal.500"
                                            _hover={{ borderColor: "gray.300" }}
                                            transition="all 0.2s"
                                        />
                                        <InputRightElement width="4.5rem">
                                            <Button h="1.75rem" size="sm" onClick={() => setShow(!show)}>
                                                {show ? t("hide") : t("show")}
                                            </Button>
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>{t("role")}</FormLabel>
                                    <Select
                                        placeholder={t("select_role")}
                                        {...register("role", { required: true })}
                                        bg="gray.50"
                                        border="1px solid"
                                        borderColor="gray.200"
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        {roles.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </SimpleGrid>

                            <Flex mt={10} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                                <Button type="button" as={ReactRouterLink} to={USER_LIST_PATH} colorScheme="gray" variant="outline" fontWeight="semibold" px={6} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "gray.50" }}>{t("cancel")}</Button>
                                <Button type="submit" isLoading={isSubmitting} loadingText={t("saving")} colorScheme="teal" bg="teal.500" color="white" fontWeight="semibold" px={8} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "teal.600" }} _active={{ bg: "teal.700" }} boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)">{t("update")}</Button>
                            </Flex>
                        </form>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default UserEdit;
