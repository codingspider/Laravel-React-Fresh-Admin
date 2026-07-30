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
    Switch,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    HStack,
    useToast,
    Flex,
    Text,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../axios";
import { STORE_BRANCH } from "../../routes/apiRoutes";
import useThemeColors from "../../hooks/useThemeColors";

const BRANCH_LIST = '/branch/list';
const DASHBOARD_PATH = '/dashboard';

const BranchCreate = () => {
    const colors = useThemeColors();
    const { register, handleSubmit, reset } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = await api.post(STORE_BRANCH, data);
            reset();
            toast({
                position: "bottom-right",
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(`${BRANCH_LIST}`);
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
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Branch Management`;
    }, []);

    return (
        <Box className="form-dark-surface" bg={colors.bgSubtle} minH="100vh" py={3}>
            <Box mx="auto">

                {/* Modern Breadcrumb */}
                <Card mb={4} bg={colors.bgCard} shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
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
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    as={ReactRouterLink}
                                    to={BRANCH_LIST}
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
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

                {/* Main Form Card */}
                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={colors.bgCard}>
                    <CardHeader
                        bg={colors.bgCard}
                        borderBottom="1px solid"
                        borderColor={colors.borderSubtle}
                        pb={6}
                    >
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">
                                    {t("add")}
                                </Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                                    {t("create_new_branch")}
                                </Text>
                            </Box>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to={BRANCH_LIST}
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
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                <FormControl isRequired>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("name")}
                                    </FormLabel>
                                    <Input
                                        {...register("name", { required: true })}
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

                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("slug")}
                                    </FormLabel>
                                    <Input
                                        {...register("slug")}
                                        type="text"
                                        placeholder={t("auto-generated-from-name")}
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
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("email")}
                                    </FormLabel>
                                    <Input
                                        {...register("email")}
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

                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("phone")}
                                    </FormLabel>
                                    <Input
                                        {...register("phone")}
                                        type="text"
                                        placeholder={t("phone")}
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
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("address")}
                                    </FormLabel>
                                    <Input
                                        {...register("address")}
                                        type="text"
                                        placeholder={t("address")}
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
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("city")}
                                    </FormLabel>
                                    <Input
                                        {...register("city")}
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

                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("state")}
                                    </FormLabel>
                                    <Input
                                        {...register("state")}
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

                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("country")}
                                    </FormLabel>
                                    <Input
                                        {...register("country")}
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

                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("zip_code")}
                                    </FormLabel>
                                    <Input
                                        {...register("zip_code")}
                                        type="text"
                                        placeholder={t("zip_code")}
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
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("timezone")}
                                    </FormLabel>
                                    <Select
                                        {...register("timezone")}
                                        placeholder={t("select_timezone")}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        borderRadius="md"
                                        focusBorderColor="teal.500"
                                        _hover={{ borderColor: "gray.300" }}
                                        size="md"
                                        transition="all 0.2s"
                                    >
                                        <option value="UTC">{t("timezone_utc")}</option>
                                        <option value="America/New_York">{t("timezone_eastern")}</option>
                                        <option value="America/Chicago">{t("timezone_central")}</option>
                                        <option value="America/Denver">{t("timezone_mountain")}</option>
                                        <option value="America/Los_Angeles">{t("timezone_pacific")}</option>
                                        <option value="Europe/London">{t("timezone_london")}</option>
                                        <option value="Europe/Paris">{t("timezone_paris")}</option>
                                        <option value="Asia/Dubai">{t("timezone_dubai")}</option>
                                        <option value="Asia/Dhaka">{t("timezone_dhaka")}</option>
                                        <option value="Asia/Kolkata">{t("timezone_kolkata")}</option>
                                        <option value="Asia/Shanghai">{t("timezone_shanghai")}</option>
                                        <option value="Asia/Tokyo">{t("timezone_tokyo")}</option>
                                        <option value="Australia/Sydney">{t("timezone_sydney")}</option>
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("is_main")}
                                    </FormLabel>
                                    <HStack>
                                        <Switch
                                            {...register("is_main")}
                                            colorScheme="teal"
                                        />
                                        <Text fontSize="sm" color={colors.textSecondary}>
                                            {t("main_branch")}
                                        </Text>
                                    </HStack>
                                </FormControl>

                                <FormControl>
                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color={colors.textPrimary}
                                        mb={2}
                                    >
                                        {t("status")}
                                    </FormLabel>
                                    <HStack>
                                        <Switch
                                            {...register("is_active")}
                                            defaultChecked
                                            colorScheme="teal"
                                        />
                                        <Text fontSize="sm" color={colors.textSecondary}>
                                            {t("active")}
                                        </Text>
                                    </HStack>
                                </FormControl>
                            </SimpleGrid>

                            {/* Action Buttons */}
                            <Flex
                                mt={10}
                                justify={{ base: "stretch", md: "flex-end" }}
                                gap={4}
                            >
                                <Button
                                    type="button"
                                    as={ReactRouterLink}
                                    to={BRANCH_LIST}
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
                                    loadingText={t("saving_data")}
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
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default BranchCreate;
