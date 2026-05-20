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
    InputGroup,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    HStack,
    useToast,
    Flex,
    InputRightElement,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { PLAN_LIST_PATH, DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import { GET_EDIT_PLAN, UPDATE_PLAN } from "../../../routes/apiRoutes";

const PlanEdit = () => {
    const { register, handleSubmit, reset } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = await api.put(UPDATE_PLAN(id), data);
            reset();
            toast({
                position: "bottom-right",
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(`${PLAN_LIST_PATH}`);
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

    const getEditPlan = async () => {
        const res = await api.get(GET_EDIT_PLAN(id));
        const plan = res.data.data;
        reset({
            name: plan.name,
            price: plan.price,
            is_active: plan.is_active,
            billing_cycle: plan.billing_cycle,
            branch_limit: plan.branch_limit,
            user_limit: plan.user_limit,
            invoice_limit: plan.invoice_limit,
        });
    };

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Plan Edit`;
        getEditPlan();
    }, []);

    return (
        <>
            {/* Breadcrumb */}
            <Card mb={5}>
                <CardBody>
                    <Breadcrumb fontSize={{ base: "sm", md: "md" }}>
                        <BreadcrumbItem>
                            <BreadcrumbLink
                                as={ReactRouterLink}
                                to={DASHBOARD_PATH}
                            >
                                {t("dashboard")}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink
                                as={ReactRouterLink}
                                to={PLAN_LIST_PATH}
                            >
                                {t("list")}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                </CardBody>
            </Card>

            <Box>
                <Card shadow="md" borderRadius="2xl">
                    <CardHeader>
                        <Flex mb={4} justifyContent="space-between">
                            <Heading size="md">{t("add")}</Heading>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to={PLAN_LIST_PATH}
                                display={{ base: "none", md: "inline-flex" }}
                                px={4}
                                py={2}
                                whiteSpace="normal"
                                textAlign="center"
                            >
                                {t("list")}
                            </Button>
                        </Flex>
                    </CardHeader>
                    <CardBody>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Plan Info */}
                            <SimpleGrid
                                columns={{ base: 1, md: 2 }}
                                spacing={6}
                            >
                                <FormControl isRequired>
                                    <FormLabel>{t("name")}</FormLabel>
                                    <Input
                                        {...register("name", {
                                            required: true,
                                        })}
                                        type="text"
                                        placeholder={t("name")}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>{t("price")}</FormLabel>
                                    <Input
                                        {...register("price", {
                                            required: true,
                                        })}
                                        type="text"
                                        placeholder={t("price")}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>{t("status")}</FormLabel>
                                    <Select
                                        {...register("is_active")}
                                        defaultValue="1"
                                    >
                                        <option value="1">{t('active')}</option>
                                        <option value="0"> {t('inactive')} </option>
                                    </Select>
                                </FormControl>
                                
                                <FormControl isRequired>
                                    <FormLabel>{t("billing_cycle")}</FormLabel>
                                    <Select
                                        {...register("billing_cycle")}
                                        defaultValue="monthly"
                                    >
                                        <option value="monthly">{t('monthly')}</option>
                                        <option value="yearly"> {t('yearly')} </option>
                                    </Select>
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>{t("branch_limit")}</FormLabel>
                                    <Input
                                        {...register("branch_limit", {
                                            required: true,
                                        })}
                                        type="number"
                                        placeholder={t("branch_limit")}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>{t("user_limit")}</FormLabel>
                                    <Input
                                        {...register("user_limit", {
                                            required: true,
                                        })}
                                        type="number"
                                        placeholder={t("user_limit")}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>{t("invoice_limit")}</FormLabel>
                                    <Input
                                        {...register("invoice_limit", {
                                            required: true,
                                        })}
                                        type="number"
                                        placeholder={t("invoice_limit")}
                                    />
                                </FormControl>
                            </SimpleGrid>

                            <HStack spacing={4} mt={6}>
                                <Button
                                    type="button"
                                    as={ReactRouterLink}
                                    to={PLAN_LIST_PATH}
                                    colorScheme="orange"
                                    flex={1}
                                >
                                    {t("cancel")}
                                </Button>

                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    loadingText="Saving Data..."
                                    colorScheme="teal"
                                    flex={1}
                                >
                                    {t("save")}
                                </Button>
                            </HStack>
                        </form>
                    </CardBody>
                </Card>
            </Box>
        </>
    );
};

export default PlanEdit;
