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
    Textarea,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    useToast,
    Flex,
    Text,
    Divider,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import {
    HRM_EMPLOYEE_LIST_PATH,
    DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";
import {
    STORE_EMPLOYEE,
    GET_EMPLOYEE,
    UPDATE_EMPLOYEE,
    LIST_DEPARTMENT,
    LIST_DESIGNATION,
    LIST_BRANCH,
} from "../../../routes/apiRoutes";
import api from "../../../axios";
import useThemeColors from "../../../hooks/useThemeColors";

const inputProps = (colors) => ({
    bg: colors.bgInput,
    border: "1px solid",
    borderColor: colors.borderInput,
    borderRadius: "md",
    focusBorderColor: "teal.500",
    _hover: { borderColor: "gray.300" },
    size: "md",
    transition: "all 0.2s",
});

const SectionHeader = ({ title, colors }) => (
    <Box mb={4} mt={2}>
        <Text fontSize="sm" fontWeight="bold" color="teal.500" textTransform="uppercase" letterSpacing="wider">
            {title}
        </Text>
        <Divider mt={2} borderColor={colors.borderSubtle} />
    </Box>
);

const EmployeeCreate = () => {
    const colors = useThemeColors();
    const { register, handleSubmit, reset } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [deptRes, desigRes, branchRes] = await Promise.all([
                    api.get(LIST_DEPARTMENT, { params: { per_page: 200 } }),
                    api.get(LIST_DESIGNATION, { params: { per_page: 200 } }),
                    api.get(LIST_BRANCH, { params: { per_page: 500 } }),
                ]);
                setDepartments(deptRes.data?.data?.data || deptRes.data?.data || []);
                setDesignations(desigRes.data?.data?.data || desigRes.data?.data || []);
                setBranches(branchRes.data?.data?.data || branchRes.data?.data || []);
            } catch (err) {
                console.error("Failed to fetch options", err);
            }
        };
        fetchOptions();
    }, []);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | ${isEdit ? "Employee Update" : "Employee Create"}`;
    }, [isEdit]);

    useEffect(() => {
        if (isEdit) {
            api.get(GET_EMPLOYEE(id))
                .then((res) => {
                    const emp = res.data?.data || res.data?.data?.data;
                    if (emp) {
                        reset({
                            branch_id: emp?.branch_id ?? "",
                            department_id: emp?.department_id ?? "",
                            designation_id: emp?.designation_id ?? "",
                            employee_id: emp?.employee_id ?? "",
                            first_name: emp?.first_name ?? "",
                            last_name: emp?.last_name ?? "",
                            email: emp?.email ?? "",
                            phone: emp?.phone ?? "",
                            address: emp?.address ?? "",
                            city: emp?.city ?? "",
                            state: emp?.state ?? "",
                            country: emp?.country ?? "",
                            postal_code: emp?.postal_code ?? "",
                            date_of_birth: emp?.date_of_birth?.split("T")[0] ?? "",
                            date_of_joining: emp?.date_of_joining?.split("T")[0] ?? "",
                            gender: emp?.gender ?? "",
                            employment_type: emp?.employment_type ?? "",
                            emergency_contact_name: emp?.emergency_contact_name ?? "",
                            emergency_contact_number: emp?.emergency_contact_number ?? "",
                            salary: emp?.salary ?? "",
                            overtime_rate: emp?.overtime_rate ?? "",
                            pf: emp?.pf ?? "",
                            tax: emp?.tax ?? "",
                            status: emp?.status ?? "active",
                        });
                    }
                })
                .catch(() => {});
        }
    }, [id, isEdit, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = isEdit
                ? await api.put(UPDATE_EMPLOYEE(id), data)
                : await api.post(STORE_EMPLOYEE, data);
            reset();
            toast({
                title: res.data.message || t(isEdit ? "employee_updated" : "employee_created"),
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(HRM_EMPLOYEE_LIST_PATH);
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

    const ip = inputProps(colors);

    return (
        <Box className="form-dark-surface" bg={colors.bgSubtle} minH="100vh" py={3}>
            <Box mx="auto">
                <Card mb={4} bg={colors.bgCard} shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Breadcrumb fontSize="sm" color={colors.textSecondary}>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to={DASHBOARD_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>
                                    {t("dashboard")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to={HRM_EMPLOYEE_LIST_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>
                                    {t("employees")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color={colors.textPrimary} fontWeight="bold">
                                    {t(isEdit ? "edit_employee" : "add_employee")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={colors.bgCard}>
                    <CardHeader bg={colors.bgCard} borderBottom="1px solid" borderColor={colors.borderSubtle} pb={6}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">
                                    {t(isEdit ? "edit_employee" : "add_employee")}
                                </Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                                    {t(isEdit ? "update_employee_details" : "create_new_employee")}
                                </Text>
                            </Box>
                            <Button colorScheme="teal" as={ReactRouterLink} to={HRM_EMPLOYEE_LIST_PATH} variant="outline" display={{ base: "none", md: "inline-flex" }} size="sm" fontWeight="600">
                                {t("list")}
                            </Button>
                        </Flex>
                    </CardHeader>

                    <CardBody p={8}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Basic Information */}
                            <SectionHeader title={t("basic_information")} colors={colors} />
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("first_name")}</FormLabel>
                                    <Input {...register("first_name", { required: true })} placeholder={t("first_name")} {...ip} />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("last_name")}</FormLabel>
                                    <Input {...register("last_name", { required: true })} placeholder={t("last_name")} {...ip} />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("employee_id")}</FormLabel>
                                    <Input {...register("employee_id", { required: true })} placeholder="EMP-2024-0001" {...ip} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("email")}</FormLabel>
                                    <Input {...register("email")} type="email" placeholder={t("email")} {...ip} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("phone_number")}</FormLabel>
                                    <Input {...register("phone")} placeholder={t("phone_number")} {...ip} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("gender")}</FormLabel>
                                    <Select {...register("gender")} placeholder={t("select_gender")} {...ip}>
                                        <option value="male">{t("male")}</option>
                                        <option value="female">{t("female")}</option>
                                        <option value="other">{t("other")}</option>
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("date_of_birth")}</FormLabel>
                                    <Input {...register("date_of_birth")} type="date" {...ip} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("date_of_joining")}</FormLabel>
                                    <Input {...register("date_of_joining")} type="date" {...ip} />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("status")}</FormLabel>
                                    <Select {...register("status", { required: true })} {...ip}>
                                        <option value="active">{t("active")}</option>
                                        <option value="inactive">{t("inactive")}</option>
                                        <option value="terminated">{t("terminated")}</option>
                                    </Select>
                                </FormControl>
                            </SimpleGrid>

                            {/* Job Information */}
                            <SectionHeader title={t("job_information")} colors={colors} />
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("branch")}</FormLabel>
                                    <Select {...register("branch_id")} placeholder={t("select_branch")} {...ip}>
                                        {branches.map((b) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("department")}</FormLabel>
                                    <Select {...register("department_id")} placeholder={t("select_department")} {...ip}>
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("designation")}</FormLabel>
                                    <Select {...register("designation_id")} placeholder={t("select_designation")} {...ip}>
                                        {designations.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("employment_type")}</FormLabel>
                                    <Select {...register("employment_type")} placeholder={t("select_employment_type")} {...ip}>
                                        <option value="full_time">{t("full_time")}</option>
                                        <option value="part_time">{t("part_time")}</option>
                                        <option value="contract">{t("contract")}</option>
                                        <option value="intern">{t("intern")}</option>
                                    </Select>
                                </FormControl>
                            </SimpleGrid>

                            {/* Address */}
                            <SectionHeader title={t("address")} colors={colors} />
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
                                <FormControl gridColumn={{ base: "auto", md: "span 2", lg: "span 3" }}>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("address")}</FormLabel>
                                    <Textarea {...register("address")} placeholder={t("address")} rows={2} bg={colors.bgInput} border="1px solid" borderColor={colors.borderInput} borderRadius="md" focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }} transition="all 0.2s" />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("city")}</FormLabel>
                                    <Input {...register("city")} placeholder={t("city")} {...ip} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("state")}</FormLabel>
                                    <Input {...register("state")} placeholder={t("state")} {...ip} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("country")}</FormLabel>
                                    <Input {...register("country")} placeholder={t("country")} {...ip} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("postal_code")}</FormLabel>
                                    <Input {...register("postal_code")} placeholder={t("postal_code")} {...ip} />
                                </FormControl>
                            </SimpleGrid>

                            {/* Salary & Payroll */}
                            <SectionHeader title={t("salary_&_payroll")} colors={colors} />
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("salary")}</FormLabel>
                                    <Input {...register("salary")} type="number" min="0" step="0.01" placeholder="0.00" {...ip} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("overtime_rate")}</FormLabel>
                                    <Input {...register("overtime_rate")} type="number" min="0" step="0.01" placeholder="0.00" {...ip} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("pf")}</FormLabel>
                                    <Input {...register("pf")} type="number" min="0" step="0.01" placeholder="0.00" {...ip} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("tax")}</FormLabel>
                                    <Input {...register("tax")} type="number" min="0" step="0.01" placeholder="0.00" {...ip} />
                                </FormControl>
                            </SimpleGrid>

                            {/* Emergency Contact */}
                            <SectionHeader title={t("emergency_contact")} colors={colors} />
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("emergency_contact_name")}</FormLabel>
                                    <Input {...register("emergency_contact_name")} placeholder={t("emergency_contact_name")} {...ip} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("emergency_contact_number")}</FormLabel>
                                    <Input {...register("emergency_contact_number")} placeholder={t("emergency_contact_number")} {...ip} />
                                </FormControl>
                            </SimpleGrid>

                            {/* Action Buttons */}
                            <Flex mt={6} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                                <Button type="button" as={ReactRouterLink} to={HRM_EMPLOYEE_LIST_PATH} colorScheme="gray" variant="outline" fontWeight="semibold" px={6} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "gray.50" }}>
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

export default EmployeeCreate;
