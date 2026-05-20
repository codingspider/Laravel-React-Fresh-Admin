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
    Text,
    Checkbox,
    Stack,
    RadioGroup,
    Radio
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import { BUSINESS_LIST_PATH, DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import { GET_ALL_PLANS, GET_CURRENCIES, GET_TIMEZONES, STORE_BUSINESS } from "../../../routes/apiRoutes";

const BusinessCreate = () => {
    const { register, handleSubmit, reset } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const [currencies, setCurrency] = useState([]);
    const [timezones, setTimezone] = useState([]);
    const [plans, setPlans] = useState([]);
    const [show, setShow] = useState(false); 
    const handleClick = () => setShow(!show);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            console.log(data);
            const res = await api.post(STORE_BUSINESS, data);
            reset();
            toast({
                position: "bottom-right",
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(`${BUSINESS_LIST_PATH}`);
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

    const getCurrencies = async () => {
        const res = await api.get(GET_CURRENCIES);
        setCurrency(res.data.data);
    };
    
    const getTimezones = async () => {
        const res = await api.get(GET_TIMEZONES);
        setTimezone(res.data.data);
    };
    
    const getAllPlans = async () => {
        const res = await api.get(GET_ALL_PLANS);
        setPlans(res.data.data);
    };

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Business Management`;
        getCurrencies();
        getTimezones();
        getAllPlans();
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
                                to={BUSINESS_LIST_PATH}
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
                        <Flex mb={2} justifyContent="space-between">
                            <Heading size="md">{t("add")}</Heading>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to={BUSINESS_LIST_PATH}
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
                            <Text fontSize="2xl" mb={5}>{t('business_info')}</Text>
                            
                            <SimpleGrid
                                columns={{ base: 1, md: 2 }}
                                spacing={6}
                            >
                                <FormControl isRequired>
                                    <FormLabel>{t("business_name")}</FormLabel>
                                    <Input
                                        {...register("business_name", {
                                            required: true,
                                        })}
                                        type="text"
                                        placeholder={t("business_name")}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>{t("start_date")}</FormLabel>
                                    <Input
                                        {...register("start_date", {
                                            required: true,
                                        })}
                                        type="date"
                                        placeholder={t("start_date")}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>{t("currency")}</FormLabel>
                                    <Select
                                        {...register("currency_id")}
                                    >
                                        {currencies.map((currency) => (
                                            <option
                                                key={currency.id}
                                                value={currency.id}
                                            >
                                                {currency.key}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>{t("timezone")}</FormLabel>
                                    <Select
                                        {...register("timezone_id")}
                                    >
                                        {timezones.map((timezone) => (
                                            <option
                                                key={timezone.id}
                                                value={timezone.id}
                                            >
                                                {timezone.key}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>{t("contact_number")}</FormLabel>
                                    <Input
                                        {...register("contact_number", {
                                            required: true,
                                        })}
                                        type="number"
                                        placeholder={t("contact_number")}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>{t("country")}</FormLabel>
                                    <Input
                                        {...register("country", {
                                            required: true,
                                        })}
                                        type="text"
                                        placeholder={t("country")}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>{t("state")}</FormLabel>
                                    <Input
                                        {...register("state", {
                                            required: true,
                                        })}
                                        type="text"
                                        placeholder={t("state")}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>{t("city")}</FormLabel>
                                    <Input
                                        {...register("city", {
                                            required: true,
                                        })}
                                        type="text"
                                        placeholder={t("city")}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>{t("zip")}</FormLabel>
                                    <Input
                                        {...register("zip", {
                                            required: true,
                                        })}
                                        type="text"
                                        placeholder={t("zip")}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>{t("landmark")}</FormLabel>
                                    <Input
                                        {...register("landmark", {
                                            required: true,
                                        })}
                                        type="text"
                                        placeholder={t("landmark")}
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
                            </SimpleGrid>

                            <Text fontSize="2xl" mb={5} mt={5}>{t('owner_info')}</Text>

                            <SimpleGrid
                                columns={{ base: 1, md: 3 }}
                                spacing={6}
                                mt={5}
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
                                    <FormLabel>{t("username")}</FormLabel>
                                    <Input
                                        {...register("username", {
                                            required: true,
                                        })}
                                        type="text"
                                        placeholder={t("username")}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>{t("email")}</FormLabel>
                                    <Input
                                        {...register("email", {
                                            required: true,
                                        })}
                                        type="email"
                                        placeholder={t("email")}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>{t("contact_no")}</FormLabel>
                                    <Input
                                        {...register("contact_no", {
                                            required: true,
                                        })}
                                        type="text"
                                        placeholder={t("contact_no")}
                                    />
                                </FormControl>

                                <FormControl id="password">
                                              <FormLabel>Password</FormLabel>
                                    <InputGroup size='md'>
                                    <Input
                                        {...register("password", { required: true })}
                                        pr='4.5rem'
                                        type={show ? 'text' : 'password'}
                                        placeholder='Enter password'
                                    />
                                    <InputRightElement width='4.5rem'>
                                        <Button h='1.75rem' size='sm' onClick={handleClick}>
                                        {show ? 'Hide' : 'Show'}
                                        </Button>
                                    </InputRightElement>
                                    </InputGroup>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>{t("allow_login")}</FormLabel>
                                    <RadioGroup defaultValue='1'>
                                    <Stack spacing={5} direction='row'>
                                        <Radio {...register('allow_login')} colorScheme='green' value='1'>
                                        {t('yes')}
                                        </Radio>

                                        <Radio {...register('allow_login')} colorScheme='red' value='0'>
                                        {t('no')}
                                        </Radio>
                                  
                                    </Stack>
                                    </RadioGroup>
                                </FormControl>
                                

                            </SimpleGrid>
                            
                            <Text fontSize="2xl" mb={5} mt={5}>{t('payment_info')}</Text>

                            <SimpleGrid
                                columns={{ base: 1, md: 3 }}
                                spacing={6}
                                mt={5}
                            >

                                <FormControl isRequired>
                                    <FormLabel>{t("subscription_plan")}</FormLabel>
                                    <Select
                                        placeholder="Select"
                                        {...register("plan_id")}
                                    >
                                        {plans.map((plan) => (
                                            <option
                                                key={plan.id}
                                                value={plan.id}
                                            >
                                                {plan.name}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>{t("payment_method")}</FormLabel>
                                    <Select
                                        {...register("payment_method")}
                                        defaultValue="offline"
                                    >
                                        <option value="offline">{t('offline')}</option>
                                        <option value="online"> {t('online')} </option>
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>{t("transaction_id")}</FormLabel>
                                    <Input
                                        {...register("transaction_id")}
                                        type="text"
                                        placeholder={t("transaction_id")}
                                    />
                                </FormControl>


                            </SimpleGrid>

                            <HStack spacing={4} mt={6}>
                                <Button
                                    type="button"
                                    as={ReactRouterLink}
                                    to={BUSINESS_LIST_PATH}
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

export default BusinessCreate;
