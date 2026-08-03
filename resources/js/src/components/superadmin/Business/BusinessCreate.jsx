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
import { DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import { GET_ALL_PLANS, GET_CURRENCIES, GET_TIMEZONES, STORE_BUSINESS } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";

const LIST_PATH = "/business/list";

const BusinessCreate = () => {
    const { register, handleSubmit, reset } = useForm();
    const { t } = useTranslation();
    const colors = useThemeColors();
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
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(`${LIST_PATH}`);
        } catch (err) {
            const errorResponse = err?.response?.data;
            if (errorResponse?.errors) {
                const errorMessage = Object.values(errorResponse.errors)
                    .flat()
                    .join(" ");
                toast({
                    title: t("error"),
                    description: errorMessage,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } else if (errorResponse?.message) {
                toast({
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
        <Box py={3}>
            <Box mx="auto">
                {/* Breadcrumb */}
                <Card mb={5} bg={colors.bgCard} shadow="sm" borderRadius="lg" border="none">
                    <CardBody>
                        <Breadcrumb fontSize="sm" color={colors.textSecondary}>
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
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink
                                    as={ReactRouterLink}
                                    to={LIST_PATH}
                                    color={colors.textPrimary}
                                    fontWeight="bold"
                                >
                                    {t("list")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                <Box>
                    <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={colors.bgCard}>
                        <CardHeader bg={colors.bgCard} borderBottom="1px solid" borderColor={colors.borderSubtle} pb={6}>
                            <Flex mb={2} justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Heading size="sm" color={colors.textPrimary} fontWeight="bold">{t("add")}</Heading>
                                    <Text fontSize="sm" color={colors.textSecondary} mt={1}>{t("create_new_business")}</Text>
                                </Box>
                                <Button
                                    variant="outline"
                                    as={ReactRouterLink}
                                    to={LIST_PATH}
                                    display={{ base: "none", md: "inline-flex" }}
                                    size="sm"
                                    fontWeight="600"
                                >
                                    {t("list")}
                                </Button>
                            </Flex>
                        </CardHeader>
                        <CardBody p={8}>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {/* Plan Info */}
                                <Text fontSize="2xl" mb={5}>{t('business_info')}</Text>
                                
                                <SimpleGrid
                                    columns={{ base: 1, md: 2 }}
                                    spacing={6}
                                >
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("business_name")}</FormLabel>
                                        <Input
                                            {...register("business_name", {
                                                required: true,
                                            })}
                                            type="text"
                                            placeholder={t("business_name")}
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
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("start_date")}</FormLabel>
                                        <Input
                                            {...register("start_date", {
                                                required: true,
                                            })}
                                            type="date"
                                            placeholder={t("start_date")}
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
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("currency")}</FormLabel>
                                        <Select
                                            {...register("currency_id")}
                                            bg={colors.bgInput}
                                            border="1px solid"
                                            borderColor={colors.borderInput}
                                            borderRadius="md"
                                            focusBorderColor="teal.500"
                                            _hover={{ borderColor: "gray.300" }}
                                            size="md"
                                            transition="all 0.2s"
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
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("timezone")}</FormLabel>
                                        <Select
                                            {...register("timezone_id")}
                                            bg={colors.bgInput}
                                            border="1px solid"
                                            borderColor={colors.borderInput}
                                            borderRadius="md"
                                            focusBorderColor="teal.500"
                                            _hover={{ borderColor: "gray.300" }}
                                            size="md"
                                            transition="all 0.2s"
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
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("contact_number")}</FormLabel>
                                        <Input
                                            {...register("contact_number", {
                                                required: true,
                                            })}
                                            type="number"
                                            placeholder={t("contact_number")}
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
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("country")}</FormLabel>
                                        <Input
                                            {...register("country", {
                                                required: true,
                                            })}
                                            type="text"
                                            placeholder={t("country")}
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
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("state")}</FormLabel>
                                        <Input
                                            {...register("state", {
                                                required: true,
                                            })}
                                            type="text"
                                            placeholder={t("state")}
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
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("city")}</FormLabel>
                                        <Input
                                            {...register("city", {
                                                required: true,
                                            })}
                                            type="text"
                                            placeholder={t("city")}
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
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("zip")}</FormLabel>
                                        <Input
                                            {...register("zip", {
                                                required: true,
                                            })}
                                            type="text"
                                            placeholder={t("zip")}
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
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("landmark")}</FormLabel>
                                        <Input
                                            {...register("landmark", {
                                                required: true,
                                            })}
                                            type="text"
                                            placeholder={t("landmark")}
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
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("status")}</FormLabel>
                                        <Select
                                            {...register("is_active")}
                                            defaultValue="1"
                                            bg={colors.bgInput}
                                            border="1px solid"
                                            borderColor={colors.borderInput}
                                            borderRadius="md"
                                            focusBorderColor="teal.500"
                                            _hover={{ borderColor: "gray.300" }}
                                            size="md"
                                            transition="all 0.2s"
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
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("name")}</FormLabel>
                                        <Input
                                            {...register("name", {
                                                required: true,
                                            })}
                                            type="text"
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
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("username")}</FormLabel>
                                        <Input
                                            {...register("username", {
                                                required: true,
                                            })}
                                            type="text"
                                            placeholder={t("username")}
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
                                            {...register("email", {
                                                required: true,
                                            })}
                                            type="email"
                                            placeholder={t("email")}
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
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("contact_no")}</FormLabel>
                                        <Input
                                            {...register("contact_no", {
                                                required: true,
                                            })}
                                            type="text"
                                            placeholder={t("contact_no")}
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

                                    <FormControl id="password">
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("password")}</FormLabel>
                                        <InputGroup size='md'>
                                        <Input
                                            {...register("password", { required: true })}
                                            pr='4.5rem'
                                            type={show ? 'text' : 'password'}
                                            placeholder='Enter password'
                                            bg={colors.bgInput}
                                            border="1px solid"
                                            borderColor={colors.borderInput}
                                            borderRadius="md"
                                            focusBorderColor="teal.500"
                                            _hover={{ borderColor: "gray.300" }}
                                            size="md"
                                            transition="all 0.2s"
                                        />
                                        <InputRightElement width='4.5rem'>
                                            <Button h='1.75rem' size='sm' onClick={handleClick}>
                                            {show ? 'Hide' : 'Show'}
                                            </Button>
                                        </InputRightElement>
                                        </InputGroup>
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("allow_login")}</FormLabel>
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
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("subscription_plan")}</FormLabel>
                                        <Select
                                            placeholder={t("select")}
                                            {...register("plan_id")}
                                            bg={colors.bgInput}
                                            border="1px solid"
                                            borderColor={colors.borderInput}
                                            borderRadius="md"
                                            focusBorderColor="teal.500"
                                            _hover={{ borderColor: "gray.300" }}
                                            size="md"
                                            transition="all 0.2s"
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
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("payment_method")}</FormLabel>
                                        <Select
                                            {...register("payment_method")}
                                            defaultValue="offline"
                                            bg={colors.bgInput}
                                            border="1px solid"
                                            borderColor={colors.borderInput}
                                            borderRadius="md"
                                            focusBorderColor="teal.500"
                                            _hover={{ borderColor: "gray.300" }}
                                            size="md"
                                            transition="all 0.2s"
                                        >
                                            <option value="offline">{t('offline')}</option>
                                            <option value="online"> {t('online')} </option>
                                        </Select>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("transaction_id")}</FormLabel>
                                        <Input
                                            {...register("transaction_id")}
                                            type="text"
                                            placeholder={t("transaction_id")}
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


                                </SimpleGrid>

                                <Flex mt={10} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                                    <Button type="button" as={ReactRouterLink} to={LIST_PATH} colorScheme="gray" variant="outline" fontWeight="semibold" px={6} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "gray.50" }}>
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
        </Box>
    );
};

export default BusinessCreate;
