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
    Select,
    Divider,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    HStack,
    useToast,
    Flex,
    VStack,
    Text,
} from "@chakra-ui/react";

import { BsFillTrash3Fill } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import { useForm, useFieldArray } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, Link as ReactRouterLink } from "react-router-dom";

import {
    ADMIN_DASHBOARD_PATH,
    VARIATION_LIST_PATH
} from "../../../routes/adminRoutes";

import {
    GET_ALL_BRANCHES,
    STORE_VARIATION
} from "../../../routes/apiRoutes";

import api from "../../../axios";
import useThemeColors from "../../../hooks/useThemeColors";

const VariationCreate = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const colors = useThemeColors();

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { isSubmitting },
    } = useForm({
        defaultValues: {
            name: "",
            branch_id: "",
            lines: [
                { name: "", price: "" }
            ]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "lines",
    });

    const [branches, setBranches] = useState([]);

    const getBranches = async () => {
        const res = await api.get(GET_ALL_BRANCHES);
        setBranches(res.data.data || []);
    };

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Variation Create`;
        getBranches();
    }, []);

    const onSubmit = async (data) => {
        try {
            const res = await api.post(STORE_VARIATION, data);

            toast({
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            reset();
            navigate(VARIATION_LIST_PATH);

        } catch (err) {
            const errorResponse = err?.response?.data;
            const errorMessage =
                errorResponse?.errors
                    ? Object.values(errorResponse.errors).flat().join(" ")
                    : errorResponse?.message || "Something went wrong";

            toast({
                title: t("error"),
                description: errorMessage,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Box py={3}>
            <Box mx="auto">
                <Card mb={4} bg={colors.bgCard} shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Breadcrumb fontSize="sm" color={colors.textSecondary}>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to={ADMIN_DASHBOARD_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>
                                    {t("dashboard")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to={VARIATION_LIST_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>
                                    {t("list")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color={colors.textPrimary} fontWeight="bold">
                                    {t("add")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={colors.bgCard}>
                    <CardHeader bg={colors.bgCard} borderBottom="1px solid" borderColor={colors.borderSubtle} pb={6}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">{t("add")}</Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>{t("create_new_variation")}</Text>
                            </Box>
                            <Button colorScheme="teal" as={ReactRouterLink} to={VARIATION_LIST_PATH} variant="outline" display={{ base: "none", md: "inline-flex" }} size="sm" fontWeight="600">
                                {t("list")}
                            </Button>
                        </Flex>
                    </CardHeader>

                    <CardBody p={8}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("name")}
                                    </FormLabel>
                                    <Input
                                        type="text"
                                        {...register("name", { required: true })}
                                        placeholder={t("name")}
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
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                        {t("branches")}
                                    </FormLabel>
                                    <Select
                                        placeholder={t("select_branch")}
                                        {...register("branch_id", { required: true })}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </SimpleGrid>

                            <VStack spacing={4} align="stretch" mt={8}>
                                {fields.map((item, index) => (
                                    <Box key={item.id} p={4} bg={colors.bgSubtle} border="1px solid" borderColor={colors.borderSubtle} borderRadius="md">
                                        <HStack spacing={4}>
                                            <FormControl>
                                                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                                    {t("name")}
                                                </FormLabel>
                                                <Input
                                                    type="text"
                                                    {...register(`lines.${index}.name`, { required: true })}
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

                                            <FormControl>
                                                <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                                                    {t("price")}
                                                </FormLabel>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    {...register(`lines.${index}.price`, { required: true })}
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

                                            {fields.length > 1 && (
                                                <Button
                                                    mt={6}
                                                    colorScheme="red"
                                                    onClick={() => remove(index)}
                                                >
                                                    <BsFillTrash3Fill />
                                                </Button>
                                            )}
                                        </HStack>
                                    </Box>
                                ))}

                                <Button
                                    colorScheme="teal"
                                    variant="outline"
                                    onClick={() => append({ name: "", price: "" })}
                                >
                                    {t("add_row")}
                                </Button>

                                <Divider />
                            </VStack>

                            <Flex mt={10} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                                <Button type="button" as={ReactRouterLink} to={VARIATION_LIST_PATH} colorScheme="gray" variant="outline" fontWeight="semibold" px={6} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "gray.50" }}>
                                    {t("cancel")}
                                </Button>
                                <Button type="submit" isLoading={isSubmitting} loadingText={t("saving_data")} colorScheme="teal" bg="teal.500" color="white" fontWeight="semibold" px={8} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "teal.600" }} _active={{ bg: "teal.700" }} boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)">
                                    {t("save")}
                                </Button>
                            </Flex>
                        </form>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default VariationCreate;
