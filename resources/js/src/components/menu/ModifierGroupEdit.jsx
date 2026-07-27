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
    FormErrorMessage,
    Input,
    Switch,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    useToast,
    Flex,
    Text,
    HStack,
    IconButton,
    Divider,
    Spinner,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm, useFieldArray } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import api from "../../axios";

const ModifierGroupEdit = () => {
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
        defaultValues: { modifiers: [{ name: "", price: "" }] },
    });
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const { fields, append, remove } = useFieldArray({ control, name: "modifiers" });
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = await api.put(`/v1/menu/modifier-groups/${id}`, data);
            toast({
                position: "bottom-right",
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate("/menu/modifier-groups");
        } catch (err) {
            const errorResponse = err?.response?.data;
            if (errorResponse?.errors) {
                const errorMessage = Object.values(errorResponse.errors)
                    .flat()
                    .join(" ");
                toast({
                    position: "bottom-right",
                    title: t("error"),
                    description: errorMessage,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } else if (errorResponse?.message) {
                toast({
                    position: "bottom-right",
                    title: t("error"),
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
        api.get(`/v1/menu/modifier-groups/${id}`)
            .then((res) => {
                const data = res.data.data;
                reset({
                    name: data.name,
                    max_selections: data.max_selections,
                    is_required: data.is_required,
                    modifiers: data.modifiers?.length
                        ? data.modifiers
                        : [{ name: "", price: "" }],
                });
            })
            .catch(() => {
                toast({
                    title: t("error"),
                    description: t("failed_to_load_modifier_group_data"),
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            })
            .finally(() => {
                setIsLoadingData(false);
            });
    }, [id]);

    return (
        <Box bg="gray.50" minH="100vh" py={3}>
            <Box mx="auto">
                <Card mb={4} bg="white" shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Breadcrumb fontSize="sm" color="gray.500">
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    as={ReactRouterLink}
                                    to="/dashboard"
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
                                    {t("dashboard")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    as={ReactRouterLink}
                                    to="/menu/modifier-groups"
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
                                    {t("update_modifier_group_details")}
                                </Text>
                            </Box>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to="/menu/modifier-groups"
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
                        {isLoadingData ? (
                            <Flex justify="center" align="center" h="40">
                                <Spinner size="lg" color="teal.500" />
                            </Flex>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                    <FormControl isRequired isInvalid={errors.name}>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                            {t("name")}
                                        </FormLabel>
                                        <Input
                                            {...register("name", { required: true })}
                                            type="text"
                                            placeholder={t("name")}
                                            bg="gray.50"
                                            border="1px solid"
                                            borderColor="gray.200"
                                            borderRadius="md"
                                            focusBorderColor="teal.500"
                                            _hover={{ borderColor: "gray.300" }}
                                            size="md"
                                            transition="all 0.2s"
                                        />
                                        <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                            {t("max_selections")}
                                        </FormLabel>
                                        <Input
                                            {...register("max_selections", { valueAsNumber: true })}
                                            type="number"
                                            placeholder={t("max_selections")}
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
                                        <HStack>
                                            <Switch {...register("is_required")} colorScheme="teal" />
                                            <Text fontSize="sm" fontWeight="semibold" color="gray.700">{t("required")}</Text>
                                        </HStack>
                                    </FormControl>
                                </SimpleGrid>

                                <Divider my={8} borderColor="gray.200" />

                                <Text fontWeight="semibold" color="gray.700" mb={4} fontSize="sm">
                                    {t("modifiers")}
                                </Text>

                                {fields.map((field, index) => (
                                    <HStack key={field.id} mb={3} spacing={4}>
                                        <FormControl isInvalid={errors.modifiers?.[index]?.name} flex={3}>
                                            <Input
                                                {...register(`modifiers.${index}.name`, { required: true })}
                                                placeholder={t("modifier_name")}
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
                                        <FormControl isInvalid={errors.modifiers?.[index]?.price} flex={1}>
                                            <Input
                                                {...register(`modifiers.${index}.price`, { valueAsNumber: true })}
                                                type="number"
                                                step="0.01"
                                                placeholder={t("price")}
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
                                        <IconButton
                                            icon={<FiTrash2 />}
                                            colorScheme="red"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => remove(index)}
                                            isDisabled={fields.length === 1}
                                            mt={2}
                                        />
                                    </HStack>
                                ))}

                                <Button
                                    leftIcon={<FiPlus />}
                                    size="sm"
                                    variant="outline"
                                    mt={2}
                                    onClick={() => append({ name: "", price: "" })}
                                    colorScheme="teal"
                                >
                                    {t("add_modifier")}
                                </Button>

                                <Flex mt={10} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                                    <Button
                                        type="button"
                                        as={ReactRouterLink}
                                        to="/menu/modifier-groups"
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
                                </Flex>
                            </form>
                        )}
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default ModifierGroupEdit;
