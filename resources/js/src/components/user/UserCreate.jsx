import React, { useState, useEffect } from "react";
import { useNavigate, Link as ReactRouterLink } from "react-router-dom";
import {
    Box,
    useToast,
    SimpleGrid,
    FormControl,
    FormLabel,
    Input,
    Select,
    Spinner,
    Button,
    InputGroup,
    InputRightElement,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import api from "../../axios";
import { GET_ALL_ROLES, STORE_USER } from "../../routes/apiRoutes";
import { DASHBOARD_PATH, USER_LIST_PATH } from "../../routes/superAdminRoutes";
import useThemeColors from "../../hooks/useThemeColors";
import PageHeader from "../ui/PageHeader";

const UserCreate = () => {
    const colors = useThemeColors();
    const { register, handleSubmit, reset } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roles, setRoles] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const toast = useToast();
    const navigate = useNavigate();
    const [show, setShow] = useState(false);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setIsLoadingData(true);
                const res = await api.get(GET_ALL_ROLES);
                setRoles(res.data?.data || res.data || []);
            } catch (err) {
                console.error("fetchRoles error:", err);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchRoles();
    }, []);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = await api.post(STORE_USER, data);
            reset();
            toast({
                position: "top-right",
                title: res.data.message || t("success"),
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(USER_LIST_PATH);
        } catch (err) {
            const errorResponse = err?.response?.data;
            if (errorResponse?.errors) {
                const errorMessage = Object.values(errorResponse.errors).flat().join(" ");
                toast({ position: "top-right", title: t("error"), description: errorMessage, status: "error", duration: 3000, isClosable: true });
            } else if (errorResponse?.message) {
                toast({ position: "top-right", title: t("error"), description: errorResponse.message, status: "error", duration: 3000, isClosable: true });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Create User`;
    }, []);

    if (isLoadingData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
                <Spinner size="xl" color="teal.500" />
            </Box>
        );
    }

    return (
        <Box py={3}>
            <Box mx="auto">
                <PageHeader
                    title={t("add_user")}
                    subtitle={t("create_new_user")}
                    breadcrumbs={[
                        { label: t("dashboard"), path: DASHBOARD_PATH },
                        { label: t("users"), path: USER_LIST_PATH },
                        { label: t("add"), isCurrent: true },
                    ]}
                />

                <Box
                    bg={colors.bgCard}
                    shadow="xl"
                    borderRadius="xl"
                    overflow="hidden"
                    border="1px solid"
                    borderColor={colors.borderDefault}
                >
                    <Box p={8}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("name")}</FormLabel>
                                    <Input
                                        {...register("name", { required: true })}
                                        placeholder={t("enter_name")}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("email")}</FormLabel>
                                    <Input
                                        {...register("email", { required: true })}
                                        type="email"
                                        placeholder={t("enter_email")}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("password")}</FormLabel>
                                    <InputGroup size="md">
                                        <Input
                                            {...register("password", { required: true, minLength: 6 })}
                                            type={show ? "text" : "password"}
                                            placeholder={t("enter_password")}
                                            bg={colors.bgInput}
                                            border="1px solid"
                                            borderColor={colors.borderInput}
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("role")}</FormLabel>
                                    <Select
                                        placeholder={t("select_role")}
                                        {...register("role", { required: true })}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
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

                            <Box mt={10} display="flex" justifyContent={{ base: "stretch", md: "flex-end" }} gap={4}>
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
                                    _hover={{ bg: "gray.50" }}
                                >
                                    {t("cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    loadingText={t("saving")}
                                    colorScheme="teal"
                                    bg="teal.500"
                                    color="white"
                                    fontWeight="semibold"
                                    px={8}
                                    h={12}
                                    borderRadius="md"
                                    w={{ base: "full", md: "auto" }}
                                    _hover={{ bg: "teal.600" }}
                                    _active={{ bg: "teal.700" }}
                                    boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)"
                                >
                                    {t("save")}
                                </Button>
                            </Box>
                        </form>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default UserCreate;
